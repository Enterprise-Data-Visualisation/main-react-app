import { test, expect } from '@playwright/test';

test.describe('Timeline Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="header"]');
  });

  test('should display live mode toggle', async ({ page }) => {
    const liveToggle = page.locator('[data-testid="live-toggle"]');
    await expect(liveToggle).toBeVisible();

    // Should show Historical by default
    const liveStatus = page.locator('[data-testid="live-status"]');
    await expect(liveStatus).toHaveText('Historical');
  });

  test('should toggle live mode when switch is clicked', async ({ page }) => {
    const liveToggle = page.locator('[data-testid="live-toggle"]');
    const liveStatus = page.locator('[data-testid="live-status"]');

    // Initially Historical
    await expect(liveStatus).toHaveText('Historical');

    // Click to enable live mode
    await liveToggle.click();

    // Should now show Live Stream
    await expect(liveStatus).toHaveText('Live Stream');

    // Verify color change (should have destructive color class)
    const hasDestructiveClass = await liveStatus.evaluate((el) =>
      el.classList.contains('text-destructive')
    );
    expect(hasDestructiveClass).toBe(true);
  });

  test('should have date range inputs in bottom panel', async ({ page }) => {
    // Expand bottom panel if needed
    const startTimeInput = page.locator('#start-time');
    const endTimeInput = page.locator('#end-time');

    await expect(startTimeInput).toBeVisible();
    await expect(endTimeInput).toBeVisible();

    // Verify they have values
    const startValue = await startTimeInput.inputValue();
    const endValue = await endTimeInput.inputValue();

    expect(startValue).toBeTruthy();
    expect(endValue).toBeTruthy();
  });

  test('should update date range when changed', async ({ page }) => {
    const startTimeInput = page.locator('#start-time');

    // Change the value
    await startTimeInput.fill('2025-06-15T12:00');

    // Verify it changed
    const newValue = await startTimeInput.inputValue();
    expect(newValue).toBe('2025-06-15T12:00');
  });

  test('should disable date inputs when in live mode', async ({ page }) => {
    const liveToggle = page.locator('[data-testid="live-toggle"]');
    const startTimeInput = page.locator('#start-time');

    // Enable live mode
    await liveToggle.click();

    // Date inputs should be disabled
    await expect(startTimeInput).toBeDisabled();
  });
});
