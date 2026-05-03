import { test, expect } from '@playwright/test';
import { board, cell, dragPath, goHome, waitForBoardReady } from './helpers';

// 4x4 layout chosen so common 3-letter words map to adjacent paths:
//   row 0: C A T S   (indexes 0..3)
//   row 1: D O G E   (indexes 4..7)
//   row 2: P L A N   (indexes 8..11)
//   row 3: S T O N   (indexes 12..15)
const KNOWN_BOARD = 'catsdogeplanston';

test.describe('found-word feedback', () => {
  test.beforeEach(async ({ page }) => {
    await goHome(page, { board: KNOWN_BOARD, size: 4, min: 3 });
    await waitForBoardReady(page);
  });

  test('finding "CAT" flashes green, commits to foundWords, and advances level', async ({ page }) => {
    const stats = page.getByTestId('stats-panel');
    expect(await stats.getAttribute('data-found-count')).toBe('0');
    expect(await stats.getAttribute('data-current-level')).toBe('1');

    // Drag through the path. dragPath ends with mouse.up().
    await dragPath(page, [0, 1, 2]);

    // Brief green-state window: the board flips data-is-word-found=true
    // and selected cells switch background to bg-green-200 for ~300ms before
    // the path is cleared. Playwright polls quickly enough to catch it.
    await expect(board(page)).toHaveAttribute('data-is-word-found', 'true', {
      timeout: 1000,
    });
    await expect(cell(page, 0)).toHaveAttribute('data-cell-bg', 'bg-green-200');
    await expect(cell(page, 1)).toHaveAttribute('data-cell-bg', 'bg-green-200');
    await expect(cell(page, 2)).toHaveAttribute('data-cell-bg', 'bg-green-200');

    // After the 300ms commit timer: path clears, isWordFound resets, and the
    // word is pushed onto foundWords.
    await expect(board(page)).toHaveAttribute('data-selected-path', '');
    await expect(board(page)).toHaveAttribute('data-is-word-found', 'false');
    await expect(stats).toHaveAttribute('data-found-count', '1');

    // Level mechanic: starting wordsUntilNextLevel=1, finding 1 word advances level.
    await expect(stats).toHaveAttribute('data-current-level', '2');

    // The word lands in the Found Words list.
    await page.getByTestId('words-list-toggle-foundWords').click();
    await expect(
      page.locator('[data-testid="word-foundWords"][data-word="cat"]')
    ).toBeVisible();
  });

  test('finding the same word twice only counts once', async ({ page }) => {
    const stats = page.getByTestId('stats-panel');
    await dragPath(page, [0, 1, 2]);
    await expect(stats).toHaveAttribute('data-found-count', '1');

    // Try CAT again on the same indexes.
    await dragPath(page, [0, 1, 2]);
    // Ensure the 300ms commit timer would have run if it were going to.
    await page.waitForTimeout(500);
    await expect(stats).toHaveAttribute('data-found-count', '1');
  });

  test('words shorter than minCharLength are not accepted', async ({ page }) => {
    await goHome(page, { board: KNOWN_BOARD, size: 4, min: 5 });
    await waitForBoardReady(page);
    const stats = page.getByTestId('stats-panel');
    expect(await stats.getAttribute('data-found-count')).toBe('0');

    await dragPath(page, [0, 1, 2]); // CAT — 3 chars, below min 5.

    await page.waitForTimeout(500);
    await expect(stats).toHaveAttribute('data-found-count', '0');
    await expect(board(page)).toHaveAttribute('data-is-word-found', 'false');
  });

  test('a non-dictionary path is selectable but never commits', async ({ page }) => {
    const stats = page.getByTestId('stats-panel');

    // CD — not adjacent? C(0,0), D(1,0). Adjacent (vertically). But "cd" isn't a word.
    await dragPath(page, [0, 4]);
    await expect(board(page)).toHaveAttribute('data-selected-path', 'CD');

    await page.waitForTimeout(500);
    await expect(stats).toHaveAttribute('data-found-count', '0');
    await expect(board(page)).toHaveAttribute('data-is-word-found', 'false');
  });

  test('three found words advance level 1 → 2 → 3 (cost grows linearly)', async ({ page }) => {
    const stats = page.getByTestId('stats-panel');

    // 1st word: CAT (C=0, A=1, T=2). Pushes level to 2 (1 word required).
    await dragPath(page, [0, 1, 2]);
    await expect(stats).toHaveAttribute('data-current-level', '2');

    // From level 2: 2 more words required. ATE: A=1, T=2, E=7.
    await dragPath(page, [1, 2, 7]);
    await expect(stats).toHaveAttribute('data-found-count', '2');
    await expect(stats).toHaveAttribute('data-current-level', '2');

    // DOG: D=4, O=5, G=6.
    await dragPath(page, [4, 5, 6]);
    await expect(stats).toHaveAttribute('data-found-count', '3');
    await expect(stats).toHaveAttribute('data-current-level', '3');
  });
});
