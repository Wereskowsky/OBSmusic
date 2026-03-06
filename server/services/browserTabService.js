const DEFAULT_ENDPOINTS = ['http://127.0.0.1:9222/json', 'http://127.0.0.1:9223/json'];

const SERVICE_MATCHERS = {
  ytmusic: ['music.youtube.com'],
  spotify: ['open.spotify.com'],
  yandex: ['music.yandex.ru'],
};

function getDebugEndpoints() {
  const raw = process.env.BROWSER_DEBUG_ENDPOINTS;
  if (!raw) {
    return DEFAULT_ENDPOINTS;
  }
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function fetchTabsFromEndpoint(endpoint) {
  try {
    const response = await fetch(endpoint, { signal: AbortSignal.timeout(1400) });
    if (!response.ok) {
      return [];
    }
    const payload = await response.json();
    if (!Array.isArray(payload)) {
      return [];
    }

    return payload
      .filter((tab) => tab.type === 'page' && tab.url)
      .map((tab) => ({
        endpoint,
        id: tab.id,
        title: tab.title,
        url: tab.url,
        faviconUrl: tab.faviconUrl || null,
        webSocketDebuggerUrl: tab.webSocketDebuggerUrl || null,
      }));
  } catch (_error) {
    return [];
  }
}

async function discoverMusicTabs() {
  const endpoints = getDebugEndpoints();
  const allTabs = [];

  for (const endpoint of endpoints) {
    const tabs = await fetchTabsFromEndpoint(endpoint);
    allTabs.push(...tabs);
  }

  const services = {
    spotify: null,
    ytmusic: null,
    yandex: null,
  };

  allTabs.forEach((tab) => {
    Object.entries(SERVICE_MATCHERS).forEach(([service, domains]) => {
      if (services[service]) {
        return;
      }
      if (domains.some((domain) => tab.url.includes(domain))) {
        services[service] = tab;
      }
    });
  });

  return {
    endpoints,
    services,
  };
}

function parseTrackFromTitle(service, title) {
  if (!title) {
    return null;
  }

  if (service === 'ytmusic') {
    const cleaned = title.replace(/ - YouTube Music$/i, '').trim();
    const parts = cleaned.split(' - ');
    if (parts.length >= 2) {
      return { name: parts[0].trim(), artists: parts.slice(1).join(' - ').trim() };
    }
    return { name: cleaned, artists: 'YouTube Music' };
  }

  if (service === 'yandex') {
    const cleaned = title.replace(/ — Яндекс Музыка$/i, '').trim();
    const parts = cleaned.split(' — ');
    if (parts.length >= 2) {
      return { name: parts[0].trim(), artists: parts[1].trim() };
    }
    return { name: cleaned, artists: 'Яндекс Музыка' };
  }

  if (service === 'spotify') {
    const cleaned = title.replace(/ - Spotify$/i, '').trim();
    const parts = cleaned.split(' - ');
    if (parts.length >= 2) {
      return { name: parts[0].trim(), artists: parts.slice(1).join(' - ').trim() };
    }
    return { name: cleaned, artists: 'Spotify' };
  }

  return null;
}

function buildTrackFromTab(service, tab) {
  if (!tab) {
    return null;
  }

  const parsed = parseTrackFromTitle(service, tab.title);
  if (!parsed) {
    return null;
  }

  return {
    id: `${service}-${tab.id}`,
    name: parsed.name,
    artists: parsed.artists,
    album: service === 'yandex' ? 'Яндекс Музыка' : service === 'ytmusic' ? 'YouTube Music' : 'Spotify',
    albumImage: tab.faviconUrl,
    externalUrl: tab.url,
    source: 'browser-tab',
  };
}

module.exports = {
  buildTrackFromTab,
  discoverMusicTabs,
};
