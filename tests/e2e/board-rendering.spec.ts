import { test, expect } from '@playwright/test';
import { board, cell, goHome, waitForBoardReady } from './helpers';

test.describe('board rendering', () => {
  test('default 5x5 grid renders with 25 cells', async ({ page }) => {
    await goHome(page);
    await expect(page.getByTestId('app-title')).toHaveText('Foggle');
    await expect(board(page)).toHaveAttribute('data-board-size', '5');
    await expect(page.locator('[data-testid^="cell-"]')).toHaveCount(25);
  });

  test('?board= overrides letters in row-major order', async ({ page }) => {
    const chars = 'abcdefghijklmnopqrstuvwxy';
    await goHome(page, { board: chars, size: 5 });
    for (let i = 0; i < chars.length; i++) {
      await expect(cell(page, i)).toHaveAttribute(
        'data-cell-char',
        chars[i].toUpperCase()
      );
    }
  });

  test('?size=4 yields a 4x4 grid', async ({ page }) => {
    await goHome(page, { size: 4 });
    await expect(board(page)).toHaveAttribute('data-board-size', '4');
    await expect(page.locator('[data-testid^="cell-"]')).toHaveCount(16);
  });

  test('answers count populates once solver runs', async ({ page }) => {
    await goHome(page);
    await waitForBoardReady(page);
    const v = await page.getByTestId('answers-count').getAttribute('data-answers-count');
    expect(Number(v)).toBeGreaterThan(0);
  });
});
