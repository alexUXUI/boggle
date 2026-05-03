import { describe, it, expect, vi, beforeEach } from 'vitest';

// board.ts is a runtime module of a Qwik component (it wraps handlers with
// `$()` at module load time). Outside Qwik's optimizer, `$()` throws. Stub
// `$` to be the identity so we can import the pure logic under test.
vi.mock('@builder.io/qwik', () => ({
  $: <T,>(fn: T) => fn,
}));
// board.ts also pulls in tone (Web Audio) and confetti — neither is exercised
// by `updatePath`, so stub them for the node runner.
vi.mock('tone', () => ({
  MonoSynth: class {
    toDestination() { return this; }
    triggerAttackRelease() {}
  },
  now: () => 0,
}));
vi.mock('../../src/components/boggle/logic/confetti', () => ({
  fireworks: () => {},
}));

import { updatePath } from '../../src/components/boggle/logic/board';
import type { BoardState, GameState } from '../../src/components/boggle/models';

const makeBoardState = (chars: string, size: number): BoardState => ({
  chars: chars.split(''),
  boardSize: size,
  boardWidth: 400,
  cellWidth: 80,
});

const makeGameState = (overrides: Partial<GameState> = {}): GameState => ({
  isWordFound: false,
  selectedChars: [],
  language: 'English',
  minCharLength: 3,
  currentLevel: 1,
  wordsUntilNextLevel: 1,
  levelStepSize: 1,
  ...overrides,
});

/**
 * Mirrors what handleClick does internally (computes lastCharInPath /
 * isInSelectedChars from current state, then delegates to updatePath).
 * Drives the path mutation directly without going through Qwik's QRL wrapper.
 */
const click = (
  boardState: BoardState,
  gameState: GameState,
  currentIndex: number
) => {
  const lastCharInPath = gameState.selectedChars[gameState.selectedChars.length - 1];
  const isInSelectedChars = Boolean(
    gameState.selectedChars.filter((c) => c.index === currentIndex).length
  );
  updatePath({
    boardState,
    currentIndex,
    gameState,
    isInSelectedChars,
    lastCharInPath,
    currentChar: boardState.chars[currentIndex],
  });
};

const pathOf = (g: GameState) => g.selectedChars.map((c) => c.char).join('');

describe('updatePath() — path-building contract', () => {
  // 4×4 board used throughout:
  //   row 0:  c(0)  a(1)  t(2)  s(3)
  //   row 1:  d(4)  o(5)  g(6)  e(7)
  //   row 2:  p(8)  l(9)  a(10) n(11)
  //   row 3:  s(12) t(13) o(14) n(15)
  let boardState: BoardState;
  beforeEach(() => {
    boardState = makeBoardState('catsdogeplanston', 4);
  });

  describe('starting and extending the path', () => {
    it('adds the first cell to an empty path', () => {
      const g = makeGameState();
      click(boardState, g, 0);
      expect(pathOf(g)).toBe('c');
    });

    it('extends through an orthogonal neighbor', () => {
      const g = makeGameState();
      click(boardState, g, 0); // c
      click(boardState, g, 1); // a (right of c)
      expect(pathOf(g)).toBe('ca');
    });

    it('extends through a diagonal neighbor', () => {
      const g = makeGameState();
      click(boardState, g, 0); // c at (0,0)
      click(boardState, g, 5); // o at (1,1) — diagonal neighbor
      expect(pathOf(g)).toBe('co');
    });
  });

  describe('adjacency rule', () => {
    it('ignores a cell that is not an 8-neighbor', () => {
      const g = makeGameState();
      click(boardState, g, 0); // c(0,0)
      click(boardState, g, 6); // g(1,2) — 2 cols away from c
      expect(pathOf(g)).toBe('c');
    });

    it('does NOT wrap horizontally across the right edge', () => {
      const g = makeGameState();
      click(boardState, g, 0); // c at (0,0)
      click(boardState, g, 3); // s at (0,3) — 3 cols away
      expect(pathOf(g)).toBe('c');
    });

    it('does NOT wrap from end of one row to start of the next', () => {
      const g = makeGameState();
      click(boardState, g, 3); // s at (0,3) — top-right
      click(boardState, g, 4); // d at (1,0) — bottom-left of next row
      expect(pathOf(g)).toBe('s');
    });

    it('accepts every 8-neighbor of an interior cell', () => {
      // o(1,1) = index 5; true neighbors are 0,1,2, 4, 6, 8,9,10.
      for (const n of [0, 1, 2, 4, 6, 8, 9, 10]) {
        const g = makeGameState();
        click(boardState, g, 5);
        click(boardState, g, n);
        expect(g.selectedChars.length, `cell ${n} should be a neighbor of cell 5`).toBe(2);
      }
    });

    it('rejects every non-neighbor of an interior cell', () => {
      for (const n of [3, 7, 11, 12, 13, 14, 15]) {
        const g = makeGameState();
        click(boardState, g, 5);
        click(boardState, g, n);
        expect(g.selectedChars.length, `cell ${n} should NOT be a neighbor of cell 5`).toBe(1);
      }
    });

    it('correctly bounds neighbors at corners (only 3)', () => {
      // Top-left corner: cell 0 has true neighbors {1, 4, 5}.
      for (const n of [1, 4, 5]) {
        const g = makeGameState();
        click(boardState, g, 0);
        click(boardState, g, n);
        expect(g.selectedChars.length).toBe(2);
      }
      // …and rejects everything else when starting from cell 0.
      for (const n of [2, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]) {
        const g = makeGameState();
        click(boardState, g, 0);
        click(boardState, g, n);
        expect(g.selectedChars.length, `cell ${n} should NOT be a neighbor of corner cell 0`).toBe(1);
      }
    });
  });

  describe('truncation on re-click', () => {
    it('truncates the path back to (but excluding) the re-clicked cell', () => {
      const g = makeGameState();
      click(boardState, g, 0); // c
      click(boardState, g, 1); // a
      click(boardState, g, 2); // t
      expect(pathOf(g)).toBe('cat');
      click(boardState, g, 1); // re-click a
      expect(pathOf(g)).toBe('c');
    });

    it('clicking the very first cell again clears the path', () => {
      const g = makeGameState();
      click(boardState, g, 0); // c
      click(boardState, g, 1); // a
      click(boardState, g, 0); // re-click c (the first cell)
      expect(pathOf(g)).toBe('');
    });
  });
});
