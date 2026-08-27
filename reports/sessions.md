# Журнал сессий

Дата: 2026-08-27. Часовой пояс UTC+3. Составлен ретроспективно по чатам Cursor.

Шаблон новой записи:

- **Когда:** дата и время
- **Цель:** зачем открыли сессию
- **Сделано:** факты, пути файлов
- **Решение:** что выбрали и почему
- **Дальше:** один следующий шаг

---

## 1. Разработка и quality gates

- **Когда:** 11:32
- **Чат:** [Анализ и линтеры](a5fc4303-a162-4f5e-9b17-e49812c09a0d)
- **Цель:** разобрать репозиторий, настроить линтер и pre-commit по `spirit-reactus`, продолжить разработку; коммит и пуш без отдельного согласования.
- **Сделано:** ESLint 9, Stylelint, Prettier, Steiger, Husky, lint-staged, commitlint; адаптация под npm и TypeScript 6 (без `eslint-plugin-typescript-sort-keys`). Коммит `27da7e7` (`chore: establish project quality gates`), поверх UI из `9cff7bf`.
- **Решение:** не копировать слепо pnpm-хуки и кастомные eslint-rules эталона; FSD-слайс страницы оставить самодостаточным.
- **Дальше:** прогон UI-check отдельным агентом, замер параллельных агентов.

## 2. Workflow, агенты, Git MCP

- **Когда:** 13:13–13:43
- **Чат:** [Шаги ДЗ и worktrees](316af4b1-04c0-4837-a3e3-70887e701867)
- **Цель:** закрыть пункты ДЗ про workflow и агентов; подключить Git MCP и worktree.
- **Сделано:**
  - UI-check отдельным агентом [UI-check](2722d242-7126-41c3-a584-57aa2a2e3b68) → `reports/ui-check.md` (14/14).
  - Две независимые задачи (создание инвойса и `?pay=`) параллельно (~37 с) и последовательно (~1 мин 40 с).
  - GitLens MCP: `hw2-isolation`, копия `D:/Programming/invoice-constructor-wt-isolation`, `.cursor/worktrees.json`, `workflows/worktree-isolation.md`, правило `.cursor/rules/git-mcp-worktrees.mdc`.
  - Обновлён `REPORT.md`.
- **Решение:** браузерных MCP нет — проверка через одноразовый Playwright, в `package.json` не добавляли. После `git_branch` create сразу `checkout` на `main`, иначе worktree не создаётся.
- **Дальше:** скиллы, хуки; не забыть коммитить артефакты ДЗ.

## 3. Скилл производительности (черновик)

- **Когда:** 13:51
- **Чат:** [Скилл performance](39247f2d-e3c6-4bb8-a8c9-ae814fbff1dc)
- **Цель:** глобальный скилл React Performance Optimization во все воркфлоу.
- **Сделано:** `.cursor/skills/react-performance-optimization/SKILL.md`; ссылки в `workflows/ui-check.md` и `workflows/worktree-isolation.md`.
- **Решение:** текст скилла без перефразирования; frontmatter для автоподхвата.
- **Дальше:** хуки tsc/stylelint (сессия оборвана).

## 4. QA-скилл и хук тестов

- **Когда:** 13:55
- **Чат:** [QA-скилл и хук](1334a001-2f3d-4448-b802-1c1d3830cd47)
- **Цель:** скилл автотестов и хук «есть ли `.test.tsx` рядом с UI».
- **Сделано:** `.cursor/skills/senior-qa-automation-engineer/SKILL.md`; `.cursor/hooks.json` + `.cursor/hooks/check-ui-tests.cjs` на `postToolUse` (`Write|StrReplace`).
- **Решение:** схема `beforeApplyChanges` в Cursor нет — перенос на `postToolUse`, без блокировки (`exit 0`). Фильтр как в задании: `src/features/**/ui/*.tsx`.
- **Дальше:** слой `features` в приложении нет — хук на текущем UI не срабатывает.

## 5. Хуки tsc и stylelint — не закрыто

- **Когда:** 13:53 и 14:02
- **Чат:** [Скилл performance](39247f2d-e3c6-4bb8-a8c9-ae814fbff1dc)
- **Цель:** глобальные хуки проверки типов и `lint:styles`.
- **Сделано:** не завершено (запросы прерваны).
- **Решение:** нет.
- **Дальше:** пункт P1 в `reports/hardening-plan.md`.

