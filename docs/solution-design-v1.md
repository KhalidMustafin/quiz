# Solution Design v1 (Story 1.2)

## 1) Architecture diagram (WebApp/API/DB/Redis/WS/Bot)

```mermaid
flowchart LR
    subgraph Telegram
      BOT[Telegram Bot]
      WA[Telegram WebApp]
    end

    subgraph Frontend
      UI[React + TypeScript WebApp]
      WSClient[WS Client]
      APIClient[HTTP API Client]
    end

    subgraph Backend
      APIGW[API Layer\nAuth/Rooms/Game/Admin/Analytics]
      WS[Realtime Gateway\nRoom/Game channels]
      Worker[Background Worker\nResult card/analytics jobs]
    end

    subgraph Data
      PG[(Postgres)]
      R[(Redis)]
      S3[(Object Storage\nresult-card assets)]
    end

    BOT -->|deep link / invite| WA
    WA --> UI
    UI --> APIClient
    UI --> WSClient

    APIClient -->|HTTPS| APIGW
    WSClient -->|WSS| WS

    APIGW --> PG
    APIGW --> R
    WS --> R
    WS --> PG
    Worker --> PG
    Worker --> S3
    APIGW --> S3
```

### Responsibilities split

- **WebApp (Dev B):** lobby/game/result/admin UI, state rendering, WS reconnect UX.
- **API + WS (Dev A):** auth, room lifecycle, game orchestration, server scoring, reports/blocks, analytics events.
- **Data layer:**
  - **Postgres** — source of truth for users/rooms/sessions/answers/reports.
  - **Redis** — transient state, rate limits, WS fan-out support.
  - **Object storage** — generated result cards.

## 2) Game state machine (lobby → question → result → rematch)

```mermaid
stateDiagram-v2
    [*] --> Lobby: room created
    Lobby --> Lobby: player_joined / player_left
    Lobby --> Question: host_start && min_players_reached

    Question --> Question: answer_submitted / timer_tick
    Question --> Question: next_question (qIndex < 10)
    Question --> Result: next_question (qIndex == 10)

    Result --> Lobby: rematch_accepted_by_host
    Result --> [*]: room_closed / timeout_expired
```

### State rules

- `host_start` валиден только для роли `host`.
- В `Question` каждый `answer_submitted` идемпотентен по `(sessionId, userId, questionId)`.
- Переход в `Result` выполняется только после серверной фиксации очков.
- `rematch_accepted_by_host` создаёт новый `game_session_id`, но сохраняет room context.

## 3) ERD + migration gaps review

## 3.1 ERD (MVP-level)

```mermaid
erDiagram
    users ||--o{ room_members : joins
    rooms ||--o{ room_members : has
    rooms ||--o{ game_sessions : starts
    packs ||--o{ questions : contains
    game_sessions ||--o{ session_questions : includes
    game_sessions ||--o{ answers : receives
    users ||--o{ answers : submits
    game_sessions ||--o{ scores : computes
    users ||--o{ scores : owns
    users ||--o{ reports : creates
    users ||--o{ reports : targets

    users {
      uuid id PK
      text telegram_id UK
      text username
      text status "active|soft_blocked"
      timestamptz created_at
    }

    rooms {
      uuid id PK
      uuid host_user_id FK
      text invite_code UK
      text status "lobby|in_game|finished"
      timestamptz created_at
    }

    room_members {
      uuid room_id FK
      uuid user_id FK
      text role "host|player"
      timestamptz joined_at
    }

    packs {
      uuid id PK
      text title
      boolean is_active
      timestamptz created_at
    }

    questions {
      uuid id PK
      uuid pack_id FK
      text body
      jsonb options
      text correct_option
      boolean is_active
    }

    game_sessions {
      uuid id PK
      uuid room_id FK
      uuid pack_id FK
      int question_count
      text status "pending|active|finished"
      timestamptz started_at
      timestamptz ended_at
    }

    session_questions {
      uuid session_id FK
      uuid question_id FK
      int order_index
    }

    answers {
      uuid id PK
      uuid session_id FK
      uuid user_id FK
      uuid question_id FK
      text selected_option
      int latency_ms
      timestamptz answered_at
    }

    scores {
      uuid session_id FK
      uuid user_id FK
      int points
      int rank
    }

    reports {
      uuid id PK
      uuid reporter_user_id FK
      uuid target_user_id FK
      uuid room_id FK
      text reason
      text status "open|resolved|dismissed"
      timestamptz created_at
    }
```

## 3.2 Migration gaps (checklist)

