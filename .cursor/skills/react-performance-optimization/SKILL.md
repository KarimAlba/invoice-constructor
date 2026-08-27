---
name: react-performance-optimization
description: >-
  Audits and fixes React performance issues: extra renders, missing useMemo/useCallback,
  Context over-subscription, bundle size, and useEffect subscription leaks. Use when
  implementing or reviewing React/UI code, running any project workflow, optimizing FPS,
  or when the user mentions renders, memo, dynamic import, or memory leaks.
---

# Skill: React Performance Optimization

## Назначение
Аудит и исправление проблем с производительностью, лишними рендерами и утечками памяти.

## Инструкции для ИИ
1. Проверь компонент на наличие «тяжелых» вычислений без `useMemo`.
2. Найди функции, передаваемые в дочерние компоненты, и оберни их в `useCallback` (если дочерний компонент оптимизирован через `React.memo`).
3. Проверь, не вызывает ли Context API лишние рендеры. Предложи разделение контекста на State и Dispatch.
4. Оцени размер бандла: предложи `dynamic()` импорты для тяжелых библиотек или редко используемых модалок.
5. Проверь подписки в `useEffect` на наличие cleanup-функций.

## Формат ответа
- **Проблема:** [Описание]
- **Причина:** [Почему падает FPS / растет бандл]
- **Решение:** [Оптимизированный код]
