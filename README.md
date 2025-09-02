
# PCS Senior Assassin — Netlify + Airtable (Admin path fix)

Everything is the same as before (React + Vite + Tailwind + Netlify Functions + Airtable via Axios).
**Fix**: Frontend admin calls now use the correct Netlify function URLs:
- `/.netlify/functions/admin-list`
- `/.netlify/functions/admin-verify`
- `/.netlify/functions/admin-set-alive`
- `/.netlify/functions/admin-eliminate`
- `/.netlify/functions/admin-reset-week`
- `/.netlify/functions/admin-hard-reset`
- `/.netlify/functions/admin-start-week`

## Env Vars
- `AIRTABLE_API_KEY` (or `AIRTABLE_PAT` / `AIRTABLE_TOKEN`), `AIRTABLE_BASE_ID`, `ADMIN_PASSWORD`

## Run
```bash
npm i
npm run dev
# or
netlify dev
```
