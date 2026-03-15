# MVP-003 — Architecture v1 (draft)

## Контекст
Monorepo содержит 3 приложения (`backend`, `frontend`, `admin`) и пакет `shared`. Архитектура MVP должна поддерживать realtime-сценарий квиза при минимальной сложности эксплуатации.

## Логическая схема
- **Frontend (React):** lobby, session, results.
- **Backend (Node.js/TypeScript):** REST + WebSocket, game orchestration, scoring.
- **PostgreSQL:** source of truth для комнат, сессий, ответов и рейтинга.
- **Admin (React):** базовое управление контентом/отчетами (ограниченный MVP scope).

## Backend boundaries
- `rooms` module: join/leave/start-session.
- `sessions` module: lifecycle game session + state transition.
- `answers` module: прием и валидация ответов.
- `scores` module: расчет и публикация leaderboard.
- `content` module: quiz packs и вопросы.

## Data flow (MVP happy path)
1. Host создает/открывает room.
2. Players join room через REST endpoint.
3. Host запускает session; backend фиксирует набор вопросов.
4. Вопросы и таймер идут по WS.
5. Ответы игроков принимаются backend и пишутся в БД.
6. Backend рассчитывает score и рассылает промежуточный/финальный leaderboard.

## Нефункциональные решения на MVP
- Один backend instance (без распределенного lock).
- Idempotency для `start session` и `submit answer`.
- Health endpoint + базовые структурированные логи.
- Миграции и seed как обязательная часть окружения.

## Open decisions (до MVP-006)
- Единый namespace WS-событий и versioning.
- Стратегия reconnect/resync состояния игрока.
- Формат ошибок для REST и WS (единый error envelope).
