import { test, expect } from '@playwright/test';

test.describe('Chart Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="chart-area"]');
  });

  test('should show empty state when no signals selected', async ({ page }) => {
    const emptyState = page.locator('[data-testid="empty-chart-state"]');
    await expect(emptyState).toBeVisible();

    // Check CSS - should be centered (flexbox)
    const display = await emptyState.evaluate(
      (el) => window.getComputedStyle(el).display
    );
    expect(display).toBe('flex');

    const justifyContent = await emptyState.evaluate(
      (el) => window.getComputedStyle(el).justifyContent
    );
    expect(justifyContent).toBe('center');
  });

  test('should show chart container with correct styling', async ({ page }) => {
    const container = page.locator('[data-testid="chart-container"]');
    await expect(container).toBeVisible();

    // Should have border-radius (rounded-lg)
    const borderRadius = await container.evaluate(
      (el) => window.getComputedStyle(el).borderRadius
    );
    expect(parseFloat(borderRadius)).toBeGreaterThan(0);

    // Should have border
    const borderWidth = await container.evaluate(
      (el) => window.getComputedStyle(el).borderWidth
    );
    expect(parseFloat(borderWidth)).toBeGreaterThan(0);
  });

  test('should show chart iframe when signal is selected', async ({ page }) => {
    // Select a signal
    await page.locator('[data-testid="signal-button-signal_01"]').click();

    // Empty state should be hidden
    const emptyState = page.locator('[data-testid="empty-chart-state"]');
    await expect(emptyState).not.toBeVisible();

    // Chart iframe should be visible (may take time to load)
    const iframe = page.locator('[data-testid="chart-iframe"]');
    await expect(iframe).toBeVisible({ timeout: 30000 });

    // Iframe should have correct src
    const src = await iframe.getAttribute('src');
    expect(src).toContain('signal_id=signal_01');
  });

  test('should update chart URL when multiple signals selected', async ({
    page,
  }) => {
    // Select first signal
    await page.locator('[data-testid="signal-button-signal_01"]').click();
    await page.locator('[data-testid="signal-button-signal_02"]').click();

    const iframe = page.locator('[data-testid="chart-iframe"]');
    await expect(iframe).toBeVisible({ timeout: 30000 });

    // URL should contain both signals
    const src = await iframe.getAttribute('src');
    expect(src).toContain('signal_01');
    expect(src).toContain('signal_02');
  });
});
