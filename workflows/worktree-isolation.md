# Worktree isolation — конструктор инвойса

Изолированная копия репозитория, чтобы агент не писал в основной checkout. Git — через MCP GitLens.

## Шаги

1. `git_worktree` action `list`, directory = корень репозитория.
2. Если worktree для задачи нет:
   - `git_branch` create (GitLens при create переключает основной checkout на новую ветку)
   - сразу `git_checkout` обратно на `main`
   - `git_worktree` add: `path` — соседняя папка, не внутри репозитория; `branch` — новая ветка
     (ветка не может быть одновременно checkout в основном дереве и в worktree)
3. В worktree: `npm ci` (или дождаться `.cursor/worktrees.json` в Agents Window).
4. Агент правит только файлы в `path` worktree.
5. Проверка: в основном каталоге `git_status` без чужих правок задачи; `git_worktree` list показывает обе копии.

## Скиллы

Глобальный (для всех воркфлоу): `.cursor/skills/react-performance-optimization/SKILL.md`.

## Вызов

«Создай изолированный worktree через GitLens MCP и работай только в нём.»
