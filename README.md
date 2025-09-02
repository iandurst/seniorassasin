# PCS Senior Assasin

A Netlify-hosted site + serverless functions to run your Senior Assassin game.

## Features
- Dark purple & gold theme, mobile-first
- Sign up form (name + phone) → stored server-side; admin approvals
- Home page shows prize pool (Squid-style) and top eliminations
- Voting page: Fridays 3–6 pm CT; 75% stop threshold ends the game
- Admin page (password protected) to:
  - review **pending approvals** and approve/reject players
  - toggle player status (Alive/Out for active players)
  - record eliminations (awards 1 point, marks target Out)
  - set entry fee / prize pool override
  - start each week (assigns random targets and *texts* everyone) — blocked if game ended

## Deploy (Netlify site, not just Drop)
Because SMS, voting, and weekly target assignment need serverless code and storage, this **must** be deployed as a standard Netlify site (Git or CLI).

1. **Upload** this folder to a Git repo and connect it in Netlify.  
   Build command: _none_ — Publish directory: `/` — Functions directory: `netlify/functions`
2. Set environment variables (Site settings → Environment):
   - `ADMIN_PASSWORD` (optional) — is set by the `ADMIN_PASSWORD` environment variable
   - `TELNYX_API_KEY`, `(not needed for Telnyx)`
   - **Either** `TELNYX_MESSAGING_PROFILE_ID` **or** `TELNYX_FROM_NUMBER`
3. (Optional) Scheduled weekly starts: uncomment in `netlify.toml`.

## Data Storage
Uses **Netlify Blobs** to persist `participants`, `settings`, `votes-YYYY-MM-DD`, and weekly assignments.

## Prize Pool (Squid-style)
Prize pool grows by **$entryFee per elimination** (admin can override).


## Telnyx setup
1. Create an account at https://portal.telnyx.com/ and grab your **API Key**.
2. Buy a phone number that supports SMS (or use a **Messaging Profile**).
3. In Netlify → Site settings → Environment variables, set:
   - `TELNYX_API_KEY`
   - `TELNYX_MESSAGING_PROFILE_ID` **or** `TELNYX_FROM_NUMBER`
4. Redeploy the site.


## SMS provider (cheaper options)

This project now uses a provider-agnostic SMS module with **Textbelt** by default (no monthly number; pay-as-you-go). You can switch to **ClickSend**.

### Option A — Textbelt (default)
- Env: `SMS_PROVIDER=textbelt` (or leave unset), `TEXTBELT_API_KEY=<your_key>`.
- You can test with `TEXTBELT_API_KEY=textbelt` which sends **1 free SMS/day** (for testing).
- No phone number to buy, no monthly fees.

### Option B — ClickSend
- Env: `SMS_PROVIDER=clicksend`, `CLICKSEND_USERNAME=<your_username>`, `CLICKSEND_API_KEY=<your_api_key>`.
- Low per‑SMS rates; credentials are Basic Auth.

> Keep messages transactional and to consenting players only. Carriers may apply surcharges (esp. in the U.S.).
