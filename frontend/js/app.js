import {
  fetchConfig,
  fetchFreeTrack,
  fetchProTrack,
  fetchServiceDiscovery,
  fetchServiceTrack,
} from './api.js';
import { applyStyleSettings, loadStyleSettings, saveStyleSettings } from './settings.js';
import { renderError, renderTrack, setModeButtons } from './ui.js';

let mode = 'free';
let selectedService = 'spotify';
let proIntervalId = null;

function setDiscoveryStatus(text) {
  const status = document.getElementById('discoveryStatus');
  status.textContent = text;
}

async function updateTrack() {
  try {
    let payload;

    if (selectedService === 'spotify') {
      payload = mode === 'pro' ? await fetchProTrack() : await fetchFreeTrack();
    } else {
      payload = await fetchServiceTrack(selectedService);
    }

    renderTrack(payload.track, `${mode}/${selectedService}`);
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

async function runDiscovery() {
  try {
    const data = await fetchServiceDiscovery();
    const opened = Object.entries(data.services)
      .filter(([, tab]) => Boolean(tab))
      .map(([service]) => service);

    if (opened.length === 0) {
      setDiscoveryStatus('Сервисы не найдены. Запустите Chrome/Edge с --remote-debugging-port=9222 и откройте вкладку сервиса.');
      return;
    }

    const select = document.getElementById('serviceSelect');
    const preferred = opened.includes(selectedService) ? selectedService : opened[0];
    selectedService = preferred;
    select.value = preferred;

    setDiscoveryStatus(`Найдены открытые сервисы: ${opened.join(', ')}.`);
    await updateTrack();
  } catch (error) {
    setDiscoveryStatus(`Ошибка автопоиска: ${error.message}`);
  }
}

function bindServiceSelector() {
  const select = document.getElementById('serviceSelect');
  select.addEventListener('change', async () => {
    selectedService = select.value;
    await updateTrack();
  });

  document.getElementById('scanServicesBtn').addEventListener('click', runDiscovery);
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
  bindServiceSelector();
  setModeButtons(mode);

  const config = await fetchConfig();
  if (!config.pro.authorized) {
    document.getElementById('proAuthBtn').classList.add('warn');
  }

  await runDiscovery();
  await updateTrack();
}

bootstrap().catch((error) => renderError(error.message));
