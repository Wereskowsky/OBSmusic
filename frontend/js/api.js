export async function fetchConfig() {
  const response = await fetch('/api/config');
  if (!response.ok) {
    throw new Error('Config request failed');
  }
  return response.json();
}

export async function fetchFreeTrack() {
  const response = await fetch('/api/free/current-track');
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Free track request failed');
  }
  return data;
}

export async function fetchProTrack() {
  const response = await fetch('/api/pro/current-track');
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Pro track request failed');
  }
  return data;
}
