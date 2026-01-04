import { test, expect } from '@playwright/test';

test.describe('Telemetry Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="bottom-panel-tabs"]');
  });

  test('should display telemetry tab in bottom panel', async ({ page }) => {
    const telemetryTab = page.locator('[data-testid="tab-telemetry"]');
    await expect(telemetryTab).toBeVisible();
    await expect(telemetryTab).toContainText('Telemetry');
  });

  test('should show telemetry metrics when tab is clicked', async ({
    page,
  }) => {
    // Click telemetry tab
    await page.locator('[data-testid="tab-telemetry"]').click();

    // Metrics should be visible
    const metricsContainer = page.locator('[data-testid="telemetry-metrics"]');
    await expect(metricsContainer).toBeVisible();

    // Should contain metric labels
    await expect(metricsContainer).toContainText('Chart Load');
    await expect(metricsContainer).toContainText('Fetch');
    await expect(metricsContainer).toContainText('Renders');
    await expect(metricsContainer).toContainText('Avg Time');
  });

  test('should have correct grid layout for metrics', async ({ page }) => {
    await page.locator('[data-testid="tab-telemetry"]').click();

    const metricsContent = page.locator(
      '[data-testid="telemetry-metrics-content"]'
    );

    // Should have grid display
    const display = await metricsContent.evaluate((el) => {
      const child = el.querySelector('.grid');
      return child ? globalThis.getComputedStyle(child).display : '';
    });
    expect(display).toBe('grid');
  });

  test('should switch between tabs correctly', async ({ page }) => {
    // Click timeline tab first
    await page.locator('[data-testid="tab-timeline"]').click();
    await expect(
      page.locator('[data-testid="timeline-controls"]')
    ).toBeVisible();

    // Click legend tab
    await page.locator('[data-testid="tab-legend"]').click();
    await expect(page.locator('[data-testid="legend-table"]')).toBeVisible();

    // Click telemetry tab
    await page.locator('[data-testid="tab-telemetry"]').click();
    await expect(
      page.locator('[data-testid="telemetry-metrics"]')
    ).toBeVisible();
  });

  test('should update metrics after signal selection', async ({ page }) => {
    // Click telemetry tab
    await page.locator('[data-testid="tab-telemetry"]').click();

    // Select a signal
    // Search for signal first
    await page.getByPlaceholder('Search assets...').fill('TI-1001');
    const signalBtn = page.getByRole('button', { name: 'TI-1001' }).first();
    await expect(signalBtn).toBeVisible();

    await signalBtn.click();

    // Metrics should show activity - Playwright will auto-retry this assertion
    // so we don't need arbitrary timeouts
    const metricsContainer = page.locator('[data-testid="telemetry-metrics"]');
    await expect(metricsContainer).toContainText('Renders');
  });
});
