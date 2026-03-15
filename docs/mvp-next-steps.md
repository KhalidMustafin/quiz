# Что дальше: execution plan после `mvp-execution-workflow`

Этот документ — практическое продолжение `docs/mvp-execution-workflow.yaml`: что запускать прямо сейчас, в каком порядке и с какими exit-критериями.

## 1) Немедленные действия (сегодня)

### 1.1 Запустить Stage S0 (Scope Freeze)

1. **MVP-001 — P0 scope one-pager**
   - Артефакт: `docs/p0-scope-onepager.md`
   - Цель: зафиксировать неизменяемый P0-контракт и DoD по каждому P0-пункту.

2. **MVP-002 — DoR/DoD и формат трекинга**
   - Артефакт: `docs/process-definition.md`
   - Старт только после закрытия MVP-001.
   - Цель: единый ритм статусов, демо и определение готовности задач.

## 2) План на 48 часов

### День 1
- Закрыть MVP-001.
- Создать issue/тикет на каждый P0 capability из one-pager.
- Зафиксировать `out-of-scope` для P1/P2 в трекере.

### День 2
- Закрыть MVP-002.
- Начать Stage S1:
  - MVP-003 (architecture-v1),
  - MVP-004 (game-state-machine),
  - MVP-005 (erd-v1 + migration-gaps).
- После MVP-004 + MVP-005 подготовить MVP-006 (API/WS contracts).

## 3) Порядок выполнения по зависимостям (critical старт)

```text
MVP-001 -> MVP-002
MVP-001 -> MVP-003, MVP-004, MVP-005, MVP-007
MVP-004 + MVP-005 -> MVP-006
MVP-003 -> MVP-008
MVP-006 + MVP-009 -> MVP-011
MVP-011 + MVP-007 -> MVP-012
```

## 4) Ready-to-start backlog (если стартуем с нуля)

- **Сразу готова к старту:** MVP-001.
- **После MVP-001:** MVP-002, MVP-003, MVP-004, MVP-005, MVP-007.
- **После MVP-004+MVP-005:** MVP-006.

## 5) Definition of progress (операционный минимум)

Считать первые 2 дня успешными, если:

- Созданы и приняты артефакты:
  - `docs/p0-scope-onepager.md`,
  - `docs/process-definition.md`,
  - черновики `docs/architecture-v1.md`, `docs/game-state-machine.md`, `docs/erd-v1.md`, `docs/migration-gaps.md`.
- Все зависимости Stage S2 (Foundation/Auth/App shell) прозрачны и подтверждены командой.
- Есть согласованный Sprint 1 commitment (scope + owners + сроки).

## 6) Рекомендуемый weekly cadence

- **Daily 15m:** blockers + dependency health.
- **Twice-weekly design/API sync (30m):** контракты и state-machine.
- **Weekly demo:** по checkpoint-целям из workflow.
- **Risk review (weekly):** контент, realtime, QA-ёмкость.

## 7) Главные риски на старте и превентивные меры

1. **Риск:** задержка content pipeline (MVP-016/017) блокирует MVP-018.
   - **Мера:** запустить шаблон импорта и пилотные 30–50 вопросов заранее.
2. **Риск:** неустойчивые realtime-контракты.
   - **Мера:** зафиксировать API/WS idempotency rules в MVP-006 до Sprint 2.
3. **Риск:** позднее подключение QA.
   - **Мера:** smoke-критерии критического пути определить в Sprint 1.

---

Если нужен, следующим шагом можно добавить в репозиторий `docs/status-board.md` с шаблоном статусов по задачам `MVP-001..MVP-030` (Not Started / In Progress / Blocked / Done).
