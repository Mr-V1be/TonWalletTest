# TON Testnet Wallet

Небольшой browser-only self-custodial web-app кошелька для `TON testnet` без собственного backend.

Приложение позволяет:
- создать новый testnet-кошелек;
- импортировать существующий по seed phrase;
- разблокировать кошелек локальным passcode;
- увидеть адрес и баланс;
- увидеть последние транзакции и искать по ним;
- скопировать адрес на экране `Receive`;
- показать QR-код для быстрого сканирования адреса;
- отправить TON на другой адрес;
- получить предупреждения перед отправкой в рискованных сценариях.

## Стек
- `React + TypeScript + Vite`
- `TanStack Router`
- `TanStack Query`
- `Zod`
- `Zustand`
- `@ton/ton`, `@ton/crypto`
- `Web Crypto API`
- `Vitest`
- `React Testing Library`

## Запуск
Требования:
- `Node.js 24+`
- `pnpm 10+`

Локальная разработка без Docker:
```bash
pnpm install
pnpm start:local
```

Запуск всего приложения через Docker одной командой:
```bash
pnpm start:all
```

Скрипт сам выполнит `docker compose up --build -d`,
дождется `200 OK` и выведет готовый URL.

Опциональные env-переменные для локальной настройки:
- `VITE_TONCENTER_V2_ENDPOINT`
- `VITE_TONCENTER_V3_ENDPOINT`

Сборка:
```bash
pnpm build
pnpm preview
```

Тесты:
```bash
pnpm test
```

Docker:
```bash
pnpm docker:up
pnpm docker:logs
pnpm docker:down
```

Приложение будет доступно на `http://localhost:8090`.

## Архитектура
Проект собран как `modular monolith` с явными границами между слоями:

- `src/core/domain` — доменные сущности и value objects
- `src/core/application` — use cases и порты
- `src/infrastructure` — адаптеры для TON, storage и crypto
- `src/features` — пользовательские сценарии и экраны
- `src/shared` — общий UI, config и стили
- `src/app` — bootstrap, providers, router и app shell

Важные ограничения, которые соблюдаются по коду:
- `SOLID` как базовый инженерный принцип;
- не больше `200` строк в одном файле;
- не больше `7` файлов в одной папке;
- если файлов становится больше, они группируются в подпапки.

Дополнительные проектные решения задокументированы в:
- [product-decisions.md](/home/admin228/Codding/TonWallet/new/product-decisions.md)
- [architecture-decisions.md](/home/admin228/Codding/TonWallet/new/architecture-decisions.md)
- [development-plan.md](/home/admin228/Codding/TonWallet/new/development-plan.md)

## Как устроено хранение секрета
- seed phrase хранится только локально в браузере;
- seed не хранится в открытом виде;
- для шифрования используется `Web Crypto API` (`PBKDF2 + AES-GCM`);
- доступ к seed дается через локальный passcode пользователя;
- unlocked session живет только в памяти текущей вкладки;
- после `reload` нужен повторный unlock;
- есть ручной `Lock wallet`;
- есть auto-lock через `15 минут` бездействия.
- после серии неверных passcode включается временный unlock backoff.

Это осознанный компромисс для тестового задания. Решение не позиционируется как production-grade security model.

## Работа с TON

- сеть: `TON testnet`
- wallet contract: `Wallet V5R1`
- provider: `TON Center testnet`
- чтение баланса и истории идет через публичный API без приватного ключа в клиентском bundle;
- подпись транзакции делается локально в браузере;
- отправка идет через публичный testnet RPC.

## Реализованная логика anti-address-swap

Перед отправкой приложение:

- нормализует адрес в canonical `testnet user-friendly` формат;
- блокирует невалидный адрес;
- блокирует friendly address без `testnet` marker;
- блокирует некорректную сумму;
- блокирует отправку, если не хватает баланса с учетом обязательного резерва `0.05 TON`;
- показывает полный нормализованный адрес на review step;
- предупреждает для `raw` address;
- предупреждает для нового адреса без истории;
- предупреждает для адреса, похожего на недавний;
- предупреждает при `self-send`;
- предупреждает для `uninit` recipient.

`recent recipients` и `trusted addresses` сохраняются локально и используются в warning-логике.

## Send flow

UX отправки разделен на два шага:

1. `Review transfer`
2. `Send TON`

После подтверждения пользователь получает понятный статус:

- preparing/submitting;
- broadcasted;
- confirmed;
- timeout;
- failed.

После подтверждения статус-карточка дает прямую ссылку в testnet explorer.

Подтверждение определяется через `seqno` кошелька и последующий polling новых outgoing транзакций после роста `seqno`.

## История транзакций

- на главном экране загружаются последние `20` транзакций;
- поиск работает по уже загруженному набору;
- поля поиска: адрес, hash, comment, сумма;
- есть `Load 20 more`, но общий лимит capped для browser-only режима;
- доступны ссылки в testnet explorer для транзакции и контрагента.

## Дизайн

Зафиксированные ограничения:

- без обводок;
- без градиентов;
- визуально близко к TON;
- современный, чистый, mobile-first интерфейс.

Практически это выражено через:

- темную Tonkeeper-like палитру;
- `TON blue` как accent;
- мягкие тени;
- color-surface warning cards;
- минималистичный app shell с нижней навигацией.

## Тестирование

- `pnpm test` покрывает use cases, crypto/storage и ключевые UI-сценарии `Receive`, `Send`, `Settings`;
- `pnpm build` используется как обязательная проверка production-сборки;
- Docker-сборка повторно использует production build из того же пайплайна.

## Ограничения текущей версии

- сейчас поддерживается один локальный кошелек на браузер;
- подтверждение отправки не использует backend/trace API и остается browser-only компромиссом;
- нет полноценного Playwright e2e контура;
- нет production-grade hardening для secure storage.

## Что можно улучшить дальше

- улучшить confirmation tracking через более строгую trace/hash-based проверку;
- расширить тесты до более широкого component/e2e уровня;
- добавить кэш истории и optimistic refresh;
- при необходимости добавить multi-wallet поддержку.
