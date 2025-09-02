
# PCS Senior Assassin (Netlify + Airtable)

Dark purple & gold themed site for a high school Senior Assassin game.

**Features**
- Home: prize pool (+$5 per elimination), top eliminator, live leaderboard.
- Rules: basic, safety-first rules (editable).
- Sign Up: collects first name, last name, phone. Admin verifies players.
- Admin: password-gated (default `Slapshot2007`, override via env). Verify players, start week, record eliminations, reset all data.
- Purge Day banner: Auto-appears Saturdays 8:00am–Midnight (America/Chicago).
- Voting: Sundays only — players vote to Continue or End & Share the prize pool.
- Netlify Functions store/fetch data from Airtable.
- Netlify-ready, GitHub-ready.

---

## Quick Start

```bash
npm i
npm run dev
```

> You must add Airtable environment variables (below) for data to work.

### Environment Variables (Netlify UI or `.env` for local dev)
Create a `.env` file at project root during local dev:
```
VITE_ADMIN_PASSWORD=Slapshot2007
AIRTABLE_API_KEY=your_api_key
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE_PLAYERS=Players
AIRTABLE_TABLE_ELIMS=Eliminations
AIRTABLE_TABLE_VOTES=Votes
AIRTABLE_TABLE_STATE=GameState
ADMIN_PASSWORD=Slapshot2007
ALLOW_VOTE_ANYDAY=false
```
> `VITE_ADMIN_PASSWORD` controls the client-side prompt; `ADMIN_PASSWORD` protects the serverless API. Use the same value for both. **Do not commit real secrets.**

### Airtable Setup
Create a base with **four tables** and these fields:

**1) Players**
- `firstName` (single line text)
- `lastName` (single line text)
- `phone` (single line text) — *store digits only*
- `verified` (checkbox)
- `status` (single select: Pending, Alive, Eliminated)
- `elimCount` (number, default 0)

**2) Eliminations**
- `eliminatorPhone` (single line text)
- `eliminatedPhone` (single line text)
- *(optional)* `createdAt` (created time)

**3) Votes**
- `playerPhone` (single line text)
- `weekNumber` (number)
- `vote` (single select: Continue, End)
- *(optional)* `createdAt` (created time)

**4) GameState**
- `key` (single line text) — create one record with value `state`
- `currentWeek` (number)
- `weekStart` (date/time)
- `purgeStart` (date/time)
- `purgeEnd` (date/time)

### Netlify
- Connect your GitHub repo.
- Add the environment variables in **Site settings → Environment variables**.
- Deploy. Netlify will build with Vite and deploy serverless functions from `netlify/functions/`.

### Admin Password
- Default: `Slapshot2007` (per your spec). Override by setting both `VITE_ADMIN_PASSWORD` and `ADMIN_PASSWORD` in Netlify.
- Admin API calls require `x-admin-password` header and are **verified server-side**.

### Weekly Flow
- Click **Start Week** in Admin → sets `currentWeek` and purge window.
- **Saturday 8am–midnight CST/CDT**: A gold banner shows “Purge Day Active” site-wide.
- **Sunday**: Voting tab opens for verified players (one vote per phone per week).

### Reset Season
- Admin → **Reset ALL** clears eliminations and votes and resets players to Pending.

### Security Notes
- Avoid committing your real admin password and Airtable keys to GitHub.
- The client-side password gate is for convenience. Real protection happens in the Netlify Functions via `ADMIN_PASSWORD`.

### Replace Logo
- Drop your logo at `public/logo.svg` to replace the placeholder.

---

## Scripts
- `npm run dev` – start Vite dev server.
- `npm run build` – build for production.
- `npm run preview` – preview production build.
- `npm run netlify:dev` – run with Netlify CLI (needs `netlify-cli`).

---

## Customization Ideas
- Add target assignments per week.
- Text/phone verification (Twilio) before votes.
- Public elimination feed (from `Eliminations` table).

Have fun and stay safe!
