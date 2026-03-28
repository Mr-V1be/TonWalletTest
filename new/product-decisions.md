# Product Decisions Index

## Цель

Этот файл стал коротким индексом решений. Подробности вынесены в подпапку `new/decisions/`, чтобы соблюдать зафиксированное ограничение `до 200 строк на файл`.

## Подробные decision-файлы

- [Foundation Decisions](/home/admin228/Codding/TonWallet/new/decisions/foundation-decisions.md)
- [App Flow Decisions](/home/admin228/Codding/TonWallet/new/decisions/app-flow-decisions.md)
- [Design Decisions](/home/admin228/Codding/TonWallet/new/decisions/design-decisions.md)
- [Architecture Decisions](/home/admin228/Codding/TonWallet/new/architecture-decisions.md)
- [Development Plan](/home/admin228/Codding/TonWallet/new/development-plan.md)

## Что уже зафиксировано

- browser-only web app без backend;
- `TON testnet`;
- self-custodial модель;
- `Wallet V5R1`;
- `TON Center testnet`;
- `React + TypeScript + Vite`;
- `TanStack Router`, `TanStack Query`, `Zod`, `Zustand`;
- `Web Crypto` + passcode для encrypted seed storage;
- гибридная навигация: onboarding отдельно, основная часть внутри app shell;
- session unlock только в памяти вкладки;
- `Lock wallet` + auto-lock;
- `Wallet`, `Send`, `Receive`, `Settings` как основные разделы;
- история: `20` записей, локальный поиск, `Load more`;
- отдельный confirm step перед отправкой;
- anti-address-swap проверки и warnings;
- минималистичный стиль в духе TON без обводок и без градиентов;
- инженерные ограничения: `SOLID`, до `200` строк на файл, до `7` файлов в папке.

## Что остается не критичным и может уточняться по ходу

- один локальный кошелек или поддержка нескольких;
- QR на `Receive`;
- поле `comment` в `Send`;
- dark theme;
- explorer links в первой версии.

## Что должно попасть в README

- инструкция по запуску;
- выбранный стек и причины выбора;
- описание архитектуры без backend;
- модель хранения seed-фразы;
- send-flow и подтверждение транзакции;
- anti-address-swap логика;
- принятые компромиссы;
- дальнейшие улучшения.