## 6. Always-apply для performance-скилла

- **Когда:** 14:37
- **Чат:** [Глобальный скилл](1af7f6c2-1d61-485a-9c61-f79e7a543a7f)
- **Цель:** скилл обязателен для любого воркфлоу, включая UI-check и хук.
- **Сделано:** `.cursor/rules/react-performance-optimization.mdc`; напоминание в `check-ui-tests.cjs`.
- **Решение:** always-apply rule, чтобы агент читал скилл даже без явного упоминания.
- **Дальше:** аудит журнала и план усиления.

## 7. Разбор пробелов и журнал

- **Когда:** 14:40–14:43
- **Чат:** этот (анализ → журнал и план)
- **Цель:** что осталось; нужен ли журнал; набросать журнал и план усиления.
- **Сделано:** `reports/sessions.md`, `reports/hardening-plan.md`; ссылки в `REPORT.md`.
- **Решение:** журнал вести в репозитории, не только в транскриптах IDE. Worktree создан, но последующие правки шли в основной checkout.
- **Дальше:** коммит артефактов ДЗ; затем P0/P1 из плана усиления.

## 8. P0 и P1: хуки и сдача

- **Когда:** 14:46
- **Чат:** этот (продолжение: «делай»)
- **Цель:** закрыть P0 (коммит/пуш артефактов) и P1 (хуки на реальный UI, tsc/стили, журнал).
- **Сделано:**
  - `check-ui-tests.cjs` смотрит `src/{entities,features,pages,widgets}/**/ui/*.tsx`.
  - `check-types-and-styles.cjs` на `postToolUse`: `ts-check` для `src/**/*.{ts,tsx}`, `lint:styles` для `src/**/*.css`, fail-open.
  - `remind-session-journal.cjs` на `sessionStart`.
  - Обновлены `hooks.json`, журнал и план.
- **Решение:** не блокировать агента (`exit 0`); путь `src/components` из исходного задания не существует — матч по `src/`.
- **Дальше:** P2 — Vitest/RTL и вынос `entities/invoice` в worktree.

## 9. P2: FSD, тесты, ререндеры

- **Когда:** 14:51
- **Чат:** этот (продолжение: «давай p2»)
- **Цель:** закрыть P2 в worktree `hw2-isolation`.
- **Сделано:**
  - `src/entities/invoice` (types, repository, format, status, validate); страница только композиция UI.
  - Vitest + RTL + happy-dom, 14 тестов, скрипт `npm test`.
  - Таймер перенесён в список: форма не тикает каждую секунду; карточки в `memo`, `now` игнорируется для paid/expired; cleanup таймера копирования.
- **Решение:** `fsd/insignificant-slice` выключен только для entities — одностраничное приложение. `useCallback` в `ConstructorPage` убран: React Compiler + `preserve-manual-memoization`.
- **Дальше:** P3 по желанию.

## 10. Скилл excellent-ui

- **Когда:** 15:27
- **Цель:** переписать `.cursor/skills/excellent-ui/SKILL.md` с performance на выдающийся нетривиальный UI.
- **Сделано:** frontmatter `excellent-ui`; направление, композиция, тип, цвет, атмосфера, motion, антипаттерны generic AI, формат ответа.
- **Решение:** скилл производительности оставить в `react-performance-optimization`; этот файл больше не дублирует его.
- **Дальше:** применять скилл при рестайле конструктора инвойса.

## 11. Скилл own-project-manager

- **Когда:** 15:30
- **Цель:** переписать `.cursor/skills/own-project-manager/SKILL.md` с копии excellent-ui на проработку бизнес-сценариев и фич по смежным проектам.
- **Сделано:** frontmatter `own-project-manager`; источники (этот репо + workspace + FSD); фокус JTBD; сценарий → разрыв → посадка в слои; до 3 кандидатов; антипаттерны вишлиста.
- **Решение:** не кодить на discovery; идеи только из разрыва и смежников, с ограничением существующих слайсов.
- **Дальше:** вызвать скилл на бэклоге конструктора инвойса.
