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

  test('should have timeline slider in timeline tab', async ({ page }) => {
    // Click timeline tab
    await page.locator('[data-testid="tab-timeline"]').click();

    // Timeline controls should be visible
    const timelineControls = page.locator('[data-testid="timeline-controls"]');
    await expect(timelineControls).toBeVisible();

    // Slider should be visible
    const slider = page.locator('[data-testid="timeline-slider"]');
    await expect(slider).toBeVisible();
  });

  test('should disable slider when in live mode', async ({ page }) => {
    // Click timeline tab
    await page.locator('[data-testid="tab-timeline"]').click();

    const liveToggle = page.locator('[data-testid="live-toggle"]');
    const slider = page.locator('[data-testid="timeline-slider"]');

    // Enable live mode
    await liveToggle.click();

    // Slider should be disabled
    await expect(slider).toHaveAttribute('data-disabled', '');
  });
});
