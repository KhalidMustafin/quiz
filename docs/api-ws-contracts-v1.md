# MVP-006 — API/WS Contracts v1 (draft)

## REST contracts (implemented)

### `POST /rooms`
Creates room in `lobby` state.

Headers:
- `x-user-id` (required)
- `x-user-name` (optional)

Responses:
- `201` `{ room }`
- `401` `UNAUTHORIZED`
- `400` `VALIDATION_ERROR`

### `POST /rooms/:roomId/join`
Join room by id with idempotency by `x-user-id`.

Responses:
- `200` `{ room }`
- `404` `ROOM_NOT_FOUND`
- `409` `DISPLAY_NAME_TAKEN`

### `POST /rooms/join-by-code`
Join room by invite code.

Responses:
- `200` `{ room }`
- `400` `VALIDATION_ERROR`
- `404` `ROOM_NOT_FOUND`
- `409` `DISPLAY_NAME_TAKEN`

### `POST /rooms/:roomId/start`
Start game session by host.

Idempotency semantics:
- First successful call creates session and returns `201` with `replayed=false`.
- Repeated host call for same active room returns existing session with `200` and `replayed=true`.

Responses:
- `201|200` `{ room, session, replayed }`
- `401` `UNAUTHORIZED`
- `403` `FORBIDDEN`
- `404` `ROOM_NOT_FOUND`
- `409` `INSUFFICIENT_PLAYERS|INVALID_STATE`


### `GET /sessions`
List currently known game sessions.

Responses:
- `200` `{ items: GameSession[] }`

### `GET /sessions/:sessionId`
Get session details by id.

Responses:
- `200` `{ session }`
- `404` `SESSION_NOT_FOUND`

## Error envelope
```json
{ "error": "ERROR_CODE", "message": "optional human readable message" }
```

## WS contracts (target for next iteration)
- `session.started`
- `session.question_published`
- `session.answer_received`
- `session.question_closed`
- `session.leaderboard_updated`
- `session.finished`

## Versioning
- Current draft: `v1`.
- Breaking changes must be reflected in this document and coordinated with frontend/admin clients.
