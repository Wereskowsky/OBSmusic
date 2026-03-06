# OBSmusic Web Plugin

Готовый плагин/оверлей для OBS с Spotify, теперь с **автоматической установкой под Windows через `.exe`**.

## Что умеет

- **Free**: обновление трека по кнопке.
- **Pro**: Spotify OAuth + автообновление каждые **3 секунды**.
- Отображение:
  - название трека;
  - исполнители;
  - обложка альбома.
- Простая кастомизация:
  - цвет текста;
  - цвет фона;
  - скругление.

---

## Быстрый старт для пользователя (без Node.js)

> Цель: «поставил `.exe` → запустил → всё работает».

1. Скачай `OBSmusic-Setup.exe` из релиза.
2. Установи программу обычным мастером установки.
3. Запусти `OBSmusic` из меню Пуск.
4. Приложение автоматически поднимет локальный сервер и откроет окно с оверлеем (`http://localhost:3000`).
5. В OBS:
   - либо добавь **Захват окна** и выбери окно браузера с OBSmusic;
   - либо добавь **Browser Source** с URL `http://localhost:3000`.

---

## Как собрать `OBSmusic-Setup.exe` (для разработчика)

### Требования

- Windows x64
- Node.js 20+
- Inno Setup 6

### Команды

```bash
npm install
npm run build:win:installer
```

Результат:

- portable: `dist/OBSmusic.exe`
- installer: `dist/installer/OBSmusic-Setup.exe`

Скрипт сборки:

- `scripts/build-windows-installer.ps1`
- Inno Setup конфиг: `installer/windows/OBSmusic.iss`

---

## Настройка Spotify

1. Создай приложение в [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Добавь Redirect URI: `http://localhost:3000/api/pro/auth/callback`.
3. Заполни `.env` рядом с `OBSmusic.exe`:

```env
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/pro/auth/callback
SPOTIFY_FREE_TRACK_ID=11dFghVXANMlKmJXsNCbNl
```

При первом запуске установщик создаёт `.env` из `.env.example` автоматически (если `.env` ещё нет).

---

## Активация Pro

1. Открой интерфейс OBSmusic.
2. Переключись в `Pro`.
3. Нажми `Авторизовать Pro`.
4. После callback скопируй refresh token.
5. Вставь его в `.env`:

```env
SPOTIFY_PRO_REFRESH_TOKEN=...
```

6. Перезапусти приложение.

---

## Архитектура

- `frontend/` — HTML/CSS/JS интерфейс.
- `server/` — Node.js API и Spotify интеграция.
- `scripts/` + `installer/windows/` — упаковка в portable `.exe` и инсталлятор.

---

## API

- `GET /api/free/current-track`
- `GET /api/pro/auth/login`
- `GET /api/pro/auth/callback`
- `GET /api/pro/current-track`
- `GET /api/config`
