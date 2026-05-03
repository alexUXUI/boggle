# Testing

Two layers of tests live in `tests/`:

| Layer | Runner | Where | What it pins |
| --- | --- | --- | --- |
| **Unit** | Vitest | `tests/unit/` | Pure game logic — `solve()`, `updatePath()`, `randomBoard()`, `convertStringToMatrix()`, `getNeighbors()`, the trie. Fast, no browser. |
| **End-to-end** | Playwright | `tests/e2e/` | Customer-facing behavior in a real browser, plus visual regression baselines. |

Run both:

```sh
yarn test                # unit, then e2e
yarn test.unit           # vitest run
yarn test.unit.watch     # vitest watch mode
yarn test.e2e            # playwright test
yarn test.e2e.headed     # watch the browser drive itself
yarn test.e2e.ui         # playwright UI mode (filter / time-travel)
yarn test.e2e.update-snapshots  # rebaseline visual diffs
```

## One-time setup

```sh
yarn install                 # picks up vitest + @playwright/test
yarn playwright install      # downloads Playwright browser binaries
```

## Unit tests — `tests/unit/`

Behavioral contracts for the game's algorithms. Tests are intentionally written against the **spec** (Boggle rules) rather than the implementation, so they survive refactors of how the algorithms are structured. The current pinning:

| Spec | Verifies |
| --- | --- |
| `solve.test.ts` | Given a fixed dictionary and board, `solve()` returns exactly the dictionary words formable as 8-connected, no-cell-reuse paths. Cell reuse is rejected, diagonals work, results are sorted and deduplicated, no row-wrap. Also covers `convertStringToMatrix()` and `getNeighbors()`. |
| `path.test.ts` | `updatePath()` builds a path one cell at a time: starts on first click, extends through any of the 8 neighbors, ignores non-neighbors, does not wrap at row edges, truncates back to (excluding) a re-clicked cell. Includes corner/interior coverage. |
| `random-board.test.ts` | `randomBoard(language, size)` always returns size² letters drawn from the language's pool (English / Russian); falls back to English for unknown languages; produces variability across calls. Also pins `calculateCellWidth` monotonicity. |
| `trie.test.ts` | The Trie ADT — `add`, `containsWord`, `containsPrefix`, prefix-only matches, shared-prefix words. |

### Why these tests are independent of UI

If you rewrite board generation rules — say, you change the vowel/consonant ratio or add a Spanish pool — only `random-board.test.ts` should need updates. Likewise, refactoring `solve()` (e.g. swapping the trie for a hash-based dictionary) leaves `solve.test.ts` intact. The tests assert *what* the algorithm does, not *how*.

### Mocks used by the unit suite

`board.ts` is a Qwik runtime module: it wraps handlers in `$()` at import time, instantiates `Tone.MonoSynth`, and triggers confetti. None of that is part of the contract under test, so the unit specs stub them at the top:

```ts
vi.mock('@builder.io/qwik', () => ({ $: <T,>(fn: T) => fn }));
vi.mock('tone', () => ({ MonoSynth: class { /* … */ }, now: () => 0 }));
vi.mock('../../src/components/boggle/logic/confetti', () => ({ fireworks: () => {} }));
```

This is a one-time annoyance per spec — copy the block from `path.test.ts` if you add a new file that imports `board.ts`.

### The trie singleton

The solver uses a module-level `trie` instance. Each `solve()` call mutates it. `solve.test.ts` and `trie.test.ts` reset `trie.root = { children: {} }` in `beforeEach` so dictionaries don't leak between cases. If you add new specs that touch `solve` or the trie, do the same.

## End-to-end tests — `tests/e2e/`

Customer-facing behavior in a real browser, against the running dev server on port 5173.

