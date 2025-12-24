# Overview Documentation

This folder contains comprehensive technical documentation for the Boggle game project, focused on **concepts** rather than code syntax.

## Philosophy

These documents are designed for:

- **AI Assistants** (Claude, Cursor, GitHub Copilot) to understand system architecture
- **New Developers** to onboard quickly with conceptual understanding
- **Feature Planning** to understand existing patterns and performance characteristics

**No Code Examples** - Documentation focuses purely on concepts, algorithms, and architecture. Code is self-documenting via TypeScript types and comments.

---

## Documents

### 📐 [ARCHITECTURE.md](./ARCHITECTURE.md)

**Complete system architecture and design decisions**

**Topics:**

- Product description (what, why, how)
- System architecture diagrams (Mermaid)
- Performance strategy (SSR, lazy computation, Qwik benefits)
- Core algorithms (Trie data structure, DFS solver)
- Technology stack overview
- Application lifecycle (request → server → response → client → interaction)
- Deployment architecture (Cloudflare Pages, CI/CD)
- File structure and organization
- Context system design
- Critical design decisions explained

**Use for**: Understanding how the entire system works, making architectural decisions, planning major features

### 🚀 [UPGRADE_GUIDE.md](./UPGRADE_GUIDE.md)

**Framework upgrade strategy and planning**

**Current Status:**

- Qwik: 0.18.1 → **1.18.0** (critical upgrade needed)
- QwikCity: 0.2.1 → **1.18.0** (critical upgrade needed)
- ~2 years behind current versions

**Topics:**

- Upgrade impact analysis
- 6-phase upgrade strategy
- Testing strategy (automated + manual)
- Known breaking changes
- Rollback plan
- Post-upgrade optimization
- Timeline estimates (15-23 hours total)

**Use for**: Planning and executing the Qwik v1.x upgrade, understanding risks and timelines

---

## Diagram Files

### `diagrams/` folder

Contains detailed Mermaid diagrams (`.mmd` files):

- **architecture-detailed.mmd** - Complete system architecture with all layers and components
- **request-lifecycle.mmd** - Sequence diagram of request/response/interaction flow
- **data-flow.mmd** - Data flow from server through client to game state
- **component-hierarchy.mmd** - Component tree and context relationships

**Viewing .mmd files:**

- VS Code: Install Mermaid Preview extension
- GitHub: Renders natively
- Browser: Use Mermaid Live Editor (mermaid.live)

---

## Key Concepts

### Performance Architecture

The application uses a **three-tier performance model**:

1. **Server-Side Rendering** - HTML rendered on edge network, instant first paint
2. **WebAssembly Computation** - Rust solver for CPU-intensive word finding
3. **Web Worker Offloading** - Background dictionary processing, non-blocking UI

### Core Algorithm: Trie + DFS

**Trie Data Structure:**

- O(m) word lookup where m = word length
- O(m) prefix validation for early pruning
- Essential for efficient Boggle solving

**Depth-First Search:**

- Backtracking algorithm explores all word paths
- Trie pruning eliminates invalid branches immediately
- Typical performance: O(N × W) where N = cells, W = words per cell (~10-50)

### Qwik Framework Benefits

**Resumability** - Zero hydration cost, instant interactivity

- Traditional: HTML → Download JS → Execute → Rebuild state → Interactive
- Qwik: HTML → Interactive immediately → Load JS on interaction

**Lazy Loading** - Fine-grained code splitting at function level

**SSR-First** - Built for server-side rendering from ground up

---

## Quick Navigation

### For Understanding the System

Start with: [ARCHITECTURE.md](./ARCHITECTURE.md)  
Focus on: System Architecture, Application Lifecycle, Performance Strategy sections

### For Upgrading Qwik

Start with: [UPGRADE_GUIDE.md](./UPGRADE_GUIDE.md)  
Focus on: Current Status, Upgrade Strategy, Testing Strategy sections

