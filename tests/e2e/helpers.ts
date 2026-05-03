import { Page, Locator, expect } from '@playwright/test';

/**
 * Helpers for driving the Foggle UI from the player's perspective.
 *
 * Why these exist:
 * - The dictionary is fetched from a remote URL inside the worker. We can't
 *   assert "found word" behavior until the solver has reported a non-empty
 *   answers list — `waitForBoardReady` is the gate.
 * - The board uses mousedown/mouseover/mouseup to register a drag path, not
 *   per-cell click events. `dragPath` walks a path index-by-index using the
 *   real mouse API so behavior matches a human.
 */

export type Cell = { index: number; char: string };

export const goHome = async (
  page: Page,
  params: { board?: string; size?: number; min?: number; language?: string } = {}
) => {
  const search = new URLSearchParams();
  if (params.board) search.set('board', params.board);
  if (params.size != null) search.set('size', String(params.size));
  if (params.min != null) search.set('min', String(params.min));
  if (params.language) search.set('language', params.language);
  const qs = search.toString();
  await page.goto(qs ? `/?${qs}` : '/');
};

export const board = (page: Page) => page.getByTestId('board');
export const cell = (page: Page, index: number) =>
  page.getByTestId(`cell-${index}`);

export const answersCountValue = async (page: Page): Promise<number> => {
  const v = await page.getByTestId('answers-count').getAttribute('data-answers-count');
  return v ? Number(v) : 0;
};

/**
 * Wait until the worker has loaded the dictionary and reported at least one
 * answer for the current board. Generous timeout because the dictionary fetch
 * is remote on first run.
 */
export const waitForBoardReady = async (page: Page) => {
  await expect
    .poll(() => answersCountValue(page), {
      timeout: 30_000,
      message: 'solver did not produce any answers',
    })
    .toBeGreaterThan(0);
};

export const selectedPath = async (page: Page): Promise<string> => {
  return (await board(page).getAttribute('data-selected-path')) ?? '';
};

/**
 * Drag the mouse along a path of cell indexes. Mirrors how a real player
 * drags: mousedown on the first cell, mouseover each subsequent cell, mouseup
 * at the end.
 */
export const dragPath = async (page: Page, indexes: number[]) => {
  if (indexes.length === 0) return;
  const first = await cell(page, indexes[0]).boundingBox();
  if (!first) throw new Error(`cell ${indexes[0]} has no bounding box`);
  await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2);
  await page.mouse.down();
  for (let i = 1; i < indexes.length; i++) {
    const b = await cell(page, indexes[i]).boundingBox();
    if (!b) throw new Error(`cell ${indexes[i]} has no bounding box`);
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 });
  }
  await page.mouse.up();
};

export const cellInPath = (page: Page, index: number): Locator =>
  cell(page, index);
