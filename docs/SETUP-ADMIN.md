
# Admin Controls & Purge (Full-site bundle)

This site bundle includes:
- **Admin Reset** (/.netlify/functions/admin-reset) — clears participants, assignments, votes; resets settings; clears purge state
- **3‑hour Purge** (/.netlify/functions/admin-purge) — notifies players by SMS and sets a countdown
- **Purge status** (/.netlify/functions/purge-status) — public JSON for displaying a timer
- **Telnyx SMS sender** (netlify/functions/sms.js) — uses TELNYX_API_KEY + messaging profile or from-number
- **Airtable storage** (netlify/functions/db.js) — replaces Netlify Blob

## Configure env vars (Netlify → Site settings → Environment variables)

**Admin**
- `ADMIN_PASSWORD` — secret used by admin login and API (header `x-admin-secret`)

**Airtable**
- `AIRTABLE_API_KEY` — PAT with `data.records:read` and `data.records:write` (restrict to your base)
- `AIRTABLE_BASE_ID` — `app...`
- `AIRTABLE_TABLE` — `kv` (or `AIRTABLE_TABLE_ID` = `tbl...`)

**Telnyx**
- `TELNYX_API_KEY` — key starting with `KEY_...`
- EITHER `TELNYX_MESSAGING_PROFILE_ID` — `mp_...` OR `TELNYX_FROM` — `+1...`
- `DEFAULT_COUNTRY_CODE` — optional, default `+1`
- `PURGE_DURATION_MS` — optional, default `10800000` (3 hours)

## Notes
- `/admin.html` now shows **Purge** and **Reset** controls.
- `signup` now sends a **welcome SMS** (non‑fatal if it fails).
- New rules text is appended to `rules.html` covering the Purge and Immunity Items.
