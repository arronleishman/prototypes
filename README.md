# High Volume Prototypes

Static site for HTML mocks: one landing page, shareable URLs, live updates via git deploy, and **feedback stored per prototype** (no email).

## Quick start (local)

```bash
cd ~/Desktop/prototypes
npx --yes serve .
```

Open the URL it prints. Don’t use `file://` — the manifest needs HTTP.

## How feedback works

- Each mock has its own thread (`feedback.html?id=practitioner-kanban`).
- Reviewers use the floating **Feedback** button on that mock only.
- On the hub, every card links to **Open** and that prototype’s **Feedback** inbox.
- Notes never mix across prototypes.

## Feedback store (shared across reviewers)

Static HTML can’t keep a shared inbox by itself. Use a free [Supabase](https://supabase.com) project (takes ~5 minutes):

1. Create a project → **SQL** → run:

```sql
create table feedback (
  id uuid primary key default gen_random_uuid(),
  prototype_id text not null,
  prototype_title text,
  name text,
  rating text,
  message text not null,
  page_url text,
  page_path text,
  created_at timestamptz default now()
);

create index on feedback (prototype_id, created_at desc);

alter table feedback enable row level security;
create policy "Anyone can read feedback" on feedback for select using (true);
create policy "Anyone can add feedback" on feedback for insert with check (true);
```

2. **Project Settings → API** → copy **Project URL** and **anon public** key into `config.js`:

```js
supabaseUrl: 'https://xxxx.supabase.co',
supabaseAnonKey: 'eyJhbGciOi...',
```

3. Commit, push, redeploy.

Until those keys are set, feedback still saves **per prototype in that browser only** (fine for your own testing).

### Optional screenshots

Feedback can include an optional UI screenshot (click an element or capture the page). Run this once in the Supabase SQL Editor so images sync for everyone:

```sql
alter table feedback
  add column if not exists screenshot_data text;
```

(Also in `supabase-screenshot.sql`.)

### First-party heatmaps, sessions & usability tests

Mocks record clicks, page views, scroll depth, repeated-click signals, and sessions automatically. Run `supabase-telemetry.sql` once in Supabase so data syncs across reviewers. Insights → Heatmaps then shows the interaction data (no Clarity required).

Prototype workspaces also include a **Test builder** tab. Designers using a Designer role link can create an ordered multi-task test with optional selector or URL success signals. Developers can view the builder and results but cannot edit them. When a test is active, the public mock shows a floating usability-test widget; participants can complete, skip, or report a problem without signing in.

Run `supabase-usability-tests.sql` once in Supabase after the telemetry schema. Usability results are visible in Insights → Usability and include completion rate, task drop-off, duration, reported problems, and repeated-click signals. Anonymous participants are identified only by a temporary browser session ID.

### Export

On each prototype’s Insights page, use **Export comments** to download a self-contained HTML file (comments + screenshots).

## Add a mock

1. Put the HTML in `mocks/` (e.g. `mocks/my-flow.html`).
2. On the root `<html>` tag:

```html
<html lang="en-GB" data-prototype-id="my-flow" data-prototype-title="My flow">
```

3. Before `</body>`:

```html
<script src="../config.js"></script>
<script src="../shared/feedback-store.js"></script>
<script src="../shared/feedback.js" defer></script>
```

4. Register in `manifest.json` (the `id` must match `data-prototype-id`):

```json
{
  "id": "my-flow",
  "title": "My flow",
  "description": "Short blurb for reviewers.",
  "path": "mocks/my-flow.html",
  "status": "active",
  "updated": "2026-08-07"
}
```

5. Push — share links keep working.

### Changelog (build to-dos)

Hub ⋯ menu → **Changelog** opens an internal to-do list per prototype:

- Annotated screenshots (select UI on the mock)
- Description of the change for developers
- **Mark done** / **Mark not done**

Run `supabase-changelog.sql` once in the Supabase SQL Editor so the list syncs across the team.

## Deploy (free)

### Cloudflare Pages

### Current repository and hosting

Repository: `https://github.com/dayshape/Prototypes-Design-App` (private)
Supabase remains the temporary backend for Auth, feedback, changelogs, telemetry, and private developer files.

GitHub Pages is not available for this private repository on the current plan. Supabase does not provide private static-site hosting for these HTML files, so use an organisation-approved static host until the Azure migration is complete. Do not publish the internal hub through a public Supabase Storage bucket.

### Cloudflare Pages (optional)

1. Push this repo to the private Dayshape repository (`dayshape/Prototypes-Design-App`).
2. [Cloudflare Pages](https://pages.cloudflare.com) → Connect repo.
3. Framework: **None** · Build command: empty · Output directory: `/` or blank.

### Netlify (optional)

Publish directory: `.` · No build command.

## Share with reviewers vs internal

- **Reviewers:** use **Share** on a hub card (or the mock URL). They get the mock only — can leave feedback, cannot open the hub or view threads.
- **Your team:** use **Copy hub link** on the hub (includes a secret `?key=`). That unlocks the hub + feedback inboxes.
- Change `internalAccessKey` in `config.js` anytime to revoke old hub links.

## Prototype workspaces and developer files

- Click a mock card to open its internal **Prototype workspace**. The workspace keeps the mock preview, Insights, Change log, curated Version history, and developer resources together.
- `Share`, `Open mock`, and `Download` are in the workspace header. The existing direct mock, `feedback.html`, and `changelog.html` URLs continue to work.
- To add a prototype manually, use **Add prototype** in the hub. Upload the HTML mock, then add Components, Code, Storybook, or Instructions from the workspace tabs.
- Run `supabase-prototype-library.sql` once in the Supabase SQL editor. The prototype library uses a private `prototype-artifacts` Storage bucket.
- Internal sharing is role-based: **Designer** links have full authoring access, while **Developer** links are read-only. Set `roleAccessUrl` in `config.js` to an approved server endpoint that exchanges the link for a short-lived Supabase capability token. Until that endpoint is configured, role links provide the UI access model but cannot securely authorize shared Supabase writes.
- Add `SUPABASE_SERVICE_ROLE_KEY` as a GitHub Actions secret (and optionally `SUPABASE_URL`; the workflow can read the checked-in URL). On pushes that change a file listed as a mock path in `manifest.json`, the Pages workflow records a `Push <short SHA>` entry in Version history using the commit message and changed files. Re-running a workflow does not duplicate a version.
- Use the workflow’s `sync_all_versions` input for a one-time baseline snapshot of every repository-backed mock after the SQL migration. The **Add version** button remains available for curated milestones that are not tied to a push.
- The old `internalAccessKey` is still useful as a navigation gate, but it is not a security boundary. Role links must be backed by server-issued capability tokens and RLS policies; query-string roles alone are only a presentation-layer fallback.

## Security migration

The Azure migration, containment, data-protection gates, and go-live acceptance criteria are documented in [azure-migration-security-plan.md](azure-migration-security-plan.md). This is a draft runbook and does not authorise production use or real-user data.

