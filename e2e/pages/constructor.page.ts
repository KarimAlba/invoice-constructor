import { expect, type Locator, type Page } from '@playwright/test';

export const STORAGE_KEY = 'invoice-constructor.v1';

export class ConstructorPage {
  readonly amountInput: Locator;
  readonly submitButton: Locator;
  readonly emptyState: Locator;

  constructor(readonly page: Page) {
    this.amountInput = page.getByPlaceholder('0.00');
    this.submitButton = page.getByRole('button', { name: 'Выставить счёт' });
    this.emptyState = page.getByText('Пока пусто');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async fillAmount(value: string) {
    await this.amountInput.fill(value);
  }

  async submitInvoice() {
    await this.submitButton.click();
  }

  async expectValidationAlert(text: string | RegExp) {
    await expect(this.page.getByRole('alert').filter({ hasText: text })).toBeVisible();
  }

  async expectPendingCard() {
    await expect(this.page.locator('[data-status="pending"]').first()).toBeVisible();
  }

  async copyPaymentLink() {
    await this.page.getByRole('button', { name: 'Копировать ссылку' }).first().click();
    return this.page.evaluate(async () => navigator.clipboard.readText());
  }

  filterTab(name: string) {
    return this.page.getByRole('tab', { name });
  }

  markPaidButton() {
    return this.page.getByRole('button', { name: 'Отметить оплаченным' });
  }

  async seedInvoice(item: Record<string, unknown>) {
    await this.page.evaluate(
      ({ key, invoice }) => {
        localStorage.setItem(key, JSON.stringify([invoice]));
      },
      { key: STORAGE_KEY, invoice: item },
    );
  }

  qrCodes() {
    return this.page.locator('[aria-label^="QR-код"]');
  }
}

export class PayViewPage {
  constructor(readonly page: Page) {}

  async open(url: string) {
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  payDemoButton() {
    return this.page.getByRole('button', { name: 'Оплатить (демо)' });
  }
}
