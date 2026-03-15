# Quiz Monorepo

Минимальный monorepo для квиз-платформы с приложениями:

- `apps/backend` — Node.js + TypeScript API.
- `apps/frontend` — пользовательский React-клиент.
- `apps/admin` — админ-панель React.
- `packages/shared` — общие типы и утилиты.

## Требования

- Node.js 20+
- npm 10+
- Docker + Docker Compose

## Быстрый старт

1. Установить зависимости:

```bash
npm install
```

2. Скопировать переменные окружения:

```bash
cp env.example .env
```

3. Поднять PostgreSQL:

```bash
docker compose up -d postgres
```

4. Прогнать миграции:

```bash
npm run db:migrate -w apps/backend
```

5. Заполнить демо-данными:

```bash
npm run db:seed -w apps/backend
```

## Локальный запуск

- Backend:

```bash
npm run dev -w apps/backend
```

- Frontend:

```bash
npm run dev -w apps/frontend
```

- Admin:

```bash
npm run dev -w apps/admin
```

## Проверки

- Lint для всего monorepo:

```bash
npm run lint
```

- Тесты для всего monorepo:

```bash
npm run test
```

- Сборка:

```bash
npm run build
```

## База данных

SQL-миграции: `apps/backend/db/migrations`.

Seed-данные: `apps/backend/db/seeds`.

Ключевые таблицы:

- `users`
- `rooms`
- `room_members`
- `quiz_packs`
- `questions`
- `game_sessions`
- `session_questions`
- `answers`
- `session_scores`
- `generated_assets`
- `reports`
- `analytics_events`
