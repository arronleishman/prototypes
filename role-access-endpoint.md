# Role link endpoint contract

The static app can create role links through `config.js`:

```js
roleAccessUrl: 'https://<approved-service>/prototype-role-link'
```

The endpoint must be hosted in an approved server environment. It must not be implemented in the static app or expose a Supabase service-role key.

## Request

```http
POST /prototype-role-link
Content-Type: application/json
X-Prototype-Access-Key: <server-validated internal key>
Authorization: Bearer <existing capability, when rotating a link>
```

```json
{
  "role": "designer",
  "path": "details.html",
  "prototypeId": "example-prototype",
  "tab": "components"
}
```

The endpoint should validate the caller and return a short-lived, signed capability:

```json
{
  "token": "<short-lived Supabase-compatible JWT>"
}
```

The token must carry a server-controlled role claim. RLS and Storage policies should allow:

- `designer`: create/update/delete prototype metadata, versions, artifacts, tests, and changelog items.
- `developer`: read prototype metadata, versions, artifacts, tests, changelog items, telemetry, and usability results.
- both roles: submit anonymous participant runs only through the intended public participant path.

Do not use the `role` or `capability` query parameters as authorization on their own. When `roleAccessUrl` is empty, the app keeps a local/demo role-link fallback so the UI can be reviewed, but shared Supabase writes are not securely authorized.
