# MVP Status Board

Легенда статусов: `Not Started` | `In Progress` | `Blocked` | `Review` | `Done`.

| ID      | Название                                      | Stage | Depends on         | Owner | Status      | Notes |
|---------|-----------------------------------------------|-------|--------------------|-------|-------------|-------|
| MVP-001 | P0 scope one-pager                            | S0    | -                  | TBD   | Done        | `docs/p0-scope-onepager.md` |
| MVP-002 | Process definition (DoR/DoD + tracking)       | S0    | MVP-001            | TBD   | Done        | `docs/process-definition.md` |
| MVP-003 | Architecture v1                               | S1    | MVP-001            | TBD   | Done        | draft |
| MVP-004 | Game state machine                            | S1    | MVP-001            | TBD   | Done        | draft |
| MVP-005 | ERD v1 + migration gaps                       | S1    | MVP-001            | TBD   | Done        | drafts |
| MVP-006 | API/WS contracts                              | S1    | MVP-004, MVP-005   | TBD   | In Progress | `docs/api-ws-contracts-v1.md` |
| MVP-007 | Foundation/Auth/App shell                     | S2    | MVP-001            | TBD   | Not Started | |
| MVP-008 | Core backend scaffolding                      | S2    | MVP-003            | TBD   | Not Started | |
| MVP-009 | Frontend game flow base                       | S2    | MVP-003            | TBD   | Not Started | |
| MVP-010 | Admin minimal content ops                     | S2    | MVP-003            | TBD   | Not Started | |
| MVP-011 | Realtime game loop integration                | S3    | MVP-006, MVP-009   | TBD   | Not Started | |
| MVP-012 | Scoreboard + results UX                       | S3    | MVP-011, MVP-007   | TBD   | Not Started | |
| MVP-013 | Content pipeline bootstrap                    | S3    | MVP-005            | TBD   | Not Started | |
| MVP-014 | QA smoke automation                           | S4    | MVP-011, MVP-012   | TBD   | Not Started | |
| MVP-015 | Observability baseline                        | S4    | MVP-008            | TBD   | Not Started | |
