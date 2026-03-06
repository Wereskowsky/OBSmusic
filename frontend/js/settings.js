const STORAGE_KEY = 'obsmusic-style';

export function loadStyleSettings() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { textColor: '#ffffff', backgroundColor: '#121212', radius: 14 };
  }

  try {
    return JSON.parse(raw);
  } catch (_error) {
    return { textColor: '#ffffff', backgroundColor: '#121212', radius: 14 };
  }
}

export function saveStyleSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function applyStyleSettings({ textColor, backgroundColor, radius }) {
  const card = document.getElementById('overlayCard');
  card.style.color = textColor;
  card.style.backgroundColor = backgroundColor;
  card.style.borderRadius = `${radius}px`;

  document.getElementById('textColor').value = textColor;
  document.getElementById('backgroundColor').value = backgroundColor;
  document.getElementById('radius').value = radius;
}
