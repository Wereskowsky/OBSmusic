# OBSmusic Web Plugin

Веб-плагин (Browser Source) для OBS, который показывает обложку альбома и название трека из Spotify.

## Что реализовано

- **Free-режим**:
  - обновление вручную по кнопке `Обновить вручную`;
  - использует Spotify API через `client_credentials` (демо-трек из `SPOTIFY_FREE_TRACK_ID`).
- **Pro-режим**:
  - авторизация через Spotify OAuth;
  - получение **текущего трека пользователя** (`/me/player/currently-playing`);
  - автообновление каждые **3 секунды**.
- **Настройки стиля**:
  - цвет текста;
  - цвет фона карточки;
  - радиус скругления;
  - настройки сохраняются в `localStorage`.

---

## Архитектура модулей

- `frontend/` — интерфейс HTML/CSS/JavaScript (overlay + настройки).
  - `frontend/index.html` — UI.
  - `frontend/styles.css` — стили.
  - `frontend/js/api.js` — запросы к backend.
  - `frontend/js/ui.js` — рендер трека/ошибок/режимов.
  - `frontend/js/settings.js` — кастомизация стиля и localStorage.
  - `frontend/js/app.js` — точка входа (режимы, polling, обработчики).
- `server/` — Node.js backend.
  - `server/index.js` — запуск Express и раздача frontend.
  - `server/routes/api.js` — REST API для free/pro режимов и OAuth callbacks.
  - `server/services/spotifyService.js` — интеграция со Spotify API.

---

## Установка

1. Установи зависимости:

```bash
npm install
```

2. Создай `.env` на основе примера:

```bash
cp .env.example .env
```

3. Заполни значения в `.env`:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REDIRECT_URI` (обычно `http://localhost:3000/api/pro/auth/callback`)
- `SPOTIFY_FREE_TRACK_ID` (любой публичный track id для Free-режима)

4. Запусти сервер:

```bash
npm start
```

5. В OBS добавь источник **Browser Source** и укажи URL:

```text
http://localhost:3000
```

---

## Настройка Spotify приложения

1. Открой [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Создай приложение.
3. В `Redirect URIs` добавь URL из `.env` (`SPOTIFY_REDIRECT_URI`).
4. Скопируй `Client ID` и `Client Secret` в `.env`.

---

## Как активировать Pro-доступ

1. Запусти приложение.
2. Открой `http://localhost:3000`.
3. Переключись в `Pro` и нажми `Авторизовать Pro`.
4. Пройди логин Spotify и подтверждение scope.
5. На странице callback появится `refresh token`.
6. Скопируй его в `.env` как `SPOTIFY_PRO_REFRESH_TOKEN`.
7. Перезапусти сервер.

После этого Pro-режим будет автоматически подтягивать текущий трек каждые 3 секунды.

---

## API (кратко)

- `GET /api/free/current-track` — получить трек для Free-режима.
- `GET /api/pro/auth/login` — старт OAuth.
- `GET /api/pro/auth/callback` — callback OAuth.
- `GET /api/pro/current-track` — текущий трек авторизованного пользователя.
- `GET /api/config` — конфиг режимов.

---

## Примечания

- Для Pro-режима в Spotify должен реально идти playback (иначе Spotify вернет пустой результат).
- Free-режим сделан как безопасный базовый вариант без пользовательской авторизации.
