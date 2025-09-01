# PCS Senior Assasin

A Netlify-hosted site + serverless functions (Netlify Functions + Netlify Blobs) to run your Senior Assassin game.

## Features
- Dark purple & gold, **mobile‑first** design
- Sign up (name + phone) → admin **approves** before joining
- Home shows prize pool + leaderboard (no rank)
- Admin: toggle Alive/Out, record eliminations, set entry fee / override, **start week (texts targets)**
- **Weekly vote (Fri 3–6 PM Central)** — players vote using the phone number they registered; if 75% vote “Stop”, the game ends
- Instagram link in the nav

## Deploy (Netlify site, not Drop)
Because SMS, storage, and voting use serverless functions, deploy as a standard Netlify site (Git-connected).  
Build command: _none_ • Publish dir: `/` • Functions dir: `netlify/functions`

## Environment variables (Site settings → Environment)
- `ADMIN_PASSWORD` (optional) — default `Slapshot2007`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- **Either** `TWILIO_MESSAGING_SERVICE_SID` **or** `TWILIO_FROM_NUMBER`
- `SITE_BASE_URL` — e.g., `https://your-site.netlify.app` (for vote links in SMS)

## Voting system (Friday 3–6 PM Central)
- **Automatic:** `start-vote` is scheduled Fridays at **20:00 & 21:00 UTC**; the function itself checks the local time and only opens at **3 PM Central** (covers CST/CDT).
- **Window:** 3 hours. Tokens are generated for **active & alive** players; unique links are texted via Twilio.
- **Threshold:** If **≥75%** of eligible players vote **Stop**, the game ends immediately.
- **Manual:** Admin page has **Start vote** and **Close vote** buttons.

## Data Storage
Uses **Netlify Blobs** to store `participants`, `settings`, weekly `assignments`, and current `vote` state.

## Safety
Play off school grounds, obey laws, respect property, and follow the posted rules.


## SMS provider: Telnyx (cheaper pay‑as‑you‑go)
This project is configured to send SMS via **Telnyx**.

**Setup steps**
1. Create a Telnyx account → buy a local 10DLC or toll‑free number.
2. Create a **Messaging Profile** and assign the number to it (Telnyx Portal → Messaging Profiles).
3. (US traffic) Complete **10DLC registration** (low‑volume campaign is OK) to maximize deliverability.
4. In Netlify **Environment variables**, add:
   - `TELNYX_API_KEY` → your Telnyx API key
   - Either **`TELNYX_FROM_NUMBER`** (`+1...`) **or** `TELNYX_MESSAGING_PROFILE_ID`
5. Redeploy.

**Notes**
- We use Telnyx HTTP API (`/v2/messages`) with native `fetch`, no extra SDK required.
- If env vars are missing, the code safely skips sending (game still assigns targets).
