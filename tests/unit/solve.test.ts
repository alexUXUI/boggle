import { describe, it, expect, beforeEach } from 'vitest';
import {
  solve,
  getNeighbors,
  convertStringToMatrix,
} from '../../src/components/boggle/logic/boggle';
import { trie } from '../../src/components/boggle/logic/trie';

beforeEach(() => {
  // The solver builds words into a module-level trie singleton. Reset it so
  // dictionaries from one case don't leak into the next.
  trie.root = { children: {} };
});

describe('solve(dictionary, board) — Boggle word-finding contract', () => {
  // 4×4 board used by most cases:
  //   row 0:  c  a  t  s     (indexes 0..3)
  //   row 1:  d  o  g  e     (indexes 4..7)
  //   row 2:  p  l  a  n     (indexes 8..11)
  //   row 3:  s  t  o  n     (indexes 12..15)
  const BOARD = 'catsdogeplanston'.split('');

  it('returns dictionary words formable as 8-connected, no-cell-reuse paths', () => {
    const dict = ['cat', 'cats', 'dog', 'plan', 'note', 'span', 'foo'];
    // cat:    c(0,0)→a(0,1)→t(0,2)              ✓
    // cats:   …→s(0,3)                          ✓
    // dog:    d(1,0)→o(1,1)→g(1,2)              ✓
    // plan:   p(2,0)→l(2,1)→a(2,2)→n(2,3)       ✓
    // note:   no n is adjacent to any t on this board → ✗
    // span:   s(0,3)'s neighbors are (0,2),(1,2),(1,3); no p adjacent → ✗
    // foo:    no f on board                              → ✗
    expect(solve(dict, BOARD)).toEqual(['cat', 'cats', 'dog', 'plan']);
  });

  it('rejects words that would require reusing a cell', () => {
    // 2×2 of all 'a' — only 4 unique cells so any word of length > 4 fails.
    const dict = ['a', 'aa', 'aaa', 'aaaa', 'aaaaa'];
    expect(solve(dict, 'aaaa'.split(''))).toEqual(['a', 'aa', 'aaa', 'aaaa']);
  });

  it('honors diagonal adjacency', () => {
    // 2×2:  a b
    //        c d
    // ab horizontal, ac vertical, ad / bc diagonal.
    const dict = ['ab', 'ac', 'ad', 'bc'];
    expect(solve(dict, 'abcd'.split(''))).toEqual(['ab', 'ac', 'ad', 'bc']);
  });

  it('returns results sorted lexicographically', () => {
    const dict = ['plan', 'cat', 'dog'];
    expect(solve(dict, BOARD)).toEqual(['cat', 'dog', 'plan']);
  });

  it('deduplicates words findable via multiple paths', () => {
    // 2×2:  s e   →  "see" can be traced as s(0,0)→e(0,1)→e(1,0)
    //       e s      or s(0,0)→e(1,0)→e(0,1) (both valid).
    const dict = ['see', 'ses'];
    const result = solve(dict, 'sees'.split(''));
    expect(result.filter((w) => w === 'see').length).toBe(1);
    expect(result).toEqual(expect.arrayContaining(['see', 'ses']));
  });

  it('returns [] for an empty dictionary', () => {
    expect(solve([], BOARD)).toEqual([]);
  });

  it('returns [] when no dictionary word is on the board', () => {
    expect(solve(['xyz', 'qux', 'frob'], BOARD)).toEqual([]);
  });

  it('does not return non-adjacent letter combinations even when each letter exists', () => {
    // 'cap' would need c, a, p in adjacent positions. c(0,0), a(0,1) are
    // adjacent, but p is at (2,0) — not adjacent to a(0,1). So 'cap' must
    // not appear even though all three letters are on the board.
    const dict = ['cap'];
    expect(solve(dict, BOARD)).toEqual([]);
  });

  it('does not wrap from end of one row to start of the next', () => {
    // 'sd' would require s at (0,3) and d at (1,0). They're not 8-neighbors;
    // a wrap-buggy implementation would accept this. solve must not.
    const dict = ['sd'];
    expect(solve(dict, BOARD)).toEqual([]);
  });
});

describe('convertStringToMatrix(letters)', () => {
  it('partitions a 16-char string into a 4×4 matrix', () => {
    expect(convertStringToMatrix('abcdefghijklmnop')).toEqual([
      ['a', 'b', 'c', 'd'],
      ['e', 'f', 'g', 'h'],
      ['i', 'j', 'k', 'l'],
      ['m', 'n', 'o', 'p'],
    ]);
  });

  it('partitions a 9-char string into a 3×3 matrix', () => {
    expect(convertStringToMatrix('abcdefghi')).toEqual([
      ['a', 'b', 'c'],
      ['d', 'e', 'f'],
      ['g', 'h', 'i'],
    ]);
  });

  it('produces a square matrix for any perfect-square length', () => {
    const pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (const size of [2, 3, 4, 5, 6, 7]) {
      const chars = pool.slice(0, size * size);
      expect(chars.length, `pool too short for size ${size}`).toBe(size * size);
      const matrix = convertStringToMatrix(chars);
      expect(matrix.length).toBe(size);
      expect(matrix.every((row) => row.length === size)).toBe(true);
    }
  });
});

describe('getNeighbors(board, row, col) — coordinate-space adjacency', () => {
  const board4x4 = [
    ['a', 'b', 'c', 'd'],
    ['e', 'f', 'g', 'h'],
    ['i', 'j', 'k', 'l'],
    ['m', 'n', 'o', 'p'],
  ];

  const setOf = (pairs: number[][]) => new Set(pairs.map((p) => p.join(',')));

  it('returns 8 neighbors for an interior cell', () => {
    const neighbors = getNeighbors(board4x4, 1, 1);
    expect(setOf(neighbors)).toEqual(
      setOf([
        [0, 0], [0, 1], [0, 2],
        [1, 0],         [1, 2],
        [2, 0], [2, 1], [2, 2],
      ])
    );
  });

  it('returns 3 neighbors for a corner cell', () => {
    expect(setOf(getNeighbors(board4x4, 0, 0))).toEqual(
      setOf([[0, 1], [1, 0], [1, 1]])
    );
    expect(setOf(getNeighbors(board4x4, 3, 3))).toEqual(
      setOf([[2, 2], [2, 3], [3, 2]])
    );
  });

  it('returns 5 neighbors for a non-corner edge cell', () => {
    expect(getNeighbors(board4x4, 0, 1).length).toBe(5);
    expect(getNeighbors(board4x4, 1, 0).length).toBe(5);
  });

  it('does NOT wrap from one row into the next', () => {
    // top-right corner: (0,3). True neighbors: (0,2), (1,2), (1,3).
    // A wrap-buggy implementation would also include (1,0).
    const neighbors = setOf(getNeighbors(board4x4, 0, 3));
    expect(neighbors.has('1,0')).toBe(false);
    expect(neighbors).toEqual(setOf([[0, 2], [1, 2], [1, 3]]));
  });
});
