
# PCS Senior Assassin — Netlify + Airtable (Axios client)

Dark purple & gold themed website for a high‑school Senior Assassin game. Features:
- Home: top eliminator, live prize pool (+$5 per elimination), leaderboard
- Rules: safety‑first, basic rules
- Sign Up: collects first name, last name, phone (10 digits)
- Vote (Sundays): players vote to continue or end & share the prize pool
- Purge Day banner auto‑shows on Saturdays, 8am–midnight CST
- Admin (password): verify players, start week, reset week, record eliminations, hard reset

Built with **Vite + React + Tailwind** and **Netlify Functions** (Airtable via Axios).

## Env Vars (Netlify → Site settings → Environment)
- `AIRTABLE_API_KEY` — Airtable **Personal Access Token** (`pat...`). *Alternatively*: `AIRTABLE_PAT` or `AIRTABLE_TOKEN`.
- `AIRTABLE_BASE_ID` — Base ID (`app...`).
- `ADMIN_PASSWORD` — e.g., `Slapshot2007`.

**The token must have scopes** `data.records:read` and `data.records:write`, and be **restricted to this base**.

## Airtable Schema (exact names; case‑sensitive)
- **Players**: `FirstName` (text), `LastName` (text), `Phone` (text), `Verified` (checkbox), `Alive` (checkbox), `Eliminations` (number)
  - Keep default view name: **`Grid view`**.
- **Eliminations**: `EliminatorId` (text), `EliminatedId` (text), `Timestamp` (date/time), `ID` (formula: `RECORD_ID()`)
- **Votes**: `PlayerPhone` (text), `Choice` (single select: `continue`, `end`), `Timestamp` (date/time)
- **Settings**: `WeekStart` (date/time)

## Run
```bash
npm i
npm run dev          # frontend only
# or
npm i -g netlify-cli
netlify dev          # frontend + functions
```

## Notes
- Axios client avoids Node `punycode` warnings.
- GET/DELETE requests send **no body**; POST/PATCH include JSON bodies only when needed.
- If you see **401**, verify your token & base access and that env vars don’t have extra spaces.
