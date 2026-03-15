# MVP Delivery Plan (Telegram Quiz)

## 1) Базовые допущения

- Команда: **2 full-stack разработчика** + part-time дизайнер/контент/QA.
- Целевой срок MVP: **6 недель** (допустимо 5–7 при сдвигах контента и QA).
- Стек: **React + TypeScript (WebApp)**, **Node.js + NestJS-like модульная API-архитектура**, **Postgres**, **Redis**, **WebSocket**, **Docker**.
- Каналы запуска: **Telegram Bot + Telegram Web App**.
- Цель MVP: проверить **виральность**, **повторные сессии**, **удержание**.

## 2) Scope и приоритеты

### P0 (в MVP)

- Telegram auth без отдельной регистрации.
- Комнаты и лобби: create/join/invite/start.
- Игровая сессия на 10 вопросов с realtime-синхронизацией и серверным скорингом.
- Финальные результаты + result card + rematch + share loop.
- Базовая админка: контент, жалобы, ключевые метрики.
- Базовая аналитика воронки (room -> join -> start -> finish).
- Минимальная anti-abuse защита (rate limit, reports flow, soft block).

### P1 (post-MVP)

- Расширенные роли и RBAC в админке.
- Сложные игровые режимы, турниры, сезонность.
- Персонализированные рекомендации паков.

### P2 (post-MVP)

- Продвинутый антифрод и ML-модерация.
- A/B-платформа и автоматические эксперименты.

## 2.1 Story 1.1 — P0 Scope Contract (one-pager)

### Цель контракта

Зафиксировать единое понимание **что входит в P0**, что считается успешной поставкой, и что **осознанно исключено** до post-MVP (P1/P2).

### In-scope (P0)

1. **Telegram auth без отдельной регистрации**
2. **Комнаты и лобби:** create/join/invite/start
3. **Игровая сессия:** 10 вопросов, realtime sync, server-side scoring
4. **Результаты и виральный цикл:** result card, rematch, share
5. **Базовая админка:** контент, жалобы, ключевые метрики
6. **Базовая аналитика воронки:** room -> join -> start -> finish
7. **Минимальная anti-abuse защита:** rate limit, reports flow, soft block

### Out-of-scope (P1/P2)

- **P1:** расширенные роли/RBAC в админке, сложные режимы/турниры/сезонность, персональные рекомендации паков.
- **P2:** продвинутый антифрод и ML-модерация, A/B-платформа и авто-эксперименты.

### Нефункциональные границы P0

- Поддержка целевой платформы: Telegram Bot + Telegram Web App.
- Опора на существующий стек (React/TypeScript, Node.js, Postgres, Redis, WebSocket, Docker).
- Без разработки отдельного мобильного/desktop-native приложения в рамках MVP.

## 2.2 DoD + Acceptance Criteria для каждого P0 пункта

### 1) Telegram auth без отдельной регистрации

- **Definition of Done (DoD):**
  - Проверяется `initData` Telegram на backend.
  - Пользователь создаётся/обновляется (upsert) без ручной регистрации.
  - Сессия/токен валидно создаётся и используется в WebApp.
- **Acceptance Criteria:**
  - При открытии WebApp авторизованный пользователь попадает в приложение без формы sign-up/sign-in.
  - При невалидном `initData` доступ отклоняется с контролируемой ошибкой.

### 2) Комнаты и лобби (create/join/invite/start)

- **Definition of Done (DoD):**
  - Реализованы API/WS сценарии: создать комнату, присоединиться по invite, стартовать игру (host-only).
  - Обработана идемпотентность повторных join.
  - Состояние лобби синхронизируется между участниками в realtime.
- **Acceptance Criteria:**
  - Хост может создать комнату и получить ссылку-приглашение.
  - При переходе по invite второй игрок стабильно попадает в ту же комнату.
  - Кнопка `Start` доступна только хосту; у остальных read-only статус.

### 3) Игровая сессия: 10 вопросов + realtime + server scoring

- **Definition of Done (DoD):**
  - Сессия игры всегда состоит из 10 вопросов.
  - Ответы принимаются через realtime-канал с защитой от дублей.
  - Скоринг вычисляется только на сервере и сохраняется в БД.
