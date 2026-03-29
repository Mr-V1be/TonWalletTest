# TON Testnet Wallet

Self-custodial web-кошелек для TON testnet. Работает полностью в браузере, без бэкенда.

---

## Быстрый старт

### Docker (рекомендуется, работает на Linux / macOS / Windows)

Нужен только [Docker](https://docs.docker.com/get-docker/). Ничего больше устанавливать не надо.

```bash
# Linux / macOS
./start.sh

# Windows
start.bat

# Или через pnpm (если Node.js установлен)
pnpm start:all
```

Приложение будет доступно на **http://localhost:8090**

```bash
# Остановить
pnpm docker:down

# Посмотреть логи
pnpm docker:logs
```

### Локальный запуск (для разработки)

Нужен Node.js 20+ и pnpm 9+.

```bash
pnpm install
pnpm dev
```

Приложение будет доступно на **http://localhost:5173**

Или одной командой (автоматически установит зависимости):

```bash
pnpm start:local
```

Чтобы открыть доступ по сети (например с телефона):

```bash
pnpm dev:host
# Откроется на http://0.0.0.0:3000
```

---

## Все команды

| Команда | Описание |
|---|---|
| `pnpm dev` | Dev-сервер (localhost:5173) |
| `pnpm dev:host` | Dev-сервер с доступом по сети (0.0.0.0:3000) |
| `pnpm build` | Проверка типов + production-сборка |
| `pnpm preview` | Превью production-сборки |
| `pnpm test` | Запуск всех тестов |
| `pnpm test:watch` | Тесты в watch-режиме |
| `pnpm start:local` | Локальный запуск (auto-install + dev) |
| `pnpm start:all` | Docker-запуск с ожиданием готовности |
| `pnpm docker:up` | Поднять Docker-контейнер |
| `pnpm docker:down` | Остановить контейнер |
| `pnpm docker:logs` | Логи контейнера |

---

## Как пользоваться

1. **Создать кошелек** — нажать "Create a new wallet", задать пароль, **обязательно сохранить seed-фразу**
2. **Получить тестовые TON** — отправить свой адрес боту https://t.me/testgiver_ton_bot
3. **Отправить TON** — вкладка Send, вставить адрес получателя, указать сумму, Review transfer, Send TON
4. **Получить TON** — вкладка Receive, скопировать адрес или показать QR-код
5. **Импорт кошелька** — на стартовой странице "Import existing wallet", вставить seed-фразу из 24 слов

---

## Стек технологий

| Категория | Технология |
|---|---|
| UI | React 19, TypeScript |
| Сборка | Vite 7 |
| Стили | Tailwind CSS 4 |
| Роутинг | TanStack Router |
| Серверное состояние | TanStack Query |
| Клиентское состояние | Zustand |
| Блокчейн | @ton/ton, @ton/crypto |
| Шифрование | Web Crypto API (PBKDF2 + AES-GCM) |
| Тесты | Vitest, React Testing Library |
| Деплой | Docker, Nginx |

---

## Структура проекта

```
src/
  app/              — bootstrap, providers, роутер, shell (сайдбар, навигация)
  core/
    domain/         — доменные сущности и value objects
    application/    — use cases и порты (интерфейсы)
  features/         — страницы и фичи
    wallet-dashboard/   — главная (баланс, транзакции)
    send-ton/           — отправка TON
    receive-ton/        — получение TON (адрес, QR)
    settings/           — настройки (доверенные адреса, язык, лок)
    unlock-wallet/      — создание, импорт, разблокировка
    create-wallet/
    import-wallet/
  infrastructure/   — реализации портов
    ton/            — TON Center API, подпись и отправка транзакций
    storage/        — localStorage адаптеры
    crypto/         — Web Crypto шифрование
  shared/
    ui/             — UI-компоненты (кнопки, инпуты, пиллы, лого)
    i18n/           — локализация (EN / RU)
    styles/         — Tailwind конфиг и глобальные стили
    lib/            — утилиты
    config/         — конфигурация API и навигации
ops/                — Docker (Dockerfile, nginx.conf, compose.yml)
start.sh            — скрипт запуска для Linux/macOS
start.bat           — скрипт запуска для Windows
```

---

## Безопасность

- Seed-фраза хранится только локально в браузере в зашифрованном виде
- Шифрование: `PBKDF2` (600 000 итераций) + `AES-256-GCM`
- Доступ к seed — через локальный passcode
- Unlocked session живет только в памяти текущей вкладки
- После reload нужен повторный unlock
- Ручной Lock wallet + auto-lock через 15 минут бездействия
- Временная блокировка после серии неверных попыток ввода passcode

> Это осознанный компромисс. Решение не позиционируется как production-grade security.

---

## Логика отправки

Перед отправкой приложение:

- Нормализует адрес в canonical testnet user-friendly формат
- Блокирует невалидный адрес
- Блокирует адрес без testnet-маркера
- Блокирует некорректную сумму
- Блокирует отправку если не хватает баланса (с учетом резерва 0.05 TON)
- Предупреждает при отправке на новый/raw/self/uninit адрес

Отправка разделена на два шага: **Review transfer** и **Send TON**.
После отправки — статус в реальном времени (submitting → broadcasted → confirmed / failed).

---

## TON Center API key

Без API-ключа TON Center сильно ограничивает количество запросов (ошибка 429). Для стабильной работы рекомендуется получить бесплатный ключ:

1. Перейти на https://toncenter.com
2. Нажать "Get API key"
3. Получить ключ через Telegram-бота [@tonapibot](https://t.me/tonapibot) — выбрать **testnet**
4. Вставить ключ в приложении: **Settings → TON Center API key → Validate and save**

Или через env-переменную (для разработки):

```env
VITE_TONCENTER_API_KEY=ваш_ключ_сюда
```

Приоритет: локальный ключ (из Settings) > env-переменная > без ключа.

---

## Env-переменные (опционально)

```env
VITE_TONCENTER_V2_ENDPOINT=https://testnet.toncenter.com/api/v2
VITE_TONCENTER_V3_ENDPOINT=https://testnet.toncenter.com/api/v3
VITE_TONCENTER_API_KEY=ваш_api_key
```

---

## Требования

**Локальный запуск:** Node.js 20+, pnpm 9+

**Docker:** Docker 24+, Docker Compose v2

**Браузеры:** Chrome 111+, Firefox 128+, Safari 16.4+
