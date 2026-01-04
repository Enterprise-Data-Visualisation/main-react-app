import { test, expect } from '@playwright/test';

test.describe('Signal Selection & Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => globalThis.localStorage.clear());
    await page.reload();
    // Wait for Sidebar to be visible
    await expect(page.getByTestId('sidebar')).toBeVisible();
  });

  test('should search and select a signal', async ({ page }) => {
    // 1. Verify we are on Assets tab
    const assetsTab = page.getByRole('tab', { name: 'Assets' });
    await expect(assetsTab).toHaveAttribute('data-state', 'active');

    // 2. Type in search box
    const searchInput = page.getByPlaceholder('Search assets...');
    await searchInput.fill('TI-1001');

    // 3. Wait for results (debounce logic is 300ms, wait a bit more)
    // We wait for the specific item to appear which handles the wait implicitly
    const signalButton = page
      .getByRole('button', { name: 'TI-1001', exact: false })
      .first();
    await expect(signalButton).toBeVisible({ timeout: 5000 });

    // 4. Click to select
    // Force click to avoid interception issues
    await signalButton.click({ force: true });

    // 5. Verify Legend updates (Primary verification)
    // Switch to Legend tab first
    await page.getByTestId('tab-legend').click();
    const legendRow = page.getByRole('cell', { name: 'TI-1001' }).first();
    await expect(legendRow).toBeVisible({ timeout: 10000 });

    // 6. Verify visual state (Secondary)
    await expect(signalButton.locator('.lucide-check')).toBeVisible();
  });

  test('should clear search and return to browse mode', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search assets...');
    await searchInput.fill('TI-1001');

    // Wait for results
    await expect(
      page.getByRole('button', { name: 'TI-1001' }).first()
    ).toBeVisible();

    // Clear search
    await searchInput.fill('');

    // Should return to browsing and show root assets
    // Should return to browsing and show root assets
    // Wait for debounce to settle (300ms) + fetch time
    await page.waitForTimeout(500);
    const site1 = page.getByRole('button', {
      name: 'Texas Refinery',
      exact: false,
    });
    // Also check for "No assets found" just in case db is empty
    await expect(site1.or(page.getByText('No assets found'))).toBeVisible({
      timeout: 10000,
    });
  });

  test('should switch to Saved Views tab', async ({ page }) => {
    const savedViewsTab = page.getByRole('tab', { name: 'Saved Views' });

    await savedViewsTab.click();
    await expect(savedViewsTab).toHaveAttribute('data-state', 'active');

    // Should see empty state or list
    // (Assuming no snapshots initially, or checking for the "Save View" hint)
    await expect(
      page.getByText('No saved views yet').or(page.getByText('Load View'))
    ).toBeVisible();
  });
});
