
# PCS Senior Assassin — Netlify + Airtable (Admin auth hardened)

This build keeps your UI & endpoints the same, but makes **Admin auth robust**:
- Accepts password via `x-admin` header, **or** `Authorization: Bearer <pw>`, **or** `?key=<pw>` query, **or** JSON `{ key: '<pw>' }`.
- Adds CORS headers and handles **OPTIONS** for all functions (preflight-safe).
- Uses Axios client for Airtable (no `airtable` npm) to avoid Node `punycode` warnings.

## Env Vars
- `AIRTABLE_API_KEY` (or `AIRTABLE_PAT`/`AIRTABLE_TOKEN`), `AIRTABLE_BASE_ID`, `ADMIN_PASSWORD` (default fallback `Slapshot2007`).

## Frontend
- Admin page now passes the password in both header and query (`?key=`) for compatibility.

Everything else (pages, prize pool logic, purge banner, Sunday voting) remains unchanged.
