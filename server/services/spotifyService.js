const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

async function requestClientCredentialsToken(clientId, clientSecret) {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const body = new URLSearchParams({ grant_type: 'client_credentials' });

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spotify token error: ${response.status} ${text}`);
  }

  return response.json();
}

async function requestRefreshToken(clientId, clientSecret, refreshToken) {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spotify refresh error: ${response.status} ${text}`);
  }

  return response.json();
}

async function exchangeCodeForTokens(clientId, clientSecret, code, redirectUri) {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spotify auth code exchange error: ${response.status} ${text}`);
  }

  return response.json();
}

async function fetchCurrentlyPlaying(accessToken) {
  const response = await fetch(`${SPOTIFY_API_URL}/me/player/currently-playing`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spotify current track error: ${response.status} ${text}`);
  }

  return response.json();
}

async function fetchTrack(trackId, accessToken) {
  const response = await fetch(`${SPOTIFY_API_URL}/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spotify track error: ${response.status} ${text}`);
  }

  return response.json();
}

function normalizeTrack(track) {
  if (!track) {
    return null;
  }

  const artists = (track.artists || []).map((artist) => artist.name).join(', ');
  return {
    id: track.id,
    name: track.name,
    artists,
    album: track.album?.name || 'Unknown album',
    albumImage: track.album?.images?.[0]?.url || null,
    externalUrl: track.external_urls?.spotify || null,
  };
}

module.exports = {
  exchangeCodeForTokens,
  fetchCurrentlyPlaying,
  fetchTrack,
  normalizeTrack,
  requestClientCredentialsToken,
  requestRefreshToken,
};
