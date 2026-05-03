import { test, expect } from '@playwright/test';
import { goHome, waitForBoardReady, cell, board, answersCountValue } from './helpers';

test.describe('controls panel', () => {
  test('toggle opens and closes the panel', async ({ page }) => {
    await goHome(page);
    const toggle = page.getByTestId('controls-toggle');
    await expect(toggle).toHaveAttribute('data-controls-open', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('data-controls-open', 'true');
    await expect(page.getByTestId('controls-panel')).toBeVisible();
    await toggle.click();
    await expect(toggle).toHaveAttribute('data-controls-open', 'false');
  });

  test('Escape closes the controls panel', async ({ page }) => {
    await goHome(page);
    await page.getByTestId('controls-toggle').click();
    await expect(page.getByTestId('controls-panel')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('controls-toggle')).toHaveAttribute(
      'data-controls-open',
      'false'
    );
  });

  test('Word Size raises the threshold and lowers the answers count', async ({ page }) => {
    // Use a deterministic board so the "before" baseline is stable.
    await goHome(page, { board: 'catsdogeplanston', size: 4, min: 3 });
    await waitForBoardReady(page);
    const before = await answersCountValue(page);
    expect(before).toBeGreaterThan(0);

    await page.getByTestId('controls-toggle').click();
    await page.getByTestId('word-size-input').fill('6');
    await page.getByTestId('word-size-input').blur();

    // Filter is applied client-side without re-running the worker. The count
    // strictly drops because we now exclude all 3-, 4- and 5-letter answers.
    await expect
      .poll(() => answersCountValue(page))
      .toBeLessThan(before);
  });

  test('Word Size lowering threshold restores prior answers', async ({ page }) => {
    await goHome(page, { board: 'catsdogeplanston', size: 4, min: 3 });
    await waitForBoardReady(page);
    const baseline = await answersCountValue(page);

    await page.getByTestId('controls-toggle').click();
    const input = page.getByTestId('word-size-input');
    await input.fill('6');
    await input.blur();
    await expect.poll(() => answersCountValue(page)).toBeLessThan(baseline);

    await input.fill('3');
    await input.blur();
    await expect.poll(() => answersCountValue(page)).toBe(baseline);
  });

  test('Customize input replaces letters and the worker recomputes', async ({ page }) => {
    await goHome(page, { board: 'catsdogeplanston', size: 4, min: 3 });
    await waitForBoardReady(page);
    const before = await answersCountValue(page);

    const newBoard = 'rainbowsdogeplay'; // 16 chars; produces a different answer set
    await page.getByTestId('controls-toggle').click();
    const customize = page.getByTestId('customize-input');
    await customize.fill(newBoard);
    await customize.blur();

    // Cells reflect the typed letters in row-major order.
    for (let i = 0; i < newBoard.length; i++) {
      await expect(cell(page, i)).toHaveAttribute(
        'data-cell-char',
        newBoard[i].toUpperCase()
      );
    }

    // Worker re-ran. We don't assert a specific number (depends on the
    // remote dictionary) — only that it recomputed against the new letters,
    // which means the count changes from the catsdogeplanston baseline.
    await expect
      .poll(() => answersCountValue(page), { timeout: 10_000 })
      .not.toBe(before);
    expect(await answersCountValue(page)).toBeGreaterThan(0);
  });

  test('Board Size changes the grid and re-runs the solver', async ({ page }) => {
    await goHome(page, { board: 'catsdogeplanston', size: 4, min: 3 });
    await waitForBoardReady(page);

    await page.getByTestId('controls-toggle').click();
    const sizeInput = page.getByTestId('board-size-input');
    await sizeInput.fill('5');
    await sizeInput.blur();

    await expect(board(page)).toHaveAttribute('data-board-size', '5');
    await expect(page.locator('[data-testid^="cell-"]')).toHaveCount(25);

    // Solver re-ran for the new randomized board.
    await expect
      .poll(() => answersCountValue(page), { timeout: 30_000 })
      .toBeGreaterThan(0);
  });

  test('Reset Board re-rolls letters and re-runs the solver', async ({ page }) => {
    await goHome(page, { size: 5, min: 3 });
    await waitForBoardReady(page);

    const beforeChars = await page
      .locator('[data-testid^="cell-"]')
      .evaluateAll((els) =>
        els.map((el) => el.getAttribute('data-cell-char')).join('')
      );

    await page.getByTestId('reset-board').click();

    // Letters change AND the worker reports answers for the new board.
    await expect
      .poll(async () =>
        page
          .locator('[data-testid^="cell-"]')
          .evaluateAll((els) =>
            els.map((el) => el.getAttribute('data-cell-char')).join('')
          )
      )
      .not.toBe(beforeChars);
    await expect
      .poll(() => answersCountValue(page), { timeout: 30_000 })
      .toBeGreaterThan(0);
  });
});
