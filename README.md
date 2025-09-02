# Senior Assassin — Full Site

This bundle includes:
- Public site (index, signup, rules, admin)
- Netlify Functions (Airtable KV, Telnyx SMS, admin reset/purge)
- Admin controls are **password-protected** on the admin tab; server endpoints also verify password.

## Environment (Netlify → Site settings → Environment variables)
- `ADMIN_PASSWORD` — password for admin actions (used by UI and functions)
- `AIRTABLE_API_KEY` — PAT with `data.records:read` and `data.records:write` (base-restricted)
- `AIRTABLE_BASE_ID` — appXXXXXXXXXXXXXX
- `AIRTABLE_TABLE` — kv  (or `AIRTABLE_TABLE_ID` = tblXXXXXXXXXXXXXX)
- `TELNYX_API_KEY` — KEY_...
- one of: `TELNYX_MESSAGING_PROFILE_ID` (mp_...) **or** `TELNYX_FROM` (+1XXXXXXXXXX)
- optional: `DEFAULT_COUNTRY_CODE` (default +1), `PURGE_DURATION_MS` (default 10800000)
