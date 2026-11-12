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
- A topic page shows its README unless the topic has a hand-written **article** (next section).

## Topic articles (pilot: Quick Sort)

A topic can have an article in [`src/content/articles/`](src/content/articles/) (MDX). The article replaces the README on that topic's page and is built from components instead of rendered Markdown, in the style of a GeeksforGeeks article: comprehensive, but every section short.

- **Frontmatter** (schema in [`src/lib/article.ts`](src/lib/article.ts), checked at build time): `topic` (repository folder), `title`, `lead`, `level`, `updated`, `facts` (2-6 key facts such as average / worst time), `properties` (yes/no, e.g. In-place, Stable), `prerequisites` and `related` (repository folders).
- **Components** usable in the body without an import ([`src/components/mdx.ts`](src/components/mdx.ts)): `Steps` / `Step`, `Callout`, `DataTable`, `ComplexityTable`, `Equation`, `ArrayDiagram`, `ProsCons`, `Faq` / `FaqItem`, `BigO`, `ArticleViz` (an interactive visualization) and `TopicCode` (the Python / C++ / Go sources as tabs).
- **Section order** for an algorithm: how it works, see it in action, a worked example, pseudocode, implementation, complexity analysis, variants and comparisons, advantages and disadvantages, applications, common mistakes, FAQ. Use `##` headings (they feed the "On this page" list); never horizontal rules or emoji.
- **Text in component props** is plain ASCII and goes through [`src/lib/inline.ts`](src/lib/inline.ts): `` `code` ``, `**bold**`, `n^2`, `log2(n)` and `<=` / `>=` / `!=` / `->` are typeset for you. In prose, use HTML entities (`&le;`) or `<sub>` / `<sup>`.
- Every claim must match the repository code (which partition scheme, which pivot, what the tests cover); the article is a guide to that code, not a generic text.

---

## Code structure (atomic design)

```
src/
  components/          Astro (server-rendered) site UI
    atoms/             Button, Chip, Icon, IconButton, SectionTitle, BigO, LevelMeter
    molecules/         Breadcrumbs, Card, CardGrid, StatTile, TableOfContents, ThemeToggle,
                       article blocks: Callout, Steps/Step, DataTable, ComplexityTable, Equation,
                       ArrayDiagram, ProsCons, Faq/FaqItem, FactTile
    organisms/         SiteHeader, Sidebar + NavTree, SiteFooter, Hero, TopicCards, Implementations, VizSection,
                       ArticleHeader, KeyFacts, ArticleViz, TopicCode, RelatedTopics
    templates/         BaseLayout (page shell), DocPage (README page), ArticlePage (hand-written article)
    mdx.ts             the components an article can use without importing them
  content/articles/    hand-written topic articles (MDX)
  pages/               routes only: load data, pick a template
  styles/              global CSS only: tokens, base elements, page grid, README prose, article prose
  lib/                 build-time logic: repository scan, slugs, Markdown rendering, article schema, inline text
  viz/
    ui/                React design system for visualizations
      atoms/           Cell, Token, Swatch, IconButton, NodeGlyph
      molecules/       CellRow, Strip, Legend, AlgorithmTabs, InputPanel, TransportControls, Panels
      organisms/       Player
      hooks/           usePlayback, useTween, useReducedMotion
      roles.css        role -> color mapping;  symbols.ts  UI symbols as code points
    renderers/         organisms that draw one frame (ArrayBars, GraphView, TreeView, StringMatch, Grid, ByteRows)
    algorithms/        tracers: pure TypeScript, unit-tested
    specs/             glue per visualization: parser + tracer + renderer + pseudocode
    registry/          catalog entries + loaders, one file per area
```

Rules that keep it maintainable:

- **Atoms** know nothing about algorithms or repository content. **Molecules** combine atoms into one small job (a legend, the transport bar). **Organisms** are complete sections and may know domain types. **Templates** arrange organisms into a page. **Pages** only load data and choose a template.
- **Each component owns its styles**: a scoped `<style>` in Astro components, a co-located `.css` file next to React components. Global CSS is limited to design tokens, base elements, the page grid and README prose (which arrives as raw HTML).
- **Reuse before you create**: a new renderer should be assembled from `viz/ui` atoms and molecules (`Cell`, `CellRow`, `NodeGlyph`, `Strip`, ...). Add a new atom only when no existing one fits, and keep it free of algorithm logic.
- **Responsive rules live in the component they affect** (Astro's scoped selectors outrank global ones, so a global override would silently lose).

---

## How the visualizations work

```
input text ──parse──▶ input ──trace──▶ Frame[] ──▶ Player (controls, caption, pseudocode, state)
                                         │
                                         └─ frame.state ──render──▶ renderer (SVG / HTML)
```

- A **spec** ([`src/viz/core/types.ts`](src/viz/core/types.ts)) bundles a parser, a **tracer** that records every step as a full snapshot (`Frame`), a renderer, the pseudocode and a legend. Because every frame is a snapshot, stepping backwards and scrubbing are just index changes.
- **Tracers** live in [`src/viz/algorithms/`](src/viz/algorithms/) and are plain TypeScript, so they are unit-tested without a browser.
- **Renderers** (organisms) are shared across topics and built from `viz/ui` atoms: `ArrayBars` (sorting), `GraphView` (BFS / DFS / Dijkstra), `TreeView` (BST / AVL, with animated rotations), `StringMatch` (KMP), `Grid` (DP tables), `ByteRows` (Reed-Solomon).
- [`src/viz/registry/`](src/viz/registry/) holds one file per area with its catalog entries (which repository folders show which visualization) and its loaders (code-split, so a page only downloads what it shows). [`catalog.ts`](src/viz/catalog.ts) and [`loaders.ts`](src/viz/loaders.ts) merge them.

### Adding a visualization

1. Write a tracer in `src/viz/algorithms/<name>.ts` that returns `Frame<State>[]`, with a caption on every frame that says *why* the step happens.
2. Test it against a brute-force or reference implementation in `<name>.test.ts` (see `graph.test.ts`: Dijkstra vs. Bellman-Ford on random graphs).
3. Reuse a renderer, or add one in `src/viz/renderers/` assembled from `src/viz/ui` atoms and molecules (with a co-located `.css`).
4. Write the spec in `src/viz/specs/` (pseudocode lines must match the `line` indices your tracer emits).
5. Register it in the area's file in `src/viz/registry/` (an entry with the topic folders, plus a loader). `catalog.test.ts` then runs every example and 25 random inputs through it.

---

## Keeping the TypeScript ports honest

The visualizations re-implement algorithms in TypeScript, so they are pinned to the repository implementations:

- **Brute-force differential tests** for every tracer (sorting vs. the built-in sort, KMP vs. naive search, LCS and knapsack vs. exhaustive search, AVL invariants after random operations...).
- **Golden fixtures** for Reed-Solomon: [`scripts/gen_rs_fixtures.py`](scripts/gen_rs_fixtures.py) runs the Python implementation and writes `src/viz/algorithms/__fixtures__/reed-solomon.json`; the TypeScript port must reproduce every codeword and decode result. CI regenerates the file and fails if it changes.

---

## Conventions

- **ASCII-only sources** (repository rule): use `SYM` from `src/viz/ui/symbols.ts` (or `String.fromCodePoint`) for UI symbols; otherwise write them as escapes in strings (`'\u221e'`), as entities in markup (`&#x2197;`) and as CSS escapes in stylesheets (`'\2713'`).
- **Colors are role tokens** (`--viz-compare`, `--viz-active`, `--viz-done`, ...) defined once in `src/styles/tokens.css` for light and dark. The three categorical roles were checked for color-vision-deficiency separation in both themes; status colors (match / mismatch) always come with a ✓ / ✕ glyph, and every visualization has a legend, so color never carries meaning alone.
- **No external requests**: system fonts, no CDN scripts, no analytics.

---

## Deployment

`pages.yml` builds `web/` and deploys `web/dist` to GitHub Pages at `https://snykk.github.io/dsa-playground/`. The deploy job is skipped while the repository is private. After making it public, enable **Settings → Pages → Source: GitHub Actions** once.

For a custom domain, build with `SITE_URL=https://example.com SITE_BASE=/ npm run build`.