- [ ] `users.telegram_id` unique index.
- [ ] `rooms.invite_code` unique index.
- [ ] Composite unique constraint on `room_members (room_id, user_id)`.
- [ ] Composite unique constraint on `answers (session_id, user_id, question_id)` for idempotency.
- [ ] Composite unique constraint on `scores (session_id, user_id)`.
- [ ] Foreign key cascade policy review (`game_sessions`/`answers`/`scores`).
- [ ] Partial indexes for active entities (`packs.is_active`, `questions.is_active`).
- [ ] Audit fields where needed (`updated_at`, optional `deleted_at`).

## 4) API/WS contracts draft (Markdown)

## 4.1 REST API (draft)

| Method | Endpoint | Purpose | Request (key fields) | Response (key fields) |
|---|---|---|---|---|
| `POST` | `/auth/telegram` | Verify `initData` and create session | `initData` | `accessToken`, `user` |
| `POST` | `/rooms` | Create room | `packId` (optional) | `roomId`, `inviteCode`, `host` |
| `POST` | `/rooms/{roomId}/join` | Join by invite/room id | `inviteCode` (alt) | `room`, `member` |
| `POST` | `/rooms/{roomId}/start` | Start game (host-only) | — | `sessionId`, `status=active` |
| `GET` | `/rooms/{roomId}` | Get lobby snapshot | — | `room`, `members`, `status` |
| `GET` | `/sessions/{sessionId}/result` | Final scoreboard | — | `scores`, `winner`, `resultCardUrl` |
| `POST` | `/sessions/{sessionId}/rematch` | Start rematch in same room | — | `newSessionId` |
| `POST` | `/reports` | Submit abuse report | `targetUserId`, `reason`, `roomId` | `reportId`, `status=open` |
| `POST` | `/admin/users/{userId}/soft-block` | Apply/revoke soft block | `blocked: boolean` | `userId`, `status` |

### Error model

- `400` validation failure.
- `401` invalid or expired auth.
- `403` forbidden action (e.g., non-host start).
- `404` room/session not found.
- `409` conflicting state transition.
- `429` rate limit exceeded.

## 4.2 WebSocket contracts (draft)

### Client → server

- `room.join` `{ roomId }`
- `room.leave` `{ roomId }`
- `game.start` `{ roomId }` (host-only)
- `game.answer.submit` `{ sessionId, questionId, selectedOption, answeredAt }`
- `game.rematch.request` `{ sessionId }`

### Server → client

- `room.state.updated` `{ roomId, status, members, hostUserId }`
- `game.started` `{ sessionId, questionCount, startedAt }`
- `game.question` `{ sessionId, questionId, orderIndex, body, options, ttlMs }`
- `game.answer.ack` `{ sessionId, questionId, accepted, duplicate }`
- `game.score.updated` `{ sessionId, userId, points }`
- `game.finished` `{ sessionId, scores, winnerUserId, resultCardUrl }`
- `system.warning` `{ code, message }`

### WS reliability rules

- Все mutating события подтверждаются `ack`.
- Повторная отправка `game.answer.submit` для того же вопроса возвращает `duplicate=true`.
- При reconnect клиент запрашивает `room.state.updated` и текущий вопрос через snapshot endpoint/API.

## 5) Wireflow + UI states (Dev B)

## 5.1 Core wireflow

1. **Entry / Auth gate**
2. **Home** (create room / join room)
3. **Lobby** (member list, invite CTA, start button for host)
4. **Question screen** (timer, options, lock-on-answer)
5. **Inter-question transition** (short scoreboard)
6. **Final result** (rank + points)
7. **Result card preview**
8. **Rematch confirmation**
9. **Share entry point**
10. **Report modal/flow**
11. **Admin MVP screens** (dashboard, content, reports)

## 5.2 Required UI states per key screen

- **Loading:** skeleton/spinner for initial data and transitions.
- **Empty:** no rooms, no reports, no content items.
- **Error:** recoverable error with retry CTA.
- **Disconnected:** WS dropped, show reconnect state and disable answer submit.
- **Expired:** invite expired / session finished / auth token expired.

## 5.3 Acceptance notes for UI states

- Любой блокирующий state должен иметь понятный CTA (`Retry`, `Back to Lobby`, `Re-auth`).
- Для `Disconnected` нельзя позволять "молчаливую" отправку ответов.
- Для `Expired` показывается причина и следующий валидный шаг пользователя.

## 6) Dependency mapping for Story 1.2 tasks

- **1.2.1 Architecture diagram** ← depends on **1.1.1 scope contract**.
- **1.2.2 Game state machine** ← depends on **1.1.1 scope contract**.
- **1.2.3 ERD + migration gaps review** ← depends on **1.1.1 scope contract**.
- **1.2.4 API/WS contracts draft** ← depends on **1.2.2 + 1.2.3**.
- **1.2.5 Wireflow + UI states** ← depends on **1.1.1 scope contract**.
