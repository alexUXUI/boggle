import { test, expect } from '@playwright/test';
import { board, cell, dragPath, goHome, selectedPath, waitForBoardReady } from './helpers';

const KNOWN_BOARD = 'catsdogeplanstone'.slice(0, 16); // 4x4
// Layout:
//   row 0: C A T S
//   row 1: D O G E
//   row 2: P L A N
//   row 3: S T O N
const C = 0, A = 1, T = 2, S = 3;
const FAR_S = 3;

test.describe('letter selection', () => {
  test.beforeEach(async ({ page }) => {
    await goHome(page, { board: KNOWN_BOARD, size: 4, min: 3 });
    await waitForBoardReady(page);
  });

  test('clicking a cell starts the path', async ({ page }) => {
    await cell(page, C).click();
    await expect(board(page)).toHaveAttribute('data-selected-path', 'C');
    await expect(cell(page, C)).toHaveAttribute('data-cell-is-in-path', 'true');
  });

  test('dragging extends path through adjacent cells', async ({ page }) => {
    await dragPath(page, [C, A, T]);
    await expect(board(page)).toHaveAttribute('data-selected-path', 'CAT');
  });

  test('non-adjacent cell is ignored', async ({ page }) => {
    await cell(page, C).click();
    await cell(page, FAR_S).click(); // S in row 0 col 3 is not adjacent to C(0,0)
    expect(await selectedPath(page)).toBe('C');
  });

  test('Escape clears the path', async ({ page }) => {
    await cell(page, C).click();
    await page.keyboard.press('Escape');
    expect(await selectedPath(page)).toBe('');
  });

  test('Backspace clears the path', async ({ page }) => {
    await cell(page, C).click();
    await page.keyboard.press('Backspace');
    expect(await selectedPath(page)).toBe('');
  });

  test('clicking outside the board clears the path', async ({ page }) => {
    await cell(page, C).click();
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    expect(await selectedPath(page)).toBe('');
  });

  test('clicking an already-selected cell truncates back to it', async ({ page }) => {
    await dragPath(page, [C, A, T]);
    expect(await selectedPath(page)).toBe('CAT');
    await cell(page, A).click();
    // Per updatePath: re-clicking truncates everything from that index onward,
    // i.e. the path becomes prefix BEFORE that cell.
    expect(await selectedPath(page)).toBe('C');
  });
});
