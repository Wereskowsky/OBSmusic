import { fetchConfig, fetchFreeTrack, fetchProTrack } from './api.js';
import { applyStyleSettings, loadStyleSettings, saveStyleSettings } from './settings.js';
import { renderError, renderTrack, setModeButtons } from './ui.js';

let mode = 'free';
let proIntervalId = null;

async function updateTrack() {
  try {
    const payload = mode === 'pro' ? await fetchProTrack() : await fetchFreeTrack();
    renderTrack(payload.track, mode);
  } catch (error) {
    renderError(error.message);
  }
}

function startProPolling() {
  stopProPolling();
  proIntervalId = window.setInterval(() => {
    updateTrack();
  }, 3000);
}

function stopProPolling() {
  if (proIntervalId) {
    clearInterval(proIntervalId);
    proIntervalId = null;
  }
}

function bindModeButtons() {
  document.querySelectorAll('.mode-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      mode = button.dataset.mode;
      setModeButtons(mode);

      if (mode === 'pro') {
        startProPolling();
      } else {
        stopProPolling();
      }

      await updateTrack();
    });
  });
}

function bindRefreshButton() {
  document.getElementById('refreshBtn').addEventListener('click', updateTrack);
}

function bindStyleControls() {
  const textColor = document.getElementById('textColor');
  const backgroundColor = document.getElementById('backgroundColor');
  const radius = document.getElementById('radius');

  const onChange = () => {
    const settings = {
      textColor: textColor.value,
      backgroundColor: backgroundColor.value,
      radius: Number(radius.value),
    };
    applyStyleSettings(settings);
    saveStyleSettings(settings);
  };

  [textColor, backgroundColor, radius].forEach((el) => el.addEventListener('input', onChange));
}

async function bootstrap() {
  const settings = loadStyleSettings();
  applyStyleSettings(settings);
  bindModeButtons();
  bindRefreshButton();
  bindStyleControls();
  setModeButtons(mode);

  const config = await fetchConfig();
  if (!config.pro.authorized) {
    document.getElementById('proAuthBtn').classList.add('warn');
  }

  await updateTrack();
}

bootstrap().catch((error) => renderError(error.message));
