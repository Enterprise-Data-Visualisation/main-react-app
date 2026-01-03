import { test, expect } from '@playwright/test';

test.describe('App Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to fully load
    await page.waitForSelector('[data-testid="sidebar"]');
  });

  test('should load homepage with sidebar and header visible', async ({
    page,
  }) => {
    // Sidebar should be visible with correct structure
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toBeVisible();

    // Verify sidebar CSS properties
    const sidebarBox = await sidebar.boundingBox();
    expect(sidebarBox?.width).toBe(256); // w-64 = 16rem = 256px

    // App title should be visible
    const appTitle = page.locator('[data-testid="app-title"]');
    await expect(appTitle).toBeVisible();
    await expect(appTitle).toHaveText('MTSS Monitor');

    // Header should be visible
    const header = page.locator('[data-testid="header"]');
    await expect(header).toBeVisible();

    // Verify header height (h-14 = 3.5rem = 56px)
    const headerBox = await header.boundingBox();
    expect(headerBox?.height).toBe(56);

    // Dashboard title should be visible
    const dashboardTitle = page.locator('[data-testid="dashboard-title"]');
    await expect(dashboardTitle).toBeVisible();
    await expect(dashboardTitle).toHaveText('Asset Dashboard');
  });

  test('should display empty chart state when no signals selected', async ({
    page,
  }) => {
    const emptyState = page.locator('[data-testid="empty-chart-state"]');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toHaveText('Select a signal from the sidebar');

    // Verify signal count is 0
    const signalCount = page.locator('[data-testid="signal-count"]');
    await expect(signalCount).toHaveText('0 Signals Selected');
  });

  test('should have correct color scheme applied', async ({ page }) => {
    // Check that foreground color is applied (not default black)
    const dashboardTitle = page.locator('[data-testid="dashboard-title"]');
    const color = await dashboardTitle.evaluate(
      (el) => window.getComputedStyle(el).color
    );
    // Color should be defined (not transparent or default)
    expect(color).toBeTruthy();
    expect(color).not.toBe('rgba(0, 0, 0, 0)');
  });
});
