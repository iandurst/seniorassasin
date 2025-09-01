# PCS Senior Assasin

A Netlify-hosted site + serverless functions to run your Senior Assassin game.

## Features
- Dark purple & gold theme, responsive on phones & desktop
- Sign up (name + phone) → stored server-side
- Home shows prize pool (grows with eliminations) and leaderboard
- Admin (password protected) to:
  - review **pending approvals** and approve/reject players
  - toggle player status (Alive/Out for active players)
  - record eliminations (awards 1 point, marks target Out)
  - set entry fee / prize pool override
  - start each week (assigns random targets and *texts* everyone)
  - open/close Friday voting (manual override)

## Deploy (Netlify site, not just Drop)
Because SMS, voting, and weekly target assignment need serverless code and storage, this **must** be deployed as a standard Netlify site (Git or CLI).

1. **Fork/Upload** this folder to a new Git repo (GitHub, GitLab, Bitbucket) and connect it in Netlify.  
   Build command: _none_ (static) — Publish directory: `/`  
   Functions directory: `netlify/functions`

2. **Environment variables** (Site settings → Environment):
   - `ADMIN_PASSWORD` (optional) — default is `Slapshot2007`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - **Either** `TWILIO_MESSAGING_SERVICE_SID` **or** `TWILIO_FROM_NUMBER`

3. **Enable scheduled functions** (for Friday voting)
   The repo includes entries in `netlify.toml`. After first deploy, Netlify will schedule them automatically.

4. Visit `/admin.html`, enter the password, and manage the game.

## Data Storage
This project uses **Netlify Blobs** to persist JSON data (`participants`, `settings`, `assignments`, `vote state`).

## Voting system (Fridays 3–6 PM Central)
- A scheduled function opens voting on Fridays at 3 PM Central and closes at 6 PM (DST handled by double scheduling in UTC).
- Players vote at `/vote.html` using the phone number they registered with.
- Only **active & alive** players can vote. Each can vote once per window.
- If **≥75%** vote **Stop**, the game ends and remaining players split the pot.
- Admin can **Open/Close vote now** on `/admin.html` for testing.

## Instagram
- Top navigation includes a link to: https://www.instagram.com/pcsseniorassasin/

## Safety & Conduct
This code is for a consensual, safe game. Obey school rules and local laws. Play off school grounds and use only safe equipment defined in your rules.
