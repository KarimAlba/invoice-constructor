# Отчёт ДЗ №2

Дата: 2026-08-27

## 1. Результат

Конструктор инвойса: Vite + React + TypeScript. Запуск в README.

## 2. Агенты

### Прогон 1 (discovery, 13:21)

Две независимые задачи (поток создания инвойса и экран `?pay=`) прогнаны дважды.

| Режим           | Wall-clock                                 | Как                                |
| --------------- | ------------------------------------------ | ---------------------------------- |
| Параллельно     | ~37 с (старт 13:21, оба готовы к 13:21:58) | два explore-субагента в одном ходе |
| Последовательно | ~1 мин 40 с (13:28 → 13:29:43)             | тот же объём: A, затем B           |

Параллельный запуск выиграл примерно в **2.5 раза**: wall-time ≈ `max(tA, tB)`, а не `tA + tB`. Качество ответа сопоставимо (те же файлы и функции). Выигрыш есть на независимых чтениях кода; на одной линейной правке параллелить незачем.

### Прогон 2 (фичи PayView + QR, 16:22)

Две независимые реализации в **main**, параллельно:

| Агент | Задача                                                            | Файлы                                                                  | Тесты                  |
| ----- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------- |
| A     | Полноценный экран оплаты: таймер, pending/paid/expired, сообщения | `PayView.tsx`, `PayView.test.tsx`, CSS pay\*                           | 5/5 PayView            |
| B     | QR платёжной ссылки: `PaymentQr`, карточка + PayView              | `entities/invoice/ui/PaymentQr.tsx`, `InvoiceCard.tsx`, `qrcode.react` | PaymentQr + интеграция |

Wall-clock параллельного прогона ~2–3 мин (оба субагента завершились до интеграции и lint-fix). После слияния: `npm test` 19/19, UI-check 13/13 — [`reports/ui-check.md`](reports/ui-check.md).

UI-check делал отдельный агент (не автор кода), по `workflows/ui-check.md`.

## 3. Workflow

Файл: `workflows/ui-check.md`. Прогон: `reports/ui-check.md`.

14/14 сценариев ok: пустой список, валидация (0 / отрицательная / пустая сумма), дабл-клик, pending / paid / expired, фильтр списка, happy path (создать → ссылка → `?pay=` → оплата). Браузерных MCP не было — проверка через Playwright Chromium (headless), без добавления Playwright в `package.json`.

## 4. Worktrees и Git MCP

GitLens MCP (локальный git) подключён к этому репозиторию: `git_status`, `git_worktree`, `git_branch`.

Изоляция: ветка `hw2-isolation`, копия `D:/Programming/invoice-constructor-wt-isolation`. Основной checkout снова на `main`. Конфиг: `.cursor/worktrees.json` (`npm ci`). Сценарий: `workflows/worktree-isolation.md`.

GitKraken-аккаунт для PR/issues в MCP не логинился — для worktree не нужен.

## 5. Журнал сессий

Ретроспектива чатов 2026-08-27: [`reports/sessions.md`](reports/sessions.md). Дальше дописывать по шаблону в шапке файла.

## 6. Что не закрыто

План усиления: [`reports/hardening-plan.md`](reports/hardening-plan.md).

P0–P2 закрыты: журнал, хуки, `entities/invoice`, Vitest/RTL (`npm test`), таймер списка без ререндера формы.

**Добавлено 2026-08-27 (сессия 14):** полноценный `PayView` (таймер, paid/expired) и QR платёжной ссылки (`PaymentQr`, `qrcode.react`).

Дальше — P3 по желанию: Playwright в репозитории, агент-ломатель, инъекции; «Выставить снова» для expired.
