require('dotenv').config({ path: "./E.env" })
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(cors({
    origin: 'http://localhost:3000',   // ← allow React frontend
    methods: ['GET', 'POST', 'OPTIONS'],  // allow preflight
    allowedHeaders: ['Content-Type']
}));
app.use(cors({
  origin: '*',  // Allow all origins (for testing)
  // OR better: origin: 'https://prismatic-diefenbachia-2c865d.netlify.app'  // your exact Netlify URL
}));
app.use(express.json());

app.get('/api/news', async (req, res) => {
    const { category = '', page = '' } = req.query;

    let url = `https://newsdata.io/api/1/latest?apikey=${process.env.NEWS_API_KEY}&language=en&size=10`;

    if (category) url += `&category=${category}`;
    if (page) url += `&page=${page}`;

    console.log('[BACKEND] Fetching:', url);

    try {
        const response = await fetch(url);   // ← native fetch, no import needed

        console.log('[BACKEND] Status:', response.status);

        const text = await response.text();   // get raw first to debug
        console.log('[BACKEND] Raw response (first 200 chars):', text.substring(0, 200));

        let data;
        try {
            data = JSON.parse(text);
        } catch (jsonErr) {
            console.error('[BACKEND] JSON parse failed:', jsonErr);
            return res.status(500).json({ error: 'Invalid response from API', raw: text });
        }

        res.json(data);
    } catch (err) {
        console.error('[BACKEND] Fetch error:', err.message);
        res.status(500).json({ error: 'Failed to reach NewsData.io', details: err.message });
    }
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT} `);
});
