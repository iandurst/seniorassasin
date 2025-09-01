# PCS Senior Assasin

A Netlify-hosted site + serverless functions to run your Senior Assassin game.

## Features
- Dark purple & gold theme
- Sign up form (name + phone) → stored server-side
- Home page shows prize pool and top eliminations
- Admin page (password protected) to:
  - toggle player status (alive/out)
  - record eliminations (awards 1 point, marks target out)
  - set entry fee / prize pool override
  - start each week (assigns random targets and *texts* everyone)

## Deploy (Netlify site, not just Drop)
Because SMS and weekly target assignment need serverless code and storage, this **must** be deployed as a standard Netlify site (Git or CLI).

1. **Fork/Upload** this folder to a new Git repo (GitHub, GitLab, Bitbucket) and connect it in Netlify.  
   Build command: _none_ (static) — Publish directory: `/`  
   Functions directory: `netlify/functions`

2. **Environment variables** (Site settings → Environment):
   - `ADMIN_PASSWORD` (optional) — default is `Slapshot2007`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - **Either** `TWILIO_MESSAGING_SERVICE_SID` **or** `TWILIO_FROM_NUMBER`

3. (Optional) **Scheduled weekly starts**  
   Uncomment the `[[scheduled.functions]]` block in `netlify.toml` to auto-start every Monday 09:00.

4. Visit `/admin.html`, enter the password, and manage the game.

## Data Storage
This project uses **Netlify Blobs** to persist JSON data (`participants`, `settings`, and `assignments` per week).

## Safety & Conduct
This code is for a consensual, safe game. Obey school rules and local laws. Play off school grounds and use only safe equipment defined in your rules.
