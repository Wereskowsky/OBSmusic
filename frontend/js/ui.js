export function renderTrack(track, mode) {
  const modeLabel = document.getElementById('modeLabel');
  const trackName = document.getElementById('trackName');
  const trackArtists = document.getElementById('trackArtists');
  const albumCover = document.getElementById('albumCover');

  modeLabel.textContent = `Mode: ${mode.toUpperCase()}`;

  if (!track) {
    trackName.textContent = 'Сейчас ничего не воспроизводится';
    trackArtists.textContent = 'Запустите трек в Spotify';
    albumCover.src = '';
    albumCover.style.visibility = 'hidden';
    return;
  }

  trackName.textContent = track.name;
  trackArtists.textContent = `${track.artists} — ${track.album}`;

  if (track.albumImage) {
    albumCover.src = track.albumImage;
    albumCover.style.visibility = 'visible';
  }
}

export function renderError(message) {
  const trackName = document.getElementById('trackName');
  const trackArtists = document.getElementById('trackArtists');
  trackName.textContent = 'Ошибка';
  trackArtists.textContent = message;
}

export function setModeButtons(activeMode) {
  document.querySelectorAll('.mode-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === activeMode);
  });

  const refreshBtn = document.getElementById('refreshBtn');
  refreshBtn.disabled = activeMode === 'pro';
}
