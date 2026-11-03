# Diwali House Party: Netlify package

Static site (`public/`) plus two serverless functions that store data in Netlify Blobs:
- `POST /api/rsvp` saves RSVPs. `POST /api/photos` + `GET /api/photos` power the shared photo wall.
- `public/admin.html?key=YOUR_KEY` shows all RSVPs (with totals) and lets you delete photos.

## Deploy (CLI)
1. `npm i -g netlify-cli` then `cd diwali-netlify && npm install`
2. `netlify login` then `netlify init` (create a new site)
3. `netlify env:set ADMIN_KEY "pick-a-long-secret"`
4. `netlify deploy --prod`

Or push this folder to GitHub and import it at app.netlify.com (set `ADMIN_KEY` under Site settings > Environment variables).
Note: dragging the folder into Netlify Drop does not build the functions, so use the CLI or Git.

Local test: `netlify dev`. Share the site URL with friends; host view is `https://YOUR-SITE.netlify.app/admin.html?key=YOUR_KEY`.

The gossip wall and outfit pick still live in each visitor's own browser. Say the word to move them to the backend too.
