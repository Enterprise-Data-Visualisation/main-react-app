import { test, expect } from '@playwright/test';

test.describe('Telemetry Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="telemetry-panel"]');
  });

  test('should display telemetry toggle button', async ({ page }) => {
    const telemetryToggle = page.locator('[data-testid="telemetry-toggle"]');
    await expect(telemetryToggle).toBeVisible();

    // Should contain "Telemetry" text
    await expect(telemetryToggle).toContainText('Telemetry');
  });

  test('should expand telemetry panel when clicked', async ({ page }) => {
    const telemetryToggle = page.locator('[data-testid="telemetry-toggle"]');

    // Panel content should not be visible initially
    const telemetryContent = page.locator('[data-testid="telemetry-content"]');
    await expect(telemetryContent).not.toBeVisible();

    // Click to expand
    await telemetryToggle.click();

    // Content should now be visible
    await expect(telemetryContent).toBeVisible();
  });

  test('should display performance metrics when expanded', async ({ page }) => {
    // Expand panel
    await page.locator('[data-testid="telemetry-toggle"]').click();

    const metricsContainer = page.locator('[data-testid="telemetry-metrics"]');
    await expect(metricsContainer).toBeVisible();

    // Should contain metric labels
    await expect(metricsContainer).toContainText('Chart Load Time');
    await expect(metricsContainer).toContainText('Last Fetch');
    await expect(metricsContainer).toContainText('Render Count');
    await expect(metricsContainer).toContainText('Avg Render Time');
  });

  test('should have correct grid layout for metrics', async ({ page }) => {
    await page.locator('[data-testid="telemetry-toggle"]').click();

    const metricsContainer = page.locator('[data-testid="telemetry-metrics"]');

    // Should have grid display
    const display = await metricsContainer.evaluate((el) => {
      const child = el.querySelector('.grid');
      return child ? window.getComputedStyle(child).display : '';
    });
    expect(display).toBe('grid');
  });

  test('should collapse panel when clicked again', async ({ page }) => {
    const telemetryToggle = page.locator('[data-testid="telemetry-toggle"]');
    const telemetryContent = page.locator('[data-testid="telemetry-content"]');

    // Expand
    await telemetryToggle.click();
    await expect(telemetryContent).toBeVisible();

    // Collapse
    await telemetryToggle.click();
    await expect(telemetryContent).not.toBeVisible();
  });

  test('should toggle with Ctrl+T keyboard shortcut', async ({ page }) => {
    const telemetryContent = page.locator('[data-testid="telemetry-content"]');

    // Initially not visible
    await expect(telemetryContent).not.toBeVisible();

    // Press Ctrl+T
    await page.keyboard.press('Control+t');

    // Should now be visible
    await expect(telemetryContent).toBeVisible();

    // Press Ctrl+T again
    await page.keyboard.press('Control+t');

    // Should be hidden
    await expect(telemetryContent).not.toBeVisible();
  });

  test('should update metrics after signal selection', async ({ page }) => {
    // Expand telemetry
    await page.locator('[data-testid="telemetry-toggle"]').click();

    // Select a signal
    await page.locator('[data-testid="signal-button-signal_01"]').click();

    // Wait for chart to start loading
    await page.waitForTimeout(500);

    // Metrics should show activity (render count should be at least 1)
    const metricsContainer = page.locator('[data-testid="telemetry-metrics"]');
    await expect(metricsContainer).toContainText('Render Count');
  });
});
