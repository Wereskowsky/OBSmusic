const express = require('express');
const {
  exchangeCodeForTokens,
  fetchCurrentlyPlaying,
  fetchTrack,
  normalizeTrack,
  requestClientCredentialsToken,
  requestRefreshToken,
} = require('../services/spotifyService');

const router = express.Router();

const REQUIRED_SCOPES = 'user-read-currently-playing user-read-playback-state';

const proSession = {
  accessToken: null,
  refreshToken: process.env.SPOTIFY_PRO_REFRESH_TOKEN || null,
  expiresAt: 0,
};

async function ensureProAccessToken() {
  const now = Date.now();
  if (proSession.accessToken && now < proSession.expiresAt - 30_000) {
    return proSession.accessToken;
  }

  if (!proSession.refreshToken) {
    throw new Error('Pro refresh token is missing. Authorize Pro mode first.');
  }

  const tokenData = await requestRefreshToken(
    process.env.SPOTIFY_CLIENT_ID,
    process.env.SPOTIFY_CLIENT_SECRET,
    proSession.refreshToken,
  );

  proSession.accessToken = tokenData.access_token;
  proSession.expiresAt = Date.now() + (tokenData.expires_in || 3600) * 1000;
  if (tokenData.refresh_token) {
    proSession.refreshToken = tokenData.refresh_token;
  }

  return proSession.accessToken;
}

router.get('/health', (_req, res) => {
  res.json({ ok: true });
});

router.get('/config', (_req, res) => {
  res.json({
    free: {
      fallbackTrackId: process.env.SPOTIFY_FREE_TRACK_ID || null,
    },
    pro: {
      pollIntervalMs: 3000,
      authorized: Boolean(proSession.refreshToken),
    },
  });
});

router.get('/free/current-track', async (_req, res) => {
  try {
    const fallbackTrackId = process.env.SPOTIFY_FREE_TRACK_ID;
    if (!fallbackTrackId) {
      return res.status(400).json({
        error: 'SPOTIFY_FREE_TRACK_ID is not configured. Add a track ID to .env.',
      });
    }

    const tokenData = await requestClientCredentialsToken(
      process.env.SPOTIFY_CLIENT_ID,
      process.env.SPOTIFY_CLIENT_SECRET,
    );
    const track = await fetchTrack(fallbackTrackId, tokenData.access_token);
    res.json({ mode: 'free', track: normalizeTrack(track) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/pro/auth/login', (_req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    scope: REQUIRED_SCOPES,
  });
  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

router.get('/pro/auth/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).send(`Spotify authorization error: ${error}`);
  }

  if (!code) {
    return res.status(400).send('Missing authorization code');
  }

  try {
    const tokenData = await exchangeCodeForTokens(
      process.env.SPOTIFY_CLIENT_ID,
      process.env.SPOTIFY_CLIENT_SECRET,
      code,
      process.env.SPOTIFY_REDIRECT_URI,
    );

    proSession.accessToken = tokenData.access_token;
    proSession.expiresAt = Date.now() + (tokenData.expires_in || 3600) * 1000;
    if (tokenData.refresh_token) {
      proSession.refreshToken = tokenData.refresh_token;
    }

    res.send(`
      <h2>Pro authorization successful</h2>
      <p>Copy this refresh token to your <code>.env</code> as <code>SPOTIFY_PRO_REFRESH_TOKEN</code> to persist access:</p>
      <pre>${proSession.refreshToken || 'No refresh token returned'}</pre>
      <a href="/">Back to OBSmusic overlay</a>
    `);
  } catch (authError) {
    res.status(500).send(`Auth failed: ${authError.message}`);
  }
});

router.get('/pro/current-track', async (_req, res) => {
  try {
    const token = await ensureProAccessToken();
    const currentlyPlaying = await fetchCurrentlyPlaying(token);

    if (!currentlyPlaying || !currentlyPlaying.item) {
      return res.json({ mode: 'pro', track: null, message: 'Nothing is currently playing' });
    }

    res.json({ mode: 'pro', track: normalizeTrack(currentlyPlaying.item) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
