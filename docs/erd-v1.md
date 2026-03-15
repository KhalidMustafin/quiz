# MVP-005 — ERD v1 (draft)

## Ключевые таблицы
- `users`
- `rooms`
- `room_members`
- `quiz_packs`
- `questions`
- `game_sessions`
- `session_questions`
- `answers`
- `session_scores`
- `reports`
- `analytics_events`

## Основные связи
- `rooms.host_user_id -> users.id`
- `room_members.room_id -> rooms.id`
- `room_members.user_id -> users.id`
- `questions.quiz_pack_id -> quiz_packs.id`
- `game_sessions.room_id -> rooms.id`
- `session_questions.session_id -> game_sessions.id`
- `session_questions.question_id -> questions.id`
- `answers.session_id -> game_sessions.id`
- `answers.question_id -> questions.id`
- `answers.user_id -> users.id`
- `session_scores.session_id -> game_sessions.id`
- `session_scores.user_id -> users.id`

## Кардинальности (MVP)
- Один `quiz_pack` содержит много `questions`.
- Одна `room` содержит много `room_members`.
- Одна `game_session` содержит много `session_questions` и `answers`.
- Один `user` может иметь много `answers` и `session_scores`.

## Индексы/ограничения, критичные для MVP
- Unique: (`room_id`, `nickname`) в `room_members`.
- Unique: (`session_id`, `question_id`, `user_id`) в `answers`.
- Index: `answers(session_id, question_id)` для подсчета результатов.
- Index: `session_scores(session_id, total_score DESC)` для leaderboard.

## Комментарий
Текущая схема покрывает P0 сценарий и не требует выделенного event-store. Гэп-анализ в `docs/migration-gaps.md`.
