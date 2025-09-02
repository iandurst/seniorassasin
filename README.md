# PCS Senior Assassin

A small web app for running a high‑school **Senior Assassin** game with a dark purple & gold theme.
Built for deployment on **Vercel** (serverless functions) and uses **Airtable** as the database.

> ⚠️ **Safety & Compliance**: This site is for a *water‑tag* style game only. No real weapons. No play on school grounds or where prohibited. Follow local laws, school policies, and obtain permissions as needed.

## Features
- **Home**: Top eliminator, live prize pool, full leaderboard.
- **Rules**: Basic, safety‑first rules.
- **Sign Up**: First name, last name, phone — stored for admin review.
- **Voting**: On Sundays (CST), verified players vote to **continue** or **end & share** the prize pool.
- **Admin** (password‑gate): Review/verify participants, start new week, record eliminations, weekly reset, full reset.
- **Purge Day**: Every Saturday 8:00am–midnight CST, a site‑wide banner appears (“anyone can eliminate anyone”).

## Quick Start

### 1) Create Airtable Base
Create a base with the following tables and fields:

**Table: `Participants` (primary view)**
- `FirstName` (Single line text)
- `LastName` (Single line text)
- `Phone` (Single line text)
- `Verified` (Checkbox) — default unchecked
- `Status` (Single select): `Pending`, `Active`, `Eliminated` (default: `Pending`)
- `Eliminations` (Number) — default 0
- `Alive` (Checkbox) — default checked
- `WeekEliminated` (Number) — allow empty
- `CreatedAt` (Created time)
- *(optional)* `ID` (Formula) → `RECORD_ID()`

**Table: `Eliminations`**
- `EliminatorId` (Single line text)
- `EliminatorName` (Single line text)
- `EliminatedId` (Single line text)
- `EliminatedName` (Single line text)
- `WeekNumber` (Number)
- `Timestamp` (Created time)

**Table: `Settings`**
- `Key` (Single line text, primary)
- `Value` (Single line text)
- `UpdatedAt` (Last modified time)

**Table: `Votes`**
- `ParticipantId` (Single line text)
- `ParticipantName` (Single line text)
- `WeekNumber` (Number)
- `Vote` (Single select): `Continue`, `End`
- `Timestamp` (Created time)

> Tip: For `Settings`, create initial rows:
> - `weekNumber` → `1`
> - `basePrize` → `0`
> - `gameActive` → `true`

### 2) Configure Environment Variables
Copy `.env.example` to `.env` and fill in your values:
```
AIRTABLE_API_KEY=YOUR_AIRTABLE_API_KEY
AIRTABLE_BASE_ID=YOUR_AIRTABLE_BASE_ID
ADMIN_PASSWORD=Slapshot2007
PRIZE_PER_ELIMINATION=5
BASE_PRIZE=0
TIMEZONE=America/Chicago
```

> **Security:** Do **not** commit `.env` to GitHub. The admin password is checked server‑side only. Never expose your Airtable API key in client code.

### 3) Install & Run Locally
```bash
npm install
# Local dev with Vercel CLI (recommended)
npx vercel dev
# or with a simple Node server for static files plus API via vercel dev
```

### 4) Deploy
- Push to GitHub and import the repo into **Vercel**.
- Set all environment variables in Vercel Project → Settings → Environment Variables.
- Deploy. Serverless API endpoints live under `/api/*`.

## Files
- `/public` → static site (HTML/CSS/JS).
- `/api` → serverless functions for Airtable access.
- `vercel.json` → routes headers & config.
- `package.json` → dependencies (`airtable`, `luxon`), scripts.

## Admin Notes
- **Verify**: Players must be verified before they become `Active`.
- **Start Week**: Increments `weekNumber`, clears weekly votes, and (optionally) unfreezes statuses.
- **Reset Week**: Clears `Votes` and removes this week’s `Eliminations` records; keeps participants + totals.
- **Full Reset**: Resets all participants to `Pending`/not verified, clears all eliminations, votes, and sets `basePrize` to 0.
- **Prize Pool**: Calculated as `BASE_PRIZE + PRIZE_PER_ELIMINATION × (total elimination events)`.

## Styling
Theme: **Dark purple** and **gold**. Add your logo in `public/assets/logo-placeholder.svg` or update `<img id="siteLogo">` sources.

## Disclaimer
This app is for **non‑violent, water‑tag style** games only. It should not be used in places where such activity is unsafe, prohibited, or could cause alarm.
