# DSA Playground — Visualizer Site

A static site that turns this repository into an interactive textbook: every README becomes a page, topic pages show the Python / C++ / Go sources in tabs, and selected topics get a step-by-step visualization you can drive with your own input.

Built with [Astro](https://astro.build) (static output) and React islands for the visualizations. Deployed to GitHub Pages by [`.github/workflows/pages.yml`](../.github/workflows/pages.yml).

---

## Run it locally

Requires Node 20 or newer.

```bash
cd web
npm install
npm run dev          # http://localhost:4321/dsa-playground/  (live reload, also picks up README edits)
```

Or from the repository root: `make web-dev`.

| Command | What it does |
|---------|--------------|
| `npm run dev` | Dev server with live reload |
| `npm run build` | Static build into `web/dist/` (also prints `[broken-link]` warnings for README links that point nowhere) |
| `npm run preview` | Serve the production build locally |
| `npm test` | Vitest unit tests (content pipeline + every visualization) |
| `npm run check` | Type-check `.astro`, `.ts` and `.tsx` files |
| `make test-web` (repo root) | Tests, type check and build in one go |

Handy URL parameters on any page with a visualization: `?step=40` opens the run at step 40 (useful for linking to a specific moment), and `?theme=dark` / `?theme=light` previews a theme without changing the saved preference.

---

## How the content works

- [`src/lib/repo.ts`](src/lib/repo.ts) walks the repository at build time. A folder with `Python/`, `C++/` or `Go/` subfolders is a **topic**; any other folder with a README (or with topics below it) is a **category**. Root `README.md`, `STUDY_GUIDE.md` and `CONTRIBUTING.md` become `/overview/`, `/study-guide/` and `/contributing/`.
- Folder names become URL slugs (`Dijkstra's_Algorithm` → `dijkstras-algorithm`, `B+ Tree` → `b-plus-tree`); the build fails on a slug collision.
- [`src/lib/markdown.ts`](src/lib/markdown.ts) renders READMEs with Astro's Markdown pipeline (GFM, Shiki, GitHub-compatible heading ids) and rewrites links: README → page, `Python/` → that language tab, other repo files → GitHub, missing targets → a dashed red "broken link" plus a build warning.
- READMEs stay the single source of truth. Improving a README improves the site; nothing is copied into `web/`.

---

## How the visualizations work

```
input text ──parse──▶ input ──trace──▶ Frame[] ──▶ Player (controls, caption, pseudocode, state)
                                         │
                                         └─ frame.state ──render──▶ renderer (SVG / HTML)
```

- A **spec** ([`src/viz/core/types.ts`](src/viz/core/types.ts)) bundles a parser, a **tracer** that records every step as a full snapshot (`Frame`), a renderer, the pseudocode and a legend. Because every frame is a snapshot, stepping backwards and scrubbing are just index changes.
- **Tracers** live in [`src/viz/algorithms/`](src/viz/algorithms/) and are plain TypeScript, so they are unit-tested without a browser.
- **Renderers** are shared across topics: `ArrayBars` (sorting), `GraphView` (BFS / DFS / Dijkstra), `TreeView` (BST / AVL, with animated rotations), `StringMatch` (KMP), `Grid` (DP tables), `ByteRows` (Reed-Solomon).
- [`src/viz/catalog.ts`](src/viz/catalog.ts) says which repository folders show which visualization; [`src/viz/loaders.ts`](src/viz/loaders.ts) code-splits the specs so a page only downloads what it shows.

### Adding a visualization

1. Write a tracer in `src/viz/algorithms/<name>.ts` that returns `Frame<State>[]`, with a caption on every frame that says *why* the step happens.
2. Test it against a brute-force or reference implementation in `<name>.test.ts` (see `graph.test.ts`: Dijkstra vs. Bellman-Ford on random graphs).
3. Reuse a renderer, or add one in `src/viz/renderers/`.
4. Write the spec in `src/viz/specs/` (pseudocode lines must match the `line` indices your tracer emits).
5. Register it in `catalog.ts` (with the topic folders) and `loaders.ts`. `catalog.test.ts` then runs every example and 25 random inputs through it.

---

## Keeping the TypeScript ports honest

The visualizations re-implement algorithms in TypeScript, so they are pinned to the repository implementations:

- **Brute-force differential tests** for every tracer (sorting vs. the built-in sort, KMP vs. naive search, LCS and knapsack vs. exhaustive search, AVL invariants after random operations...).
- **Golden fixtures** for Reed-Solomon: [`scripts/gen_rs_fixtures.py`](scripts/gen_rs_fixtures.py) runs the Python implementation and writes `src/viz/algorithms/__fixtures__/reed-solomon.json`; the TypeScript port must reproduce every codeword and decode result. CI regenerates the file and fails if it changes.

---

## Conventions

- **ASCII-only sources** (repository rule): write symbols as escapes in strings (`'\u221e'`), as entities in markup (`&#x2197;`) and as CSS escapes in stylesheets (`'\2713'`).
- **Colors are role tokens** (`--viz-compare`, `--viz-active`, `--viz-done`, ...) defined once in `src/styles/global.css` for light and dark. The three categorical roles were checked for color-vision-deficiency separation in both themes; status colors (match / mismatch) always come with a ✓ / ✕ glyph, and every visualization has a legend, so color never carries meaning alone.
- **No external requests**: system fonts, no CDN scripts, no analytics.

---

## Deployment

`pages.yml` builds `web/` and deploys `web/dist` to GitHub Pages at `https://snykk.github.io/dsa-playground/`. The deploy job is skipped while the repository is private. After making it public, enable **Settings → Pages → Source: GitHub Actions** once.

For a custom domain, build with `SITE_URL=https://example.com SITE_BASE=/ npm run build`.
