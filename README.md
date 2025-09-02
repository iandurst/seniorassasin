
# PCS Senior Assassin — Netlify + Airtable

Dark purple & gold themed website for a high‑school Senior Assassin game. Features:
- Home: top eliminator, live prize pool (+$5 per elimination), leaderboard
- Rules: safety‑first, basic rules
- Sign Up: collects first name, last name, phone (10 digits)
- Vote (Sundays): players vote to continue or end & share the prize pool
- Purge Day banner auto‑shows on Saturdays (8am–midnight CST)
- Admin (password): verify players, start week, reset week, record eliminations, hard reset

Built with **Vite + React + Tailwind** and **Netlify Functions** (Airtable backend).

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
     - `EliminatorId` (Single line text) — stores Airtable record id of eliminator
     - `EliminatedId` (Single line text) — stores Airtable record id of eliminated player
     - `Timestamp` (Date/Time)
   - **Votes**
     - `PlayerPhone` (Single line text)
     - `Choice` (Single select: `continue`, `end`)
     - `Timestamp` (Date/Time)
   - **Settings**
     - `WeekStart` (Date/Time)

2. **Clone & Install**
   ```bash
   npm i
   npm run dev
   ```

3. **Run on Netlify (recommended)**
   - Add these **Environment Variables** in Netlify:
     - `AIRTABLE_API_KEY` — your Airtable token
     - `AIRTABLE_BASE_ID` — the Base ID
     - `ADMIN_PASSWORD` — set to `Slapshot2007` or change and tell admins
   - Deploy the repo. Netlify will build the React app and host serverless functions from `/netlify/functions`.

4. **Usage Notes**
   - **Admin auth:** The password is **not** stored client‑side. Every admin call sends an `x-admin` header and functions validate it against `ADMIN_PASSWORD`.
   - **Prize pool:** Calculated dynamically as `Eliminations` record count × $5.
   - **Verification flow:** New sign‑ups are `Verified=false`, `Alive=false`. Admin verifies → sets `Verified=true` and `Alive=true`.
   - **Reset Week:** Revives verified players, zeros each player's `Eliminations`, clears `Eliminations` and `Votes` tables.
   - **Hard Reset:** Wipes all tables (including Players). Use with caution.
   - **Purge Day:** Automatically shows a site‑wide banner on Saturdays, 8:00 AM–midnight **America/Chicago**.
   - **Voting:** Only on Sundays (America/Chicago). Players enter phone to vote. Duplicate votes are not deduped by default; review in Airtable if you need stricter logic.

5. **Branding**
   - Replace `/public/logo.svg` with your logo file to update the header and favicon.
   - Colors are set in `tailwind.config.js` (`primary` for purple, `accent` for gold).

## Security & Safety
- Do **not** embed the admin password in the frontend. Use Netlify env var `ADMIN_PASSWORD`.
- Rules emphasize safety, local laws, and school policies. Use only safe props (e.g., water soakers).

## Local Dev with Netlify Functions
```bash
npm i -g netlify-cli
netlify dev
```

## File Structure
```
/src
  /pages (Home, Rules, Signup, Vote, Admin)
  /components (Leaderboard)
  /lib (time helpers)
/netlify/functions
  public-data.js
  signup.js
  vote.js
  /admin (list, verify, set-alive, eliminate, start-week, reset-week, hard-reset)
```

---

**Have fun and be safe.**
