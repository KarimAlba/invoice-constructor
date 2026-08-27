import { expect, test } from '@playwright/test';

import { ConstructorPage, PayViewPage, STORAGE_KEY } from './pages/constructor.page';

test.describe('UI check — конструктор инвойса', () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  });

  test('пустой список и отказы валидации', async ({ page }) => {
    const constructor = new ConstructorPage(page);

    // Arrange
    await constructor.goto();

    // Assert — empty
    await expect(constructor.emptyState).toBeVisible();
    await expect(constructor.submitButton).toBeDisabled();

    // Act / Assert — zero amount
    await constructor.fillAmount('0');
    await constructor.submitInvoice();
    await constructor.expectValidationAlert('больше нуля');

    // Act / Assert — negative amount
    await constructor.fillAmount('-5');
    await constructor.submitInvoice();
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('pending, QR, happy path оплаты через PayView', async ({ page }) => {
    const constructor = new ConstructorPage(page);
    const payView = new PayViewPage(page);

    // Arrange
    await constructor.goto();
    await constructor.fillAmount('42.5');

    // Act — create invoice
    await constructor.submitInvoice();
    await constructor.expectPendingCard();
    await expect(constructor.qrCodes()).toHaveCount(1);

    // Act — copy link and open pay screen
    const paymentUrl = await constructor.copyPaymentLink();
    expect(paymentUrl).toContain('pay=');
    await payView.open(paymentUrl);

    // Assert — pending pay view
    await expect(page.getByText('Осталось времени на оплату')).toBeVisible();
    await expect(constructor.qrCodes()).toHaveCount(1);

    // Act — pay
    await payView.payDemoButton().click();

    // Assert — paid
    await expect(page.getByText('Счёт уже оплачен')).toBeVisible();
    await expect(constructor.qrCodes()).toHaveCount(0);
  });

  test('PayView expired без кнопки оплаты', async ({ page }) => {
    const constructor = new ConstructorPage(page);

    // Arrange — seed expired invoice
    await constructor.goto();
    await constructor.seedInvoice({
      id: 'exp-e2e',
      amount: '9',
      currency: 'USDT',
      description: 'expired e2e',
      createdAt: Date.now() - 120_000,
      expiresAt: Date.now() - 1000,
      status: 'pending',
      paidAt: null,
      requestKey: 'exp-e2e-key',
    });

    // Act
    await page.goto('/?pay=exp-e2e', { waitUntil: 'networkidle' });

    // Assert
    await expect(page.getByText('Срок оплаты истёк')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Оплатить (демо)' })).toHaveCount(0);
  });

  test('дабл-клик по сабмиту создаёт один инвойс', async ({ page }) => {
    const constructor = new ConstructorPage(page);

    // Arrange
    await constructor.goto();
    await constructor.fillAmount('100');

    // Act — double click submit
    await constructor.submitButton.dblclick();
    await constructor.expectPendingCard();

    // Assert — single invoice in storage
    const stored = await page.evaluate((key) => {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as unknown[]).length : 0;
    }, STORAGE_KEY);
    expect(stored).toBe(1);
  });

  test('фильтр статусов списка', async ({ page }) => {
    const constructor = new ConstructorPage(page);
    const now = Date.now();

    // Arrange — mixed statuses
    await constructor.goto();
    await page.evaluate(
      ({ key, items }) => {
        localStorage.setItem(key, JSON.stringify(items));
      },
      {
        key: STORAGE_KEY,
        items: [
          {
            id: 'p1',
            amount: '1',
            currency: 'USDT',
            description: 'pending',
            createdAt: now,
            expiresAt: now + 3_600_000,
            status: 'pending',
            paidAt: null,
            requestKey: 'p1-key',
          },
          {
            id: 'paid1',
            amount: '2',
            currency: 'USDT',
            description: 'paid',
            createdAt: now,
            expiresAt: now + 3_600_000,
            status: 'paid',
            paidAt: now,
            requestKey: 'paid1-key',
          },
          {
            id: 'exp1',
            amount: '3',
            currency: 'USDT',
            description: 'expired',
            createdAt: now - 120_000,
            expiresAt: now - 1000,
            status: 'expired',
            paidAt: null,
            requestKey: 'exp1-key',
          },
        ],
      },
    );
    await page.reload({ waitUntil: 'networkidle' });

    // Assert — all visible
    await expect(page.locator('[data-status]')).toHaveCount(3);

    // Act / Assert — filters
    await constructor.filterTab('ожидают').click();
    await expect(page.locator('[data-status="pending"]')).toHaveCount(1);

    await constructor.filterTab('оплачены').click();
    await expect(page.locator('[data-status="paid"]')).toHaveCount(1);

    await constructor.filterTab('истекли').click();
    await expect(page.locator('[data-status="expired"]')).toHaveCount(1);
  });
});
