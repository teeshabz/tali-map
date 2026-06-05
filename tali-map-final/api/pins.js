export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const DATABASE_ID = 'eab56e6a5c9546e592ade69951d338bc';

  if (!NOTION_API_KEY) {
    return res.status(500).json({ error: 'NOTION_API_KEY not set' });
  }

  try {
    let allResults = [];
    let hasMore = true;
    let startCursor = undefined;

    while (hasMore) {
      const body = { page_size: 100 };
      if (startCursor) body.start_cursor = startCursor;

      const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const err = await response.text();
        return res.status(response.status).json({ error: err });
      }

      const data = await response.json();
      allResults = allResults.concat(data.results);
      hasMore = data.has_more;
      startCursor = data.next_cursor;
    }

    const COORDS = {
      'Hule':                          [19.4284, -99.1677],
      'Hide and Seek':                 [40.7282, -73.9505],
      'Nook':                          [40.7021, -73.9223],
      'Sisyphos':                      [52.5186,  13.4176],
      'Mr. Sunday':                    [40.7136, -73.9040],
      'Comedy Cellar':                 [40.7303, -74.0024],
      'Museo del Prado':               [40.4138,  -3.6922],
      'Kandinsky (wherever showing)':  [52.3676,   4.9041],
      'Museo de Arte Moderno':         [19.4261, -99.1861],
      'Pujol':                         [19.4321, -99.1916],
      'The Crete meal':                [35.2401,  24.8093],
      'El Padrino':                    [ 6.5244,   3.3792],
      'Place des Fêtes':               [40.6830, -73.9442],
      'Falansai':                      [40.7265, -73.9505],
      'Eyval':                         [40.6942, -73.9249],
      "Gordo's Cantina":               [40.6971, -73.9196],
      'Taquería Al Pastor':            [40.7021, -73.9155],
      'Tacoway Beach':                 [40.5812, -73.8398],
      'Puerto Escondido':              [15.8605, -97.0730],
      'Popoyo':                        [11.3455, -86.0234],
      'Rincón':                        [18.3396, -67.2499],
      'Rockaway Beach':                [40.5795, -73.8350],
      'Koh Lanta':                     [ 7.5710,  99.0487],
      'Salkantay Trek':                [-13.1631, -72.5450],
      'Montenegro':                    [42.7087,  19.3744],
      'Big Bend':                      [29.2498, -103.2502],
      'Kathmandu':                     [27.7172,  85.3240],
      'Marseille':                     [43.2965,   5.3698],
      'Taos Ski Valley':               [36.5951, -105.4530],
      'Craftsbury':                    [44.6444, -72.3706],
      'Prospect Park':                 [40.6602, -73.9690],
      'Hà Giang Loop':                 [22.8026, 104.9784],
    };

    const pins = allResults
      .map(page => {
        const props    = page.properties;
        const name     = props['Name']?.title?.[0]?.plain_text || '';
        const city     = props['City / Region']?.rich_text?.[0]?.plain_text || '';
        const category = props['Category']?.select?.name || '';
        const subtag   = props['Sub-tag']?.select?.name || '';
        const why      = props['Why']?.rich_text?.[0]?.plain_text || '';
        const hasMaps  = props['Google Maps Link']?.checkbox || false;
        const coords   = COORDS[name];
        if (!coords || !category) return null;
        return { name, city, category, subtag, why, hasMaps, lat: coords[0], lng: coords[1] };
      })
      .filter(Boolean);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json({ pins });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