### For Visual Learners

Start with: `diagrams/architecture-detailed.mmd`  
Then view: `diagrams/request-lifecycle.mmd` for request flow

### For Feature Development

1. Read ARCHITECTURE.md Core Algorithms section
2. View diagrams/component-hierarchy.mmd for context system
3. Understand Context System and File Structure sections
4. Refer to actual source files for implementation details

---

## File Locations Quick Reference

**Entry Points:**

- `src/routes/index.tsx` - Page entry, server loader
- `src/components/boggle/BoggleRoot.tsx` - Main component

**Core Logic:**

- `src/components/boggle/logic/server.ts` - SSR (board generation)
- `src/components/boggle/logic/trie.ts` - TypeScript Trie
- `src/components/boggle/worker.ts` - Web Worker

**WASM Solver:**

- `src/components/boggle/boggle-solver/src/lib.rs` - WASM entry
- `src/components/boggle/boggle-solver/src/trie.rs` - Rust Trie
- `src/components/boggle/boggle-solver/src/solver.rs` - DFS algorithm

**Key Commands:**

- `npm run wasm` - Compile Rust to WASM
- `npm run dev` - Development server
- `npm run build` - Production build

---

## AI Assistant Guidelines

If you're an AI assistant helping with this codebase:

### Before Making Changes

1. Read ARCHITECTURE.md to understand the system
2. Review diagrams to visualize component relationships
3. Understand the performance principles (SSR, lazy loading, WASM offloading)
4. Check Context System to see state management

### When Adding Features

- Maintain SSR-first approach (server renders initial state)
- Keep expensive computation in Web Workers
- Use Qwik's $ optimizer for lazy loading
- Leverage existing Context providers for state
- Follow Trie pattern for dictionary operations

### When Modifying Performance-Critical Code

- WASM solver changes require `npm run wasm` recompilation
- Trie operations must remain O(m) complexity
- Main thread must stay non-blocking
- Test with Lighthouse to verify no regressions

### When Upgrading Dependencies

- Follow UPGRADE_GUIDE.md phased approach
- Test at each checkpoint
- Verify WASM compatibility after tooling updates
- Check Cloudflare deployment after Qwik updates

---

## Documentation Maintenance

### When to Update

**ARCHITECTURE.md:**

- Major architectural changes
- New core features added
- Performance strategy changes
- Technology stack updates

**UPGRADE_GUIDE.md:**

- After completing upgrades (document lessons learned)
- When new framework versions release
- When breaking changes are discovered

**Diagrams:**

- Component hierarchy changes
- New layers added to architecture
- Data flow patterns change

### How to Update

1. Update relevant markdown file
2. Keep diagrams in sync with architecture
3. Maintain conceptual focus (no code unless critical)
4. Update this README if structure changes

---

## Troubleshooting Common Issues

### WASM Not Loading

- Recompile: `npm run wasm`
- Check: `src/components/boggle/boggle-solver/pkg/` exists
- Verify: Vite WASM plugin in vite.config.ts

### Web Worker Not Loading Dictionary

- Check: `public/engmix.txt` exists
- Verify: Network tab shows dictionary fetch
- Inspect: Worker instantiation in console

### Performance Regression

- Run: Lighthouse audit
- Check: Bundle sizes in dist/build/
- Verify: SSR still working (view page source)

### TypeScript Errors After Upgrade

- Clear: `rm -rf node_modules/.vite`
- Rebuild: `npm run build.types`
- Check: Migration guides for API changes

---

## Contributing

When contributing:

1. **Update documentation** if architecture changes
2. **Keep concept focus** - no code examples in docs
3. **Update diagrams** if structure changes
4. **Test thoroughly** - especially after framework updates

---

**Documentation Version**: December 2024  
**Framework Status**: Qwik 0.18.1 → Upgrade to 1.18.0 needed  
**For Questions**: See project README.md or open issue
