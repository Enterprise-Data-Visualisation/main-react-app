import { test, expect } from '@playwright/test';

test.describe('Chart Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage to ensure fresh state for every test
    await page.evaluate(() => globalThis.localStorage.clear());
    await page.reload();
    await page.waitForSelector('[data-testid="chart-area"]');
  });

  test('should show empty state when no signals selected', async ({ page }) => {
    const emptyState = page.locator('[data-testid="empty-chart-state"]');
    await expect(emptyState).toBeVisible();

    // Check CSS - should be centered (flexbox)
    const display = await emptyState.evaluate(
      (el) => globalThis.getComputedStyle(el).display
    );
    expect(display).toBe('flex');

    const justifyContent = await emptyState.evaluate(
      (el) => globalThis.getComputedStyle(el).justifyContent
    );
    expect(justifyContent).toBe('center');
  });

  test('should show chart container with correct styling', async ({ page }) => {
    const container = page.locator('[data-testid="chart-container"]');
    await expect(container).toBeVisible();

    // Should be full width/height (edge-to-edge)
    // We removed borders to maximize space
    const borderWidth = await container.evaluate(
      (el) => globalThis.getComputedStyle(el).borderWidth
    );
    // Expect no border or 0px
    const width = Number.parseFloat(borderWidth);
    expect(width).toBe(0);
  });

  test('should show chart iframe when signal is selected', async ({ page }) => {
    // Select a signal
    console.log('Searching for TI-1001...');
    await page.getByPlaceholder('Search assets...').fill('TI-1001');
    // Name is "TI-1001 Inlet Temp"
    const signalBtn = page
      .getByRole('button', { name: 'TI-1001', exact: false })
      .first();
    await expect(signalBtn).toBeVisible({ timeout: 10000 });

    console.log('Clicking signal button...');
    await signalBtn.click();

    // Empty state should be hidden (wait for it to disappear)
    console.log('Waiting for empty state to hide...');
    const emptyState = page.locator('[data-testid="empty-chart-state"]');
    await expect(emptyState).toBeHidden({ timeout: 15000 });

    // Chart iframe should be visible (may take time to load)
    console.log('Waiting for iframe to attach...');
    const iframe = page.locator('[data-testid="chart-iframe"]');
    await expect(iframe).toBeAttached({ timeout: 10000 });
    console.log('Waiting for iframe to be visible...');
    await expect(iframe).toBeVisible({ timeout: 45000 });

    // Iframe should have correct src (ID is sig-1)
    console.log('Checking iframe source...');
    await expect(iframe).toHaveAttribute('src', /signal_id=sig-1/, {
      timeout: 15000,
    });
  });

  test('should update chart URL when multiple signals selected', async ({
    page,
  }) => {
    // Select first signal
    // Search for TI-1001
    await page.getByPlaceholder('Search assets...').fill('TI-1001');
    await expect(
      page.getByRole('button', { name: 'TI-1001' }).first()
    ).toBeVisible();
    await page
      .getByRole('button', { name: 'TI-1001', exact: false })
      .first()
      .click();

    // Clear search to find second signal (PI-2001)
    await page.getByPlaceholder('Search assets...').fill('PI-2001');
    await expect(
      page.getByRole('button', { name: 'PI-2001' }).first()
    ).toBeVisible();
    await page
      .getByRole('button', { name: 'PI-2001', exact: false })
      .first()
      .click();

    const iframe = page.locator('[data-testid="chart-iframe"]');
    await expect(iframe).toBeVisible({ timeout: 30000 });

    // URL should contain both signals (sig-1 and sig-3)
    const src = await iframe.getAttribute('src');
    expect(src).toContain('sig-1');
    expect(src).toContain('sig-3');
  });
});