- **Acceptance Criteria:**
  - Для 3+ одновременных игроков порядок вопросов и финальные очки консистентны.
  - Повторная отправка одного и того же ответа не дублирует начисление.
  - По завершении 10-го вопроса игра корректно переводится в финальное состояние.

### 4) Финальные результаты + result card + rematch + share

- **Definition of Done (DoD):**
  - Формируется экран итогов с позициями и очками.
  - Генерируется result card (asset/изображение) для шаринга.
  - Реализованы действия rematch и share.
- **Acceptance Criteria:**
  - После завершения игры каждый участник видит итоговый результат.
  - `Rematch` создаёт новую игровую сессию без ручной пересборки комнаты.
  - `Share` отдаёт валидный артефакт/ссылку для публикации в Telegram.

### 5) Базовая админка: контент, жалобы, ключевые метрики

- **Definition of Done (DoD):**
  - Доступен минимальный dashboard с ключевыми счётчиками.
  - Реализовано управление паками/вопросами (CRUD в MVP-объёме).
  - Реализована очередь жалоб и действие soft block.
- **Acceptance Criteria:**
  - Администратор может добавить/изменить/деактивировать вопрос или пак.
  - Новая жалоба появляется в очереди админки и может быть обработана.
  - Soft block пользователя отражается в его последующих игровых попытках.

### 6) Базовая аналитика воронки (room -> join -> start -> finish)

- **Definition of Done (DoD):**
  - События воронки отправляются в единой схеме именования.
  - Данные сохраняются и доступны для базового отчёта по конверсиям.
  - Проверена целостность event flow на тестовых сценариях.
- **Acceptance Criteria:**
  - Для тестовой партии из N комнат в отчёте видны все 4 шага воронки.
  - Конверсия между шагами вычисляется без ручного исправления данных.

### 7) Минимальная anti-abuse защита (rate limit, reports, soft block)

- **Definition of Done (DoD):**
  - Включён rate limiting для критичных публичных endpoint/действий.
  - Реализован пользовательский flow жалобы (reports).
  - Soft block применим через админку и учитывается backend-логикой доступа.
- **Acceptance Criteria:**
  - При превышении лимита запросов пользователь получает предсказуемый отказ (429/эквивалент).
  - Игрок может отправить жалобу из продукта, и она доступна администратору.
  - Soft blocked пользователь не может выполнять ограниченные действия до снятия блокировки.

## 3) Реализация по этапам

1. **Kickoff + Scope freeze (День 1–2)**
   - Цели, KPI, роли, DoR/DoD, формат трекинга, реестр рисков.
2. **Solution Design (День 2–4)**
   - Архитектура, state machine, ERD, API/WS контракты, score policy.
3. **UX/UI blueprint (День 3–5, параллельно)**
   - Wireflow 10–11 экранов, UI-kit light, состояния, copy.
4. **Repo + Infra skeleton (Неделя 1)**
   - Monorepo, TS strict, линтеры, Docker Compose, CI/CD, env policy.
5. **Auth + App shell (Неделя 1–2)**
   - Telegram initData проверка, upsert user, token, welcome flow.
6. **Rooms + Lobby + Invite (Неделя 2)**
   - CRUD комнаты, idempotent join, lobby events, host-only start.
7. **Packs + Content pipeline (Неделя 2–3)**
   - Импорт CSV/JSON, валидация, dedupe, 300–500 вопросов.
8. **Game engine core (Неделя 3)**
   - Start session, 10 вопросов, answer idempotency, timers, scoring.
9. **Result card + Rematch + Share (Неделя 4)**
   - Генерация PNG, asset endpoint, share CTA, UTM attribution.
10. **Admin panel MVP (Неделя 4–5)**
   - Dashboard, packs/questions CRUD, reports queue, user block.
11. **Analytics implementation (Неделя 5)**
   - Event schema, ingestion, funnel/cohort SQL.
12. **Moderation + anti-abuse (Неделя 5)**
   - Reports E2E, Redis limits, стоп-слова, suspicious logging.
