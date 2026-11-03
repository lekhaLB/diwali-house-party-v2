# Diwali House Party: Netlify package

Static site (`public/`) plus three serverless functions that store data in Netlify Blobs:
- `POST /api/rsvp` saves RSVPs (only you can read them, via the admin page).
- `GET/POST /api/photos` power the shared photo wall.
- `GET/POST /api/notes` power the shared gossip wall (everyone who opens the site sees the same notes).
- `public/admin.html?key=YOUR_KEY` shows all RSVPs (with totals) and lets you delete RSVPs, gossip notes and photos.

## Deploy (CLI)
1. `npm i -g netlify-cli` then `cd diwali-netlify && npm install`
2. `netlify login` then `netlify init` (create a new site)
3. `netlify deploy --prod`

Or push this folder to GitHub and import it at app.netlify.com (set `ADMIN_KEY` under Site settings > Environment variables).
Note: dragging the folder into Netlify Drop does not build the functions, so use the CLI or Git.

Local test: `netlify dev`. Share the site URL with friends; host view is `https://YOUR-SITE.netlify.app/admin.html?key=YOUR_KEY`.

The outfit pick still lives in each visitor's own browser (it's only sent along with their RSVP).
If the backend is unreachable, the gossip wall and photo wall fall back to browser-only mode.
