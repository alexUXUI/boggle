import { test, expect } from '@playwright/test';
import { goHome, waitForBoardReady, dragPath, board, cell } from './helpers';

/**
 * Visual regression — pin the customer-facing look of each major state.
 *
 * All visual specs use a deterministic ?board= so the snapshots don't churn
 * across runs. Run `yarn test.update-snapshots` after any intentional UI change.
 */

const FIXED_BOARD = 'catsdogeplanstone'.slice(0, 16);

test.use({ viewport: { width: 1280, height: 800 } });

test.describe('visual regression', () => {
  test('initial page', async ({ page }) => {
    await goHome(page, { board: FIXED_BOARD, size: 4, min: 3 });
    await waitForBoardReady(page);
    await expect(page).toHaveScreenshot('initial.png', { fullPage: true });
  });

  test('controls panel open', async ({ page }) => {
    await goHome(page, { board: FIXED_BOARD, size: 4, min: 3 });
    await waitForBoardReady(page);
    await page.getByTestId('controls-toggle').click();
    await expect(page.getByTestId('controls-panel')).toBeVisible();
    await expect(page).toHaveScreenshot('controls-open.png', { fullPage: true });
  });

  test('cells highlighted mid-path', async ({ page }) => {
    await goHome(page, { board: FIXED_BOARD, size: 4, min: 3 });
    await waitForBoardReady(page);
    // Click without dragging-up so the highlight stays on screen.
    await cell(page, 0).hover();
    await page.mouse.down();
    const a = await cell(page, 1).boundingBox();
    if (a) await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2, { steps: 4 });
    await expect(board(page)).toHaveAttribute('data-selected-path', 'CA');
    await expect(board(page)).toHaveScreenshot('board-mid-path.png');
    await page.mouse.up();
  });

  test('answers panel open', async ({ page }) => {
    await goHome(page, { board: FIXED_BOARD, size: 4, min: 4 });
    await waitForBoardReady(page);
    await page.getByTestId('words-list-toggle-answers').click();
    await expect(page.getByTestId('words-list-answers')).toBeVisible();
    await expect(page).toHaveScreenshot('answers-open.png', { fullPage: true });
  });
});
