# MVP-004 — Game State Machine (draft)

## Сущности состояний
- **RoomStatus:** `lobby` | `in_game` | `finished`
- **SessionStatus:** `created` | `question_active` | `question_closed` | `results` | `completed`

## Переходы

### Room lifecycle
1. `lobby` -> `in_game` (host start session)
2. `in_game` -> `finished` (после final results)

### Session lifecycle
1. `created` -> `question_active` (question #1 published)
2. `question_active` -> `question_closed` (timer elapsed/manual close)
3. `question_closed` -> `question_active` (next question exists)
4. `question_closed` -> `results` (last question closed)
5. `results` -> `completed` (finalize + persist)

## Инварианты
- В сессии только один активный вопрос одновременно.
- Игрок может отправить не более одного валидного ответа на вопрос.
- Ответ после `question_closed` не меняет score.
- `completed` — терминальное состояние.

## События (черновик)
- `room.player_joined`
- `room.player_left`
- `session.started`
- `session.question_published`
- `session.answer_received`
- `session.question_closed`
- `session.leaderboard_updated`
- `session.finished`

## Ошибочные переходы
- Start session, когда room != `lobby`.
- Publish next question, когда текущий вопрос активен.
- Submit answer для несуществующего/закрытого вопроса.

## Требования к обработке
- Ошибочные переходы должны быть идемпотентно отклонены с предсказуемым кодом.
- При reconnect клиент должен получить snapshot текущего состояния.
