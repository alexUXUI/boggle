import { test, expect } from '@playwright/test';
import { goHome, cell, waitForBoardReady } from './helpers';

test('Reset Board re-rolls the letters', async ({ page }) => {
  await goHome(page, { size: 5 });
  await waitForBoardReady(page);

  const before: string[] = [];
  for (let i = 0; i < 25; i++) {
    before.push((await cell(page, i).getAttribute('data-cell-char')) ?? '');
  }

  await page.getByTestId('reset-board').click();

  // Different board most of the time. Re-rolling a 5x5 to the exact same chars
  // is astronomically unlikely; if it ever flakes, retry once.
  await expect
    .poll(async () => {
      const now: string[] = [];
      for (let i = 0; i < 25; i++) {
        now.push((await cell(page, i).getAttribute('data-cell-char')) ?? '');
      }
      return now.join('') !== before.join('');
    })
    .toBe(true);
});
