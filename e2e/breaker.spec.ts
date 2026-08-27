import { expect, test } from '@playwright/test';

import { ConstructorPage, STORAGE_KEY } from './pages/constructor.page';

test.describe('Agent breaker — отказы', () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  });

  test('F4: нечисловая сумма', async ({ page }) => {
    const constructor = new ConstructorPage(page);

    await constructor.goto();
    await constructor.fillAmount('abc');
    await constructor.submitInvoice();
    await constructor.expectValidationAlert('числом');
  });

  test('F7: XSS в описании не выполняется', async ({ page }) => {
    const constructor = new ConstructorPage(page);
    let dialogFired = false;
    page.on('dialog', () => {
      dialogFired = true;
    });

    await constructor.goto();
    await constructor.fillAmount('10');
    await page.getByLabel('Описание').fill('<script>alert("xss")</script>');
    await constructor.submitInvoice();
    await constructor.expectPendingCard();

    const cardText = await page.locator('[data-status="pending"]').first().textContent();
    expect(cardText).toContain('<script>');
    expect(dialogFired).toBe(false);
  });

  test('F8: пустое описание — инвойс создаётся', async ({ page }) => {
    const constructor = new ConstructorPage(page);

    await constructor.goto();
    await constructor.fillAmount('5');
    await constructor.submitInvoice();
    await constructor.expectPendingCard();
  });

  test('P1: несуществующий pay id', async ({ page }) => {
    await page.goto('/?pay=missing-id-404', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'Счёт не найден' })).toBeVisible();
  });

  test('P2: повторная оплата paid', async ({ page }) => {
    const constructor = new ConstructorPage(page);
    const now = Date.now();

    await constructor.goto();
    await constructor.seedInvoice({
      id: 'paid-breaker',
      amount: '50',
      currency: 'USDT',
      description: 'already paid',
      createdAt: now,
      expiresAt: now + 3_600_000,
      status: 'paid',
      paidAt: now,
      requestKey: 'paid-breaker-key',
    });
    await page.goto('/?pay=paid-breaker', { waitUntil: 'networkidle' });

    await expect(page.getByText('Счёт уже оплачен')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Оплатить (демо)' })).toHaveCount(0);
  });

  test('P6: битый JSON в localStorage', async ({ page }) => {
    const constructor = new ConstructorPage(page);

    await constructor.goto();
    await page.evaluate((key) => {
      localStorage.setItem(key, '{not-json');
    }, STORAGE_KEY);
    await page.reload({ waitUntil: 'networkidle' });

    await expect(constructor.emptyState).toBeVisible();
  });

  test('L1: фильтр на пустом списке', async ({ page }) => {
    const constructor = new ConstructorPage(page);

    await constructor.goto();
    await constructor.filterTab('ожидают').click();
    await expect(constructor.emptyState).toBeVisible();
  });
});
