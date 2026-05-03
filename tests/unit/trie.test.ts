import { describe, it, expect, beforeEach } from 'vitest';
import { trie } from '../../src/components/boggle/logic/trie';

beforeEach(() => {
  trie.root = { children: {} };
});

describe('trie — Trie ADT used by the solver', () => {
  it('add() then containsWord() round-trips an inserted word', () => {
    trie.add('cat');
    expect(trie.containsWord('cat')).toBe(true);
  });

  it('containsWord() is false for a strict prefix of an inserted word', () => {
    trie.add('cats');
    expect(trie.containsWord('cat')).toBe(false);
    expect(trie.containsWord('cats')).toBe(true);
  });

  it('containsPrefix() is true for any inserted prefix', () => {
    trie.add('cats');
    expect(trie.containsPrefix('c')).toBe(true);
    expect(trie.containsPrefix('ca')).toBe(true);
    expect(trie.containsPrefix('cat')).toBe(true);
    expect(trie.containsPrefix('cats')).toBe(true);
  });

  it('containsPrefix() is false for a path not in the trie', () => {
    trie.add('cat');
    expect(trie.containsPrefix('do')).toBe(false);
    expect(trie.containsPrefix('cb')).toBe(false);
  });

  it('handles multiple words sharing a prefix', () => {
    trie.add('cat');
    trie.add('cats');
    trie.add('car');
    expect(trie.containsWord('cat')).toBe(true);
    expect(trie.containsWord('cats')).toBe(true);
    expect(trie.containsWord('car')).toBe(true);
    expect(trie.containsPrefix('ca')).toBe(true);
    expect(trie.containsWord('ca')).toBe(false);
  });
});
