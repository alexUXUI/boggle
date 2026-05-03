# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `yarn dev` / `yarn start` — run the Vite SSR dev server. `yarn dev` first rebuilds the Rust/WASM solver via `yarn wasm`; `yarn start` does not, so run `yarn wasm` manually after editing Rust sources.
- `yarn wasm` — `wasm-pack build ./src/components/boggle/boggle-solver --target web`. Required before any command that imports the solver if you've changed Rust code.
- `yarn build` — full Qwik production build (client + SSR + `tsc --noEmit` typecheck via `build.types`). The Cloudflare Pages adaptor is wired in through `adaptors/cloudflare-pages/vite.config.ts` and is what `build.server` uses.
- `yarn preview` — production build + local preview server.
- `yarn deploy` — `wrangler pages dev ./dist` for local Cloudflare Pages emulation.
- `yarn lint` — `eslint "src/**/*.ts*"`.
- `yarn fmt` / `yarn fmt.check` — Prettier write / check.

There is no test runner configured.

## Architecture

This is a **Qwik City** SSR app (deployed to Cloudflare Pages) implementing Boggle. Qwik's resumability model means the page is server-rendered with a `loader$` and then state is hydrated lazily; almost all interactivity flows through `useStore` + `createContext`.

### Request → initial board

`src/routes/index.tsx` calls `useBoggleData` (a `loader$`) which delegates to `handleGet` in `src/components/boggle/logic/server.ts`. That function:

1. Generates a random board with `randomBoard()` from `logic/board.ts` (language-specific vowel/consonant pools).
2. Sniffs the User-Agent (`ua-parser-js`) to pick a `boardWidth` (350 mobile, 400 desktop) — used by `calculateCellWidth` for cell sizing.
3. Allows URL params `?language=`, `?board=`, `?size=`, `?min=` to override defaults.

The serialized result is passed to `BoogleRoot` as props.

### State (contexts)

`src/components/boggle/context.tsx` defines five contexts, all populated in `BoggleRoot.tsx` via `useStore` + `useContextProvider`:

- `BoardCtx` — `chars`, `boardSize`, `boardWidth`, `cellWidth`.
- `GameCtx` — `selectedChars` path, `language`, `minCharLength`, `currentLevel`, `wordsUntilNextLevel`, `levelStepSize`, `isWordFound`.
- `AnswersCtx` — `answers` (all solver-found words) and `foundWords` (player-found subset).
- `DictionaryCtx` — full word list, populated once from the worker.
- `WorkerCtx` — `noSerialize`'d `Worker` reference.

Two `useTask$` blocks in `BoggleRoot.tsx` drive the game loop: one watches `selectedChars` and calls `handleFoundWord`; the other watches `foundWords` and advances the level/progress counters.

### Web Worker solver

`src/components/boggle/worker.ts` is loaded via `import BoggleWorker from './worker?worker'`. On each `postMessage({ language, board, minCharLength, isDictionaryLoaded })` it:

1. Fetches the dictionary (cached in module scope) via `logic/api.ts` — English from `https://boggle.pages.dev/engmix.txt`, Russian from a GitHub raw URL.
2. Runs `solve()` from `logic/boggle.ts`: builds a Trie (`logic/trie.ts`), converts the flat board string to a square matrix, and runs DFS from every cell, pruning with `containsPrefix`.
3. Posts back `{ dictionary, answers }`. The dictionary is only sent on first response (gated by `isDictionaryLoaded`).

`Controls.tsx` re-`postMessage`s the worker whenever language, size, or board chars change.

### Rust/WASM solver (currently unused at runtime)

`src/components/boggle/boggle-solver/` is a Rust crate compiled to WASM via `wasm-pack`. `vite.config.ts` wires `vite-plugin-wasm-pack` and `vite-plugin-wasm` (with `topLevelAwait` in the worker config). The current `worker.ts` uses the JS solver only — the WASM module is built but not imported. If you need to use it, import from `boggle-solver/pkg` and ensure `yarn wasm` has run.

### Input handling

`logic/board.ts` exports `handleClick` and `handleTouch` (both `$`-wrapped Qwik QRLs). Touch resolves the target cell via `document.elementFromPoint` + `data-cell-*` attributes. `updatePath` enforces the Boggle adjacency rule by computing 8 neighbor indices from the last selected cell's index and `boardSize`. Selecting a cell already in the path truncates the path back to that cell.

Each selection plays a Tone.js note (pitch indexed by path length, capped at 30 in `indexToSound`); found-word events trigger `fireworks()` (canvas-confetti) and play `/wow.mp3`.

### Cloudflare Pages

`adaptors/cloudflare-pages/vite.config.ts` extends the base Vite config with `cloudflarePagesAdaptor({ staticGenerate: true })`. `functions/[[path]].ts` is the catch-all Pages Function entry. `public/_headers` and `public/_redirects` ship as-is. `src/entry.cloudflare-pages.tsx` is the SSR entry for the worker.
