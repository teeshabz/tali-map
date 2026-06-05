# tali map
 
A personal map of places that have brought me joy — scattered across New York and the world.
 
Built as a recommendation corner for work, then kept because it felt like a good artifact to have.
 
## how it works
 
Pins live in a Notion database and are fetched at runtime via a Vercel serverless function (`/api/pins`). The Notion token is stored as a Vercel environment variable — never in the code. The map uses [Leaflet.js](https://leafletjs.com/) with [CARTO Positron](https://carto.com/basemaps/) tiles. No frameworks, no build step.
 
```
index.html    — map UI
api/pins.js   — serverless function, queries Notion
```
 
## adding pins
 
Add a row to the Notion database, then add coordinates for the new place to the `COORDS` object in `api/pins.js` and push. It appears on the next page load.
 
## deploying
 
1. Fork the repo
2. Create a [Notion integration](https://notion.so/my-integrations) and connect it to your database
3. Add `NOTION_API_KEY` as a Vercel environment variable
4. Connect to Vercel — auto-deploys on push
 
