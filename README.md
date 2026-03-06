# OBSmusic Web Plugin

Плагин-оверлей для OBS с треками из **Spotify, YouTube Music и Яндекс Музыки**.

## Новое: автопоиск сервисов

Добавлен автоматический поиск музыкальных сервисов, которые открыты в браузере:

- Spotify (`open.spotify.com`)
- YouTube Music (`music.youtube.com`)
- Яндекс Музыка (`music.yandex.ru`)

В интерфейсе есть кнопка **«Автопоиск сервисов»** и выпадающий список выбора сервиса.

> Важно: для автопоиска браузер должен быть запущен с remote debugging портом (Chrome/Edge).

Пример запуска Chrome:

```bash
chrome.exe --remote-debugging-port=9222
```

---

## Режимы

- **Free**: обновление вручную кнопкой.
- **Pro**: автообновление каждые 3 секунды.
  - Для Spotify Pro использует OAuth и `/me/player/currently-playing`.
  - Для YouTube Music / Яндекс Музыки берёт данные из заголовка открытой вкладки (через devtools endpoint).

---

## Быстрый старт пользователя (.exe)

1. Установи `OBSmusic-Setup.exe`.
2. Запусти OBSmusic.
3. Открой Spotify/YouTube Music/Яндекс Музыку в браузере.
4. Нажми «Автопоиск сервисов».
5. Добавь в OBS:
   - `Window Capture` (окно браузера), или
   - `Browser Source` с `http://localhost:3000`.

---

## Сборка установщика (Windows)

Требуется: Node.js 20+, Inno Setup 6.

```bash
npm install
npm run build:win:installer
```

Артефакты:

- `dist/OBSmusic.exe`
- `dist/installer/OBSmusic-Setup.exe`

---

## Конфиг `.env`

```env
PORT=3000
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/pro/auth/callback
SPOTIFY_FREE_TRACK_ID=11dFghVXANMlKmJXsNCbNl
SPOTIFY_PRO_REFRESH_TOKEN=
OBSMUSIC_AUTO_OPEN=1
OBSMUSIC_OPEN_BROWSER=1
BROWSER_DEBUG_ENDPOINTS=http://127.0.0.1:9222/json,http://127.0.0.1:9223/json
```

---

## API

- `GET /api/config`
- `GET /api/free/current-track`
- `GET /api/pro/current-track`
- `GET /api/pro/auth/login`
- `GET /api/pro/auth/callback`
- `GET /api/services/discovery`
- `GET /api/services/current-track?service=spotify|ytmusic|yandex`