| Spec | Verifies |
| --- | --- |
| `board-rendering.spec.ts` | 5×5 default, `?board=`/`?size=` URL overrides, answers count populates after solver runs. |
| `selection.spec.ts` | Click/drag selects cells, adjacency rule, Escape/Backspace/click-outside clears, click-on-selected truncates. |
| `controls.spec.ts` | Controls panel toggle + Escape, Word Size filter, Customize replaces letters and worker recomputes, Board Size resizes + recomputes, Reset Board re-rolls + recomputes. |
| `reset.spec.ts` | Reset Board re-rolls letters. |
| `found-word.spec.ts` | "CAT" → green flash → committed to foundWords, sub-min-length ignored, double-find ignored, non-dict path never commits, level increments 1→2→3 as words are found. |
| `word-lists.spec.ts` | Found Words "No data" placeholder, Answers list count matches `answers-count`, Escape closes open panel. |
| `visual.spec.ts` | Pixel-diff baselines for: initial page, controls open, mid-path highlight, answers panel open. |

The Playwright config (`playwright.config.ts`) starts `yarn start` automatically if nothing is on `:5173` and reuses any server already running there. In practice: keep `yarn dev` running in another tab while iterating.

### Selectors

All e2e tests pull from `data-testid` hooks — never CSS classes, never text content (except for the `Foggle` title check). Full hook reference is in [`FEATURES.md`](./FEATURES.md). The most useful ones:

- `[data-testid="board"]` carries `data-selected-path` (current path as a string), `data-board-size`, `data-is-word-found`.
- `[data-testid="cell-{i}"]` carries `data-cell-char`, `data-cell-index`, `data-cell-is-in-path`, `data-cell-bg`.
- `[data-testid="answers-count"]` carries `data-answers-count` so you don't have to parse "Answers: 12".
- `[data-testid="stats-panel"]` carries `data-current-level`, `data-found-count`, `data-answers-count`, `data-progress-percent`.
- `[data-testid="word-{variant}"]` lis carry `data-word`.

If you need a new hook, add it in the component and document it in `FEATURES.md`.

### Why the suite waits before asserting

The worker fetches its dictionary from `https://boggle.pages.dev/engmix.txt` on first load. Until that completes, `answersState.answers` is empty and "find a word" tests would race the solver. The `waitForBoardReady` helper polls `[data-answers-count]` until it goes positive, with a 30s timeout to absorb cold-start network latency. Always call it before any spec that depends on the solver.

### Visual regression workflow

1. Run `yarn test.e2e`. If a visual spec fails it writes a `*-actual.png` and a diff image under `test-results/`.
2. Open `playwright-report/index.html` (or run `yarn test.e2e.ui`) to view side-by-side.
3. If the change is intentional, run `yarn test.e2e.update-snapshots` and commit the updated PNGs in `tests/e2e/__screenshots__/`.

Visual specs use a fixed `?board=` parameter so the snapshot doesn't churn on randomization. Don't add visual assertions to pages where the board is left random.

## Adding a new spec

**Unit**: drop a `*.test.ts` in `tests/unit/`. If it imports from `board.ts`, copy the three `vi.mock(...)` calls from the top of `path.test.ts`. If it touches `solve` or the trie, reset `trie.root` in `beforeEach`.

**E2e**:
1. Use `goHome(page, { board, size, min })` to land on a deterministic state.
2. Call `waitForBoardReady(page)` if the test depends on the solver having produced answers.
3. Drive the UI through the `data-testid` getters in `helpers.ts` — `cell()`, `board()`, `dragPath()`.
4. Update `FEATURES.md` if you're documenting new behavior. The feature doc and the suite should always agree.

## Gotchas

- **E2E first run is slow** because of the dictionary fetch. CI cold start should come in under 30s but plan for ~10s of solver wait per `waitForBoardReady` call. Unit tests are unaffected — no network.
- **Audio is not asserted.** Tone.js plays through Web Audio; we only verify the state transition that *triggers* sound (path length increase).
- **Confetti is not asserted** for the same reason — we assert `data-is-word-found` and the post-300ms `foundWords` mutation instead.
- **Non-English languages**: the Language `<select>` only renders one option today, so there's no e2e spec switching to Russian. The unit suite covers Russian board generation directly.
