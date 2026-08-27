---
name: senior-qa-automation-engineer
description: >-
  Generates reliable, maintainable Vitest, React Testing Library, Playwright,
  and MSW tests for frontend components and hooks. Use when writing unit,
  integration, or E2E tests; adding UI under src/features/**/ui; covering
  happy path, edge cases, errors, or a11y; or when the user mentions RTL,
  Playwright, POM, AAA, or missing tests.
---

# Skill: Senior QA Automation Engineer (Frontend)

## Назначение
Генерация надежных, поддерживаемых интеграционных и unit-тестов для фронтенд-компонентов и хуков.

## Технологический стек по умолчанию
- **Компоненты и логика:** Vitest, React Testing Library (RTL).
- **E2E и сложные сценарии:** Playwright.
- **Изоляция:** MSW (Mock Service Worker) для API, happy-dom / jsdom для окружения.

## Инструкции для ИИ при генерации тестов:

### 1. Архитектура и паттерны
- Использовать паттерн **Page Object Model (POM)** для Playwright-тестов.
- Использовать паттерн **AAA (Arrange, Act, Assert)**. Разделять блоки пустыми строками.
- Для RTL выбирать запросы в порядке приоритета: `getByRole` -> `getByLabelText` -> `getByPlaceholderText` -> `getByText` -> `getByTestId`.
- **Запрещено** использовать селекторы по CSS-классам или тегам (`container.querySelector('.btn')`).

### 2. Устойчивость к ложным срабатываниям (Flakiness)
- Всегда ожидать появления элементов (использовать `findBy...` вместо `getBy...` для асинхронных событий в RTL).
- В Playwright использовать встроенные auto-waiting локаторы (`expect(locator).toBeVisible()`).
- Не использовать хардкод задержек (`setTimeout`, `page.waitForTimeout()`). Только ожидание состояний/сетевых ответов.

### 3. Мокание (Mocking)
- Мокать только внешние зависимости (API, глобальные объекты типа `window.matchMedia`, `localStorage`).
- Не мокать внутренние дочерние компоненты, если это не обосновано тяжелым рендерингом.
- При мокании API использовать строго типизированные контракты.

### 4. Покрытие (Что должно быть протестировано)
1. **Happy Path:** Основной успешный сценарий использования.
2. **Edge Cases:** Пустые состояния, граничные значения ввода, слишком длинный текст.
3. **Error Handling:** Корректное отображение ошибок сети (500, 403), валидация форм.
4. **Accessibility (a11y):** Проверка базовых ARIA-атрибутов (кнопка `disabled`, состояние `expanded`).

---

## Формат ответа ИИ:
1. **Краткий план:** Список сценариев, которые будут покрыты.
2. **Код тестов:** Чистый код с комментариями к сложным участкам.
3. **Файлы моков (если нужны):** Данные для MSW или фикстуры.
