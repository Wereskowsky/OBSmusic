require('dotenv').config();
const path = require('path');
const express = require('express');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn('Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET in environment.');
}

app.use(express.json());
app.use('/api', apiRouter);
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`OBSmusic server is running on http://localhost:${PORT}`);
});
