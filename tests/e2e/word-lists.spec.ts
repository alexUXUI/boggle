import { test, expect } from '@playwright/test';
import { goHome, waitForBoardReady } from './helpers';

test.describe('word list panels', () => {
  test('Found Words panel shows "No data" on a fresh board', async ({ page }) => {
    await goHome(page);
    await waitForBoardReady(page);
    await page.getByTestId('words-list-toggle-foundWords').click();
    await expect(
      page.getByTestId('words-list-empty-foundWords')
    ).toBeVisible();
  });

  test('Answers panel item count matches answers-count', async ({ page }) => {
    await goHome(page);
    await waitForBoardReady(page);
    const expected = Number(
      await page.getByTestId('answers-count').getAttribute('data-answers-count')
    );

    await page.getByTestId('words-list-toggle-answers').click();
    await expect(page.locator('[data-testid="word-answers"]')).toHaveCount(
      expected
    );
  });

  test('Escape closes an open panel', async ({ page }) => {
    await goHome(page);
    await waitForBoardReady(page);
    await page.getByTestId('words-list-toggle-answers').click();
    await expect(page.getByTestId('words-list-toggle-answers')).toHaveAttribute(
      'data-open',
      'true'
    );
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('words-list-toggle-answers')).toHaveAttribute(
      'data-open',
      'false'
    );
  });
});
