# Azure migration and security plan

**Status:** Draft — planning only; not approval for production or real-user data  
**Date:** 26 August 2026  
**Related:** DIT-2286, AIMS-17, AIMS-05 incident assessment, risk R-36, DPIA, change record  
**Technical owner:** To confirm  
**DevOps owner:** To confirm  
**Data protection owner:** AIMS Manager / DPO

## Purpose

Move the internal prototype-sharing and telemetry app from its current GitHub Pages/Cloudflare/Supabase design to approved Azure services inside the Dayshape managed tenant.

This plan is a reservation for the migration work. It does not authorise go-live. The app must not process real Dayshape or external-user personal data on Azure until the DPIA, supplier review, change approval, incident assessment, and the Gate 2 data decision are complete.

## Interim Supabase operating mode

Until Azure is approved and provisioned:

- [ ] Use the existing Supabase project only for approved synthetic prototype data and testing.
- [ ] Keep Supabase Auth, feedback, changelog, telemetry, and the private `prototype-artifacts` bucket under review.
- [ ] Do not put a Supabase service-role key, database credential, or storage management token in browser code or Git.
- [ ] Do not use a public Supabase Storage bucket as a replacement for private app hosting; it would expose the hub files and the client-side access key.
- [ ] Because the source repository is private, use only an organisation-approved static host for the HTML files. GitHub Pages is unavailable for this repository on the current plan.
- [ ] Keep telemetry disabled or synthetic-only until Security/AIMS/DPO confirm the lawful basis, notice, retention, and evidence-preservation requirements.
- [ ] Record the temporary host, Supabase project owner, region, enabled policies, and GitHub Actions secrets in the change record.
- [ ] Treat the existing shared `?key=` gate as navigation control only, not authentication or authorisation.

Before Azure cut-over:

1. Export Supabase schema and any approved historical data under Security/DPO direction.
2. Record the export location, operator, timestamp, retention period, and access controls.
3. Inventory every browser call to Supabase and map it to an Azure API endpoint.
4. Rotate temporary credentials and remove the old Supabase deployment secrets after cut-over approval.

## Current state and risks

The current implementation is a static HTML/JavaScript app:

- GitHub Pages hosts the repository and public mock files.
- A separate Cloudflare Worker may serve another copy of the app.
- `config.js` exposes the Supabase URL, publishable key, and shared internal key.
- `shared/access.js` provides a client-side `?key=` gate. It is not authentication and the previous key must be treated as disclosed.
- `shared/feedback-store.js` and `shared/telemetry-store.js` write directly from browsers to Supabase.
- Feedback and telemetry were designed with public Supabase policies.
- Telemetry records click coordinates, page paths, URLs, viewport data, session identifiers, and selected UI text.
- The prototype library adds authenticated Supabase metadata and private Storage support, but does not secure the existing feedback/telemetry paths.

Until containment is approved and completed:

- Do not use the app with real or external-user data.
- Do not share new prototype links.
- Use synthetic data only.
- Preserve relevant Supabase data, logs, and Slack messages for the Security/DPO review.
- Do not delete evidence or the Supabase project until authorised.

## Decisions and approvals required first

- [ ] Security/AIMS/DPO confirm whether this is assessed under AIMS-05 and whether ICO notification criteria apply.
- [ ] Gate 2 is recorded: recommended option is to export historical Supabase data for the record, start Azure with an empty store, and delete Supabase after authorisation.
- [ ] DPIA completed and approved.
- [ ] RoPA entry, lawful basis, privacy notice, data retention, deletion, and data-subject request process agreed.
- [ ] Supplier/tool approval confirms the scope of Azure, GitHub Actions, GitHub Pages, and any remaining Cloudflare use.
- [ ] Named Product/Engineering owner and DevOps owner confirmed.
- [ ] Change record includes deployment, rollback, cut-over, and decommission steps.
- [ ] Product Design confirms whether Figma can replace non-telemetry sharing, feedback, and version-history features.

## Immediate containment

Complete these with Security/AIMS direction and record timestamps:

- [ ] Disable the public Cloudflare Worker copy.
- [ ] Disable GitHub Pages or replace it with a maintenance page if collection cannot be disabled safely.
- [ ] Rotate the disclosed internal key and remove it from newly shared URLs. Do not treat the replacement key as a permanent security boundary.
- [ ] Disable anonymous inserts and reads for feedback and telemetry, or pause the Supabase project if it is dedicated to this app.
- [ ] Preserve an access-controlled export and relevant audit information before destructive cleanup.
- [ ] Confirm whether the Supabase account, billing identity, and project region are within approved organisational ownership.

