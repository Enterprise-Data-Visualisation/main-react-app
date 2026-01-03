import { test, expect } from '@playwright/test';

test.describe('Signal Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for signal list to load
    await page.waitForSelector('[data-testid="signal-list"]');
  });

  test('should display signal list with correct items', async ({ page }) => {
    const signalList = page.locator('[data-testid="signal-list"]');
    await expect(signalList).toBeVisible();

    // Should have 5 signals
    const signalButtons = page.locator('[data-testid^="signal-button-"]');
    await expect(signalButtons).toHaveCount(5);

    // First signal should be Temperature Sensor
    const firstSignalName = page.locator(
      '[data-testid="signal-name-signal_01"]'
    );
    await expect(firstSignalName).toHaveText('Temperature Sensor');

    const firstSignalLocation = page.locator(
      '[data-testid="signal-location-signal_01"]'
    );
    await expect(firstSignalLocation).toHaveText('Building A');
  });

  test('should select a signal and update state', async ({ page }) => {
    const signalButton = page.locator(
      '[data-testid="signal-button-signal_01"]'
    );

    // Initially not selected
    await expect(signalButton).toHaveAttribute('data-selected', 'false');

    // Click to select
    await signalButton.click();

    // Should now be selected
    await expect(signalButton).toHaveAttribute('data-selected', 'true');

    // Signal count should update
    const signalCount = page.locator('[data-testid="signal-count"]');
    await expect(signalCount).toHaveText('1 Signals Selected');

    // Check visual style change (background color should change)
    const hasAccentClass = await signalButton.evaluate((el) =>
      el.classList.contains('bg-sidebar-accent')
    );
    expect(hasAccentClass).toBe(true);
  });

  test('should deselect a signal', async ({ page }) => {
    const signalButton = page.locator(
      '[data-testid="signal-button-signal_01"]'
    );

    // Select the signal
    await signalButton.click();
    await expect(signalButton).toHaveAttribute('data-selected', 'true');

    // Deselect the signal
    await signalButton.click();
    await expect(signalButton).toHaveAttribute('data-selected', 'false');

    // Signal count should be 0
    const signalCount = page.locator('[data-testid="signal-count"]');
    await expect(signalCount).toHaveText('0 Signals Selected');
  });

  test('should allow multi-select of signals', async ({ page }) => {
    const signal1 = page.locator('[data-testid="signal-button-signal_01"]');
    const signal2 = page.locator('[data-testid="signal-button-signal_02"]');

    // Select first signal
    await signal1.click();
    await expect(signal1).toHaveAttribute('data-selected', 'true');

    // Select second signal
    await signal2.click();
    await expect(signal2).toHaveAttribute('data-selected', 'true');

    // Both should remain selected
    await expect(signal1).toHaveAttribute('data-selected', 'true');

    // Signal count should be 2
    const signalCount = page.locator('[data-testid="signal-count"]');
    await expect(signalCount).toHaveText('2 Signals Selected');
  });

  test('should show checkbox visual state correctly', async ({ page }) => {
    const checkbox = page.locator('[data-testid="signal-checkbox-signal_01"]');

    // Initially should not have primary background
    let hasPrimaryBg = await checkbox.evaluate((el) =>
      el.classList.contains('bg-sidebar-primary')
    );
    expect(hasPrimaryBg).toBe(false);

    // Select the signal
    await page.locator('[data-testid="signal-button-signal_01"]').click();

    // Should now have primary background
    hasPrimaryBg = await checkbox.evaluate((el) =>
      el.classList.contains('bg-sidebar-primary')
    );
    expect(hasPrimaryBg).toBe(true);
  });
});