13. **QA hardening + Beta readiness (Неделя 6)**
   - Unit/integration/E2E, Sentry/alerts, rollback plan, legal docs.

## 4) Критический путь

1. Scope freeze.
2. Архитектура + state machine + ERD.
3. Infra bootstrap + CI/CD.
4. Telegram auth.
5. Rooms/Lobby.
6. Game engine core.
7. Result/rematch/share.
8. Analytics + reports.
9. QA hardening.
10. Beta launch.

## 5) Разбивка по спринтам (6 недель)

- **Sprint 1:** Foundation + Auth + App shell.
- **Sprint 2:** Rooms + Lobby + Packs list.
- **Sprint 3:** Game engine end-to-end.
- **Sprint 4:** Result card + Rematch + Share + Content pipeline.
- **Sprint 5:** Admin + Analytics + Moderation.
- **Sprint 6:** QA hardening + Beta launch + bugfix wave.

## 6) Распределение задач

### Dev A (backend/infra)

- Auth, rooms/sessions, realtime gateway, scoring engine.
- DB/Redis, analytics backend, anti-abuse.
- CI/CD, окружения, reliability.

### Dev B (frontend/product UX)

- Telegram WebApp shell.
- Lobby/game/results flows + realtime клиент.
- Reports flow, result card preview/share.
- Admin frontend.

### Part-time роли

- Контент: 300–500 вопросов + ведущий copy.
- Дизайн: wireframes, UI-kit, шаблон result card.
- QA: чеклисты, exploratory/regression.

## 7) Go/No-Go контрольные точки

- **End Sprint 2:** create/join/lobby стабильны.
- **End Sprint 3:** 10 вопросов консистентно для 3+ игроков.
- **End Sprint 4:** rematch и share result card готовы.
- **End Sprint 5:** funnel-метрики + админка + reports.
- **End Sprint 6:** техническая и операционная готовность закрытой беты.

## 8) План на ближайшие 48 часов

### 8.1 Обязательные артефакты

1. Зафиксировать **P0 scope one-pager**.
2. Подготовить **Solution Design v1**:
   - architecture diagram,
   - state machine,
   - ERD,
   - API/WS contracts.
3. Развернуть backlog в Jira/Linear:
   - epics,
   - зависимости,
   - приоритеты,
   - владельцы.
4. Сформировать Sprint 1 board и начать реализацию.

### 8.2 Практический чек-лист (owner + deadline)

- `[PM]` Scope one-pager утверждён — **до конца Дня 1**.
- `[Dev A]` ERD + migrations gaps review — **до середины Дня 2**.
- `[Dev A]` API/WS draft в Swagger/Markdown — **до конца Дня 2**.
- `[Dev B]` Wireflow + UI states (loading/empty/error/disconnected/expired) — **до конца Дня 2**.
- `[PM + Team]` Sprint 1 commitment (DoR/DoD и оценка) — **до конца Дня 2**.


### 8.3 Story 1.2 — Solution Design v1 (owner/estimate/dependencies)

- `[Dev A]` Architecture diagram (WebApp/API/DB/Redis/WS/Bot) — **0.5d**, dependency: **1.1.1**.
- `[Dev A]` Game state machine (lobby -> question -> result -> rematch) — **0.5d**, dependency: **1.1.1**.
- `[Dev A]` ERD + migration gaps review — **0.5d**, dependency: **1.1.1**.
- `[Dev A]` API/WS contracts draft (Swagger/Markdown) — **0.5d**, dependencies: **1.2.2, 1.2.3**.
- `[Dev B]` Wireflow + UI states (loading/empty/error/disconnected/expired) — **1d**, dependency: **1.1.1**.

Артефакт: `docs/solution-design-v1.md`.

## 9) KPI для первых 30 дней после запуска

- Room creation conversion (app_opened -> room_created).
- Invite conversion (invite_link_generated -> player_joined_room).
- Game start rate (room_created -> game_started).
- Game completion rate (game_started -> game_finished).
- Rematch rate (game_finished -> rematch_clicked).
- Share rate (game_finished -> share_result_clicked).
- D1/D7 retention (организатор/игрок отдельно).
