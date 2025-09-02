
# PCS Senior Assassin — Netlify + Airtable (Admin fix)

This build includes:
- **Admin endpoints wired to Netlify function names** (e.g., `/.netlify/functions/admin-list`).
- Axios Airtable client that accepts `AIRTABLE_API_KEY` (or `AIRTABLE_PAT` / `AIRTABLE_TOKEN`) and avoids punycode warnings.
- No bodies on GET/DELETE; array param serializer; clearer 401 errors.

## Env Vars
- `AIRTABLE_API_KEY` (or `AIRTABLE_PAT` / `AIRTABLE_TOKEN`) — PAT with `data.records:read` and `data.records:write`, restricted to this base.
- `AIRTABLE_BASE_ID`
- `ADMIN_PASSWORD` — e.g., `Slapshot2007`

## Deploy
Push to GitHub → connect in Netlify → deploy. Test:
- `/.netlify/functions/public-data`
- Admin tab with your password (should load players & prize pool).

