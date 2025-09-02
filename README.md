
# PCS Senior Assassin — Netlify + Airtable

Dark purple & gold themed website for a high‑school Senior Assassin game. Features:
- Home: top eliminator, live prize pool (+$5 per elimination), leaderboard
- Rules: safety‑first, basic rules
- Sign Up: collects first name, last name, phone (10 digits)
- Vote (Sundays): players vote to continue or end & share the prize pool
- Purge Day banner auto‑shows on Saturdays, 8am–midnight CST
- Admin (password): verify players, start week, reset week, record eliminations, hard reset

Built with **Vite + React + Tailwind** and **Netlify Functions** (Airtable backend via Axios).

## Quick Start

1. **Create Airtable Base** with these tables/fields (case‑sensitive):
   - **Players**
     - `FirstName` (Single line text)
     - `LastName` (Single line text)
     - `Phone` (Single line text) — 10 digits, unique
     - `Verified` (Checkbox)
     - `Alive` (Checkbox)
     - `Eliminations` (Number, Integer)
   - **Eliminations**
     - `EliminatorId` (Single line text)
     - `EliminatedId` (Single line text)
     - `Timestamp` (Date/Time)
     - `ID` (Formula: `RECORD_ID()`)
   - **Votes**
     - `PlayerPhone` (Single line text)
     - `Choice` (Single select: `continue`, `end`)
     - `Timestamp` (Date/Time)
   - **Settings**
     - `WeekStart` (Date/Time)

2. **Netlify Environment Variables**
   - `AIRTABLE_API_KEY` — your Airtable personal access token (`pat...`) with read/write to this base
   - `AIRTABLE_BASE_ID` — the Base ID (`app...`)
   - `ADMIN_PASSWORD` — set to `Slapshot2007` (or your custom password)

3. **Run/Deploy**
   ```bash
   npm i
   npm run dev           # frontend only
   # or full stack:
   npm i -g netlify-cli
   netlify dev           # frontend + functions
   ```
   On Netlify, the `netlify.toml` already points functions to `/netlify/functions`.

## Notes
- Functions use a lightweight **Axios client** (no `airtable` npm package) to avoid Node `punycode` deprecation warnings.
- Prize pool is computed as number of `Eliminations` × $5.
- Reset Week revives verified players, resets eliminations to 0, clears `Eliminations` and `Votes`.
- Hard Reset wipes **all** tables.

**Safety**: Always follow local laws and school policies. Use only safe props.
