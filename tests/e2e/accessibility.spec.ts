import { test, expect } from '@playwright/test';
import { board, cell, goHome, waitForBoardReady } from './helpers';

// Same 4x4 layout used in found-word.spec.ts:
//   row 0: C A T S   (indexes 0..3)
//   row 1: D O G E   (indexes 4..7)
const KNOWN_BOARD = 'catsdogeplanston';

test.describe('keyboard accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await goHome(page, { board: KNOWN_BOARD, size: 4, min: 3 });
    await waitForBoardReady(page);
  });

  test('cell buttons are reachable and activate via Enter', async ({ page }) => {
    // Focus the first cell directly (avoids relying on the exact Tab order
    // of the surrounding chrome, which is not part of the contract).
    await cell(page, 0).focus();
    await expect(cell(page, 0)).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(board(page)).toHaveAttribute('data-selected-path', 'C');
    await expect(cell(page, 0)).toHaveAttribute('data-cell-is-in-path', 'true');
  });

  test('Space activates the focused cell', async ({ page }) => {
    await cell(page, 0).focus();
    await page.keyboard.press('Space');
    await expect(board(page)).toHaveAttribute('data-selected-path', 'C');
  });

  test('keyboard-only path build respects adjacency and finds CAT', async ({ page }) => {
    const stats = page.getByTestId('stats-panel');

    await cell(page, 0).focus();
    await page.keyboard.press('Enter');

    await cell(page, 1).focus();
    await page.keyboard.press('Enter');

    // Non-adjacent attempt: focus a far cell and press Enter. Path must NOT grow.
    await cell(page, 11).focus(); // N at (2,3) — not adjacent to A at (0,1)
    await page.keyboard.press('Enter');
    await expect(board(page)).toHaveAttribute('data-selected-path', 'CA');

    // Continue to T to complete CAT.
    await cell(page, 2).focus();
    await page.keyboard.press('Enter');
    await expect(board(page)).toHaveAttribute('data-selected-path', 'CAT');

    // Word commits the same way as a mouse drag.
    await expect(stats).toHaveAttribute('data-found-count', '1');
    await expect(board(page)).toHaveAttribute('data-selected-path', '');
  });

  test('Escape clears a keyboard-built path', async ({ page }) => {
    await cell(page, 0).focus();
    await page.keyboard.press('Enter');
    await cell(page, 1).focus();
    await page.keyboard.press('Enter');
    await expect(board(page)).toHaveAttribute('data-selected-path', 'CA');

    await page.keyboard.press('Escape');
    await expect(board(page)).toHaveAttribute('data-selected-path', '');
  });

  test('Backspace clears a keyboard-built path', async ({ page }) => {
    await cell(page, 0).focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Backspace');
    await expect(board(page)).toHaveAttribute('data-selected-path', '');
  });

  test('cell buttons expose accessible names matching their letter', async ({ page }) => {
    // The button's only text content is the letter, so the accessible name
    // should equal the displayed character. This is what screen readers will
    // announce as the user navigates the grid.
    await expect(cell(page, 0)).toHaveAccessibleName('C');
    await expect(cell(page, 1)).toHaveAccessibleName('A');
    await expect(cell(page, 2)).toHaveAccessibleName('T');
  });
});
