const path = require('path');
const { exec } = require('child_process');

const envPath = process.pkg
  ? path.join(path.dirname(process.execPath), '.env')
  : path.join(__dirname, '..', '.env');

require('dotenv').config({ path: envPath });

const express = require('express');
const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

function resolveFrontendPath() {
  return path.join(__dirname, '..', 'frontend');
}

function openBrowser(url) {
  if (process.env.OBSMUSIC_OPEN_BROWSER === '0') {
    return;
  }

  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';
  const command = isWindows
    ? `start "" "${url}"`
    : isMac
      ? `open "${url}"`
      : `xdg-open "${url}"`;

  exec(command, { shell: true }, () => {});
}

if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn(`Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET in ${envPath}`);
}

app.use(express.json());
app.use('/api', apiRouter);
app.use(express.static(resolveFrontendPath()));

app.get('*', (_req, res) => {
  res.sendFile(path.join(resolveFrontendPath(), 'index.html'));
});

app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  // eslint-disable-next-line no-console
  console.log(`OBSmusic server is running on ${url}`);
  if (process.env.OBSMUSIC_AUTO_OPEN !== '0') {
    openBrowser(url);
  }
});
