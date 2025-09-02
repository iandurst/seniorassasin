# New Features Added (SMS Disabled, Admin Targets, Purge & Reset)

- Automated SMS is **disabled** by design. Admin will text targets manually from **309-648-1257**.
- Admin-only **Weekly Targets** panel added to the Admin page:
  - Start Week (assign circular targets)
  - Load Targets
  - Copy All Messages
  - Export CSV
- **Purge (3 hours)** and **Reset Everything** actions retained and require admin password.
- Backend replaced with **Airtable** key/value storage (no Netlify Blob).

## Netlify Environment Variables
- `ADMIN_PASSWORD` (required)
- `AIRTABLE_API_KEY` (required; PAT with data.records:read/write, base-restricted)
- `AIRTABLE_BASE_ID` (required)
- `AIRTABLE_TABLE` = `kv` (or `AIRTABLE_TABLE_ID` = `tbl...`)
- `DEFAULT_COUNTRY_CODE` = `+1` (optional)

Build: 2025-09-02T01:48:01.718034Z