## Target architecture

```text
Entra ID (Dayshape tenant)
          |
          v
Azure Static Web Apps (private internal hub)
          |
          v
Azure Functions API ----> Key Vault / managed identity
          |                         |
          v                         v
Private PostgreSQL            Private Blob Storage
```

The browser must not connect directly to PostgreSQL, Blob Storage, or Supabase. The API validates the Entra identity and owns all reads/writes.

## Azure build sequence

### 1. Confirm the landing zone

- [ ] Confirm the subscription and tenant with the named DevOps owner.
- [ ] Do not place an internal experiment in the production `Product` resource group without explicit approval.
- [ ] Prefer a dedicated non-production resource group such as `rg-internal-prototyping`.
- [ ] Confirm naming, tags, cost centre, owner, environment, and data-classification conventions.
- [ ] Select UK South or an approved EU region for every resource.
- [ ] Set a budget and cost alert.
- [ ] Apply least-privilege RBAC through Entra groups; avoid broad Owner access.

### 2. Provision Azure resources

Create only through the approved subscription and infrastructure process:

- [ ] Azure Static Web App.
- [ ] Azure Functions, managed inside or associated with the Static Web App.
- [ ] Azure Database for PostgreSQL Flexible Server.
- [ ] Azure Storage Account and private blob container.
- [ ] Azure Key Vault.
- [ ] Application Insights / Log Analytics.
- [ ] Private networking, private endpoints or VNet integration, and private DNS as appropriate.

Verify:

- [ ] PostgreSQL has no `0.0.0.0` / all-IP firewall rule.
- [ ] Blob containers are not public.
- [ ] Key Vault has no public secret values committed to GitHub.
- [ ] Diagnostic logs and alerts are enabled.

### 3. Recreate the schema

- [ ] Export the existing Supabase schema/data only after Security/DPO approve evidence handling.
- [ ] Prefer an empty Azure database under the recommended Gate 2 decision.
- [ ] Recreate tables for feedback, telemetry, changelog, prototype metadata, versions, and artifact metadata.
- [ ] Add explicit ownership, retention, and deletion fields where needed.
- [ ] Use server-generated timestamps and IDs.
- [ ] Add indexes and constraints for prototype scope and duplicate event protection.
- [ ] Do not copy the Supabase public RLS model.
- [ ] Create database roles with the minimum permissions required by the API.

### 4. Build the API layer

Move each browser-side data operation from:

- `shared/feedback-store.js`
- `shared/changelog-store.js`
- `shared/telemetry-store.js`
- `shared/prototype-library.js`

into authenticated Azure Function endpoints.

The API must:

- [ ] Validate the Static Web Apps/Entra identity and tenant.
- [ ] Authorise access by role/group, not by a shared URL key.
- [ ] Validate prototype IDs, event shapes, file types, sizes, and content lengths.
- [ ] Rate-limit public feedback ingestion if external reviewers remain supported.
- [ ] Scrub or reject access keys, tokens, secrets, and unnecessary personal data in URLs and UI text.
- [ ] Use parameterised SQL or a safe database client.
- [ ] Apply CORS only to approved application origins.
- [ ] Protect cookie-authenticated state-changing endpoints against CSRF.
- [ ] Return generic errors to browsers and log detailed errors privately.
- [ ] Add audit events for admin changes, downloads, deletes, and exports.

### 5. Configure authentication

- [ ] Enable Entra ID authentication on Static Web Apps.
- [ ] Restrict sign-in to the Dayshape tenant.
- [ ] Require approved Entra groups for internal hub and developer resources.
- [ ] Require MFA/Conditional Access according to Dayshape policy.
- [ ] Remove the `?key=` mechanism from the application.
- [ ] Remove access keys from URLs, logs, screenshots, telemetry, and documentation.
- [ ] Add sign-out, session-expiry, and unauthorised-state handling.
- [ ] Test that an unauthorised user cannot load internal HTML, API data, or private files directly.

### 6. Move files to Blob Storage

- [ ] Create a private container; never make developer files publicly readable.
- [ ] Upload through an authenticated Function or tightly scoped API.
- [ ] Use short-lived user-delegation SAS URLs or API-proxied downloads.
- [ ] Enforce file size, extension, MIME type, and malware/content scanning requirements.
- [ ] Store only metadata and blob paths in PostgreSQL.
- [ ] Preview uploaded HTML on an isolated origin with a strict Content Security Policy.
- [ ] Do not allow uploaded HTML to share cookies, storage, or same-origin privileges with the hub.
- [ ] Record download and deletion audit events.

### 7. Repoint the front end

- [ ] Replace Supabase REST calls with the Azure API client.
- [ ] Remove Supabase URL, publishable key, and all service credentials from browser code.
- [ ] Remove the shared-key gate and use the Static Web Apps/Entra session.
- [ ] Keep public mock previews separate from the internal management hub if public sharing is still approved.
- [ ] Disable feedback and telemetry by default until the DPIA and privacy notice are approved.
- [ ] Minimise telemetry: avoid raw URLs, visible UI text, names, free-form content, and unnecessary identifiers.
- [ ] Add a clear privacy notice and collection status to any user-facing feedback flow.
- [ ] Preserve the current visual language only after confirming the security controls are not weakened.

### 8. Secure CI/CD

- [ ] Connect the repository to Azure Static Web Apps through an approved GitHub Actions workflow.
- [ ] Use environment-specific staging and production deployments.
- [ ] Use OIDC/federated credentials or managed identity instead of long-lived Azure credentials.
- [ ] Keep production configuration in Azure app settings/Key Vault.
- [ ] Add required reviews and branch protection on `main`.
- [ ] Run HTML/JavaScript tests, dependency scanning, secret scanning, and linting before deployment.
- [ ] Ensure build logs never print tokens, connection strings, personal data, or signed URLs.
- [ ] Require a manual approval for production cut-over.

### 9. Test staging

- [ ] Verify all resources are in the approved region and subscription.
- [ ] Verify PostgreSQL and Blob Storage are not publicly reachable.
- [ ] Verify unauthorised users receive no internal page or API data.
- [ ] Verify Entra users outside the Dayshape tenant are rejected.
- [ ] Verify direct calls cannot bypass API authorisation.
- [ ] Verify no browser request goes to Supabase.
- [ ] Verify no secrets or access keys appear in source, URLs, logs, telemetry, or downloaded files.
- [ ] Verify feedback, telemetry, downloads, uploads, deletion, and retention behaviour.
- [ ] Run an authenticated security test and an unauthenticated negative test.
- [ ] Run a DPIA/privacy acceptance review using synthetic data.
- [ ] Record the test results against the change record.

### 10. Cut over

- [ ] Obtain written Security, DPO, Product, and DevOps approval.
- [ ] Export historical Supabase data for the record if required.
- [ ] Deploy the approved Azure Static Web App.
- [ ] Confirm the custom domain and TLS configuration.
- [ ] Redirect or retire the old GitHub Pages and Worker URLs.
- [ ] Rotate any credentials used during staging.
- [ ] Announce the approved internal URL only to authorised users.
- [ ] Monitor logs, authentication failures, API errors, costs, and unusual downloads.

### 11. Decommission

- [ ] Confirm the new app is stable and rollback is no longer required.
- [ ] Delete Supabase data/project only after Security/DPO authorisation.
- [ ] Record the deletion date, scope, operator, and evidence.
- [ ] Remove old Supabase secrets and GitHub Actions secrets.
- [ ] Retire the Worker and old GitHub Pages URLs.
- [ ] Remove old links from documentation and Slack after evidence-preservation instructions are complete.
- [ ] Close or update DIT-2286, AIMS-17, R-36, the DPIA, RoPA, and change record.

## Rollback plan

If staging or cut-over fails:

1. Stop the Azure deployment or disable the affected Static Web App route.
2. Revoke any exposed staging credentials and signed URLs.
3. Preserve logs and incident evidence.
4. Do not restore the old Supabase app for real-user data unless Security/DPO explicitly approve it.
5. Record the failure, impact, and remediation in the change record.

## Go-live acceptance criteria

The migration is not complete until all of these are true:

- [ ] Internal access is Entra ID, tenant-restricted, and group-authorised.
- [ ] No shared URL key exists.
- [ ] No browser code calls Supabase or contains service credentials.
- [ ] API authorisation is enforced server-side.
- [ ] PostgreSQL and Blob Storage are private.
- [ ] Secrets are held in Key Vault or approved application settings.
- [ ] Telemetry and feedback have an approved lawful basis, notice, retention, and deletion process.
- [ ] Uploaded HTML is isolated from the hub origin.
- [ ] The DPIA, supplier approval, incident assessment, and change record are complete.
- [ ] The old public endpoints are retired and their retirement is recorded.
