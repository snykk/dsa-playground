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
| `npm run build` | Static build into `web/dist/`, then the Pagefind search index into `web/dist/pagefind/` (the build also prints `[broken-link]` warnings for README links that point nowhere) |
| `npm run preview` | Serve the production build locally |
| `npm test` | Vitest unit tests (content pipeline + every visualization) |
| `npm run check` | Type-check `.astro`, `.ts` and `.tsx` files |
| `make test-web` (repo root) | Tests, type check and build in one go |

Handy URL parameters on any page with a visualization: `?step=40` opens the run at step 40, `?viz=sliding-window` opens that tab on a page with several visualizations, `?input=5+1+4` runs that input instead of the first example, and `?theme=dark` / `?theme=light` previews a theme without changing the saved preference. The player's link button copies such a link for the current moment (`?viz=sliding-window&step=7#visualize`, with `input` only when it differs from the example); [`src/viz/ui/share.ts`](src/viz/ui/share.ts) builds and reads it.

In a player, Space plays or pauses, the arrow keys step and Home / End jump; `?` (or the keyboard button in the controls) lists every shortcut. The list and the key handlers share one table in [`src/viz/ui/keys.ts`](src/viz/ui/keys.ts).

Printing a page gives the article alone, in the light theme: no header, sidebar, contents list or controls; the visualization prints its current frame with its legend and caption, the code tabs the selected language, FAQ answers open, and links that leave the site show their address. Each component keeps its own `@media print` rules.

The search box in the header (or `/` anywhere outside a field or a player) searches every page. Pagefind indexes the built pages after `astro build`: the parts marked `data-pagefind-body`, without those marked `data-pagefind-ignore`. The dialog's logic (the `/` shortcut, the arrow keys, the status line, safe excerpts) is in [`src/lib/search.ts`](src/lib/search.ts). Search needs the build: under `npm run dev` the dialog says to run `npm run build`, then `npm run preview`.

Every page has a link-preview image (`og:image`, 1200 by 630) with its title and where it sits, drawn by [`src/lib/og.ts`](src/lib/og.ts) and rasterized at build time to `/og/<page>.png`. The build also writes `sitemap-index.xml` and a `robots.txt` that points to it, both from `SITE_URL` and `SITE_BASE`.

---

## How the content works

- [`src/lib/repo.ts`](src/lib/repo.ts) walks the repository at build time. A folder with `Python/`, `C++/` or `Go/` subfolders is a **topic**; any other folder with a README (or with topics below it) is a **category**. Root `README.md`, `STUDY_GUIDE.md` and `CONTRIBUTING.md` become `/overview/`, `/study-guide/` and `/contributing/`.
- Folder names become URL slugs (`Dijkstras_Algorithm` → `dijkstras-algorithm`, `B_Plus_Tree` → `b-plus-tree`); the build fails on a slug collision.
- [`src/lib/markdown.ts`](src/lib/markdown.ts) renders READMEs with Astro's Markdown pipeline (GFM, Shiki, GitHub-compatible heading ids) and rewrites links: README → page, `Python/` → that language tab, other repo files → GitHub, missing targets → a dashed red "broken link" plus a build warning.
- A topic page shows its README unless the topic has a hand-written **article**, a category page shows its README unless the category has a hand-written **overview**, and the overview and study guide are hand-written **root pages** (next sections).

## Topic articles

A topic can have an article in [`src/content/articles/`](src/content/articles/) (MDX). The article replaces the README on that topic's page and is built from components instead of rendered Markdown, in the style of a GeeksforGeeks article: comprehensive, but every section short.

- **Frontmatter** (schema in [`src/lib/article.ts`](src/lib/article.ts), checked at build time): `topic` (repository folder), `title`, `lead`, `level`, `updated`, `facts` (2-6 key facts such as average / worst time), `properties` (yes/no, e.g. In-place, Stable), `prerequisites` and `related` (repository folders).
- **Components** usable in the body without an import ([`src/components/mdxNames.ts`](src/components/mdxNames.ts)): `Steps` / `Step`, `Callout`, `DataTable`, `ComplexityTable`, `Equation`, `ProsCons`, `Faq` / `FaqItem`, `BigO`, `ArticleViz` (an interactive visualization), `TopicCode` (the Python / C++ / Go sources as tabs) and the static diagrams `ArrayDiagram`, `TreeDiagram`, `GraphDiagram`, `ListDiagram`, `GridDiagram`. Each component file starts with a comment describing its props.
- **Diagram tones** are one letter per element (`p` primary, `l` light highlight, `r` secondary, `c` current outline, `f` final, `m` muted; see [`src/lib/diagram.ts`](src/lib/diagram.ts)), and every diagram takes a `legend` saying what each tone means in that picture.
- **Checks**: `npx vitest run src/content/articles.test.ts` compiles every article and enforces the rules below (schema, existing folders and visualizations, registered components, ASCII, no horizontal rules, an Implementation section with the code tabs).
- **Section order** for an algorithm: how it works, see it in action, a worked example, pseudocode, implementation, complexity analysis, variants and comparisons, advantages and disadvantages, applications, common mistakes, FAQ. Use `##` headings (they feed the "On this page" list); never horizontal rules or emoji.
- **Text in component props** is plain ASCII and goes through [`src/lib/inline.ts`](src/lib/inline.ts): `` `code` ``, `**bold**`, `n^2`, `log2(n)` and `<=` / `>=` / `!=` / `->` are typeset for you. In prose, use HTML entities (`&le;`) or `<sub>` / `<sup>`.
- Every claim must match the repository code (which partition scheme, which pivot, what the tests cover); the article is a guide to that code, not a generic text.

## Category overviews

A category can have an overview in [`src/content/categories/`](src/content/categories/) (MDX). It replaces the README on the category's page with the same look as an article: header, key facts, an "In this section" list of the category's topics in reading order, then a body that compares the topics instead of repeating them.

- **Frontmatter** (schema in [`src/lib/category.ts`](src/lib/category.ts)): `category` (repository folder), `title`, `lead`, `updated`, `facts` (0-6), `contents` (every sub-folder exactly once, in reading order, each with an optional one-line `note`; without one the topic's own lead is shown), `prerequisites` and `related`.
- **Checks**: `src/content/articles.test.ts` covers overviews too: the schema, a category folder, `contents` naming every sub-folder once, existing visualizations, registered components, ASCII, no horizontal rules, at least four sections, and a file named after the folder (`pattern-matching.mdx`).
- **Section order**: the problem the topics share, an at-a-glance comparison, the topics side by side (`ArticleViz` with several ids shows them as tabs), a worked example that sets them against each other, complexity, choosing one, applications, common mistakes, FAQ.

## Root pages

`/overview/` and `/study-guide/` are hand-written pages in [`src/content/pages/`](src/content/pages/) (MDX) that replace the rendering of `README.md` and `STUDY_GUIDE.md`, with the same look as a category overview. `/contributing/` still renders `CONTRIBUTING.md`.

- **Frontmatter** (schema in [`src/lib/page.ts`](src/lib/page.ts)): `page` (the document's page slug, also the file name: `overview.mdx`), `title`, `lead`, `updated`, `facts` (0-6), `contents` (the overview's list of top-level areas: every top-level folder once, in reading order) and `related`.
- **`TopicList`** lists topics in reading order, each with its area, level and whether it is visualized: `<TopicList title="Hashing" note="..." topics={['Data_Structures/Hashing/Hash_Table', ...]} />`. Every entry must be a topic folder. With JavaScript each topic gets a "done" checkbox and each list a count; `StudyProgress` shows the total at the top of the study guide. The ticks stay in the reader's browser ([`src/lib/progress.ts`](src/lib/progress.ts): localStorage key `dsa-study-progress`, `{"version":1,"done":[<topic folders>]}`); without storage they last for the visit, and without JavaScript the lists are plain lists.
- **Checks**: `src/content/articles.test.ts` covers these pages too, and fails when the study guide misses a topic or lists one twice.
- `README.md` and `STUDY_GUIDE.md` are what GitHub shows: keep them in step with the pages.

---

## Code structure (atomic design)

```
src/
  components/          Astro (server-rendered) site UI
    atoms/             Button, Chip, Icon, IconButton, SectionTitle, BigO, LevelMeter
    molecules/         Breadcrumbs, TableOfContents, ThemeToggle,
                       article blocks: Callout, Steps/Step, DataTable, ComplexityTable, Equation,
                       ArrayDiagram, ProsCons, Faq/FaqItem, FactTile
    organisms/         SiteHeader, Sidebar + NavTree, SiteFooter, Hero, VizIndex, AreaList, ChildTopics,
                       Implementations, VizSection, ArticleHeader, KeyFacts, ArticleViz, TopicCode,
                       RelatedTopics, CategoryContents, TopicList, StudyProgress
    templates/         BaseLayout (page shell), DocPage (README page), ArticlePage (hand-written article),
                       CategoryPage (hand-written category overview), RootPage (hand-written overview or study guide)
    mdx.ts             the components an article can use without importing them
  content/articles/    hand-written topic articles (MDX)
  content/categories/  hand-written category overviews (MDX)
  content/pages/       hand-written root pages: the overview and the study guide (MDX)
  pages/               routes only: load data, pick a template
  styles/              global CSS only: tokens, base elements, page grid, README prose, article prose
  lib/                 build-time logic: repository scan, slugs, Markdown rendering, article, category and page schemas, inline text;
                       progress.ts (the study guide's ticks, in the browser)
  viz/
    ui/                React design system for visualizations
      atoms/           Cell, Token, Swatch, IconButton, NodeGlyph
      molecules/       CellRow, Strip, Legend, AlgorithmTabs, InputPanel, TransportControls, Panels, ShortcutsDialog
      organisms/       Player
      hooks/           usePlayback, useTween, useReducedMotion
      roles.css        role -> color mapping;  symbols.ts  UI symbols as code points
      keys.ts          the keyboard shortcuts (handlers and the shortcut list read it)
      share.ts         step links and copying them;  scroll.ts  the tab row's scroll geometry
    renderers/         organisms that draw one frame (ArrayBars, ChainView, GraphView, TreeView, Grid, ByteRows...)
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
- **Renderers** (organisms) are shared across topics and built from `viz/ui` atoms:
  - arrays: `ArrayBars` (sorting), `SearchBars`, `ArrayScene`, `BucketScene`, `DynamicArrayView` (a block that doubles and shrinks), `ArrayTrack` (stacks and queues on a Python list), `QuickselectBars` (a three-way partition), `ReservoirView` (a stream and its reservoir);
  - linked structures: `ChainView` (nodes, pointers and named references: the linked lists, the linked stack, skip-list levels, hash buckets and their chains, the LRU and LFU lists), `RingBuffer` (the circular queue), `HeapView` (a binary heap as a tree and an array at once: the priority queue, the min heap and the max heap), `FibonacciHeapView` (the root ring and the degree table);
  - hashing: `OpenAddressingTable` (slots, tombstones and a marker that slides along the probe sequence), `BloomBitArray` (the bit array and the k positions of an item);
  - trees: `TreeView` (BST, AVL, red-black, splay, treap, Cartesian and interval trees, with rotations that glide), `MultiwayTreeView` (B-tree, B+ tree, trie, suffix tree), `SegmentTreeView` (both segment trees and the Fenwick tree), `SparseTableView`, `KdTreeView` (a 2D plane beside its tree), `ForestView` (union-find), `RopeView`, `TreeDpView` (DP on trees: each node's pair of values, filled in post-order), `HuffmanForest` (Huffman's heap above the trees it merges);
  - graphs: `GraphView` (BFS / DFS / Dijkstra, the longest path in a DAG), `GraphRepresentationView` (a graph beside how a class stores it), `FlowNetworkView` (pipes that fill with flow, residual edges and the minimum cut), `ImplicationGraphView` (2-SAT: each literal over its negation, the components and the clauses);
  - search and geometry: `BoardView` (a board beside the call stack: N-Queens, Sudoku, a maze), `PlaneView` (points, segments, lines, polygons and circles on a plane), `RootedTreeView` (a general rooted tree with chains: heavy-light and centroid decomposition), `MosView` (Mo's sorted queries and window), `LineEnvelopeView` (the convex hull trick's lines and lower envelope);
  - complexity: `GrowthChart` (operation counts against c * g(n), with n0), `MemoryView` (the call stack and the live cells, with the peak), `AmortizedView` (append costs, the accounting method's coins and the potential);
  - number theory and math: `EuclidTiling` (a rectangle tiled by squares beside the remainder table), `ResidueClock` (residues on a clock), `PowerLadder` (exponent bits, squares and products), `WitnessChains` (Miller-Rabin's witness sequences), `CongruenceCombs` (congruences as combs of candidates), `SieveGrid`, `MatrixPowerView`, `FftView` (the even/odd split and the butterflies), `FactorialTables`, `LucasDigits` (n and r in base p), `SpfGrid` (smallest prime factors);
  - patterns and contest techniques: `PatternLanes` (meet in the middle, DP on one or two rows, ranks), `BitRows`, `MaskRows` (submask enumeration), `SubsetLattice` (SOS DP), `CompressionPlane`, `VennView` (inclusion-exclusion), `PrefixGrid2D`, `LcaLifting` (binary lifting's jumps beside the tree), `IoStream` (input bytes, a reader's buffer and the calls it makes), `ZigzagView`, `HavelHakimiView`, `NimView`, `GrundyView`, `GameGraphView`, `JudgeView` (a judge answering a solver's queries);
  - tables and text: `Grid` (DP tables), `DpTableView` (bitmask and digit DP tables), `StrassenView` (the quadrants and the seven products), `GridMap`, `IntervalTimeline`, `JobSlots` (jobs dropped into deadline slots), `KnapsackFill`, `StringMatch` (KMP), `StringScan`, `StringOpsView` (string operations), `AhoCorasickView` (a trie with failure and output links over the text), `SuffixArrayView` (the sorted suffixes and the binary searches), `ByteRows` (Reed-Solomon), `FieldBits` (GF(2^8) bytes as bits beside the ring of powers of 3).
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
- **Golden fixtures**: each `scripts/gen_<area>_fixtures.py` runs the repository's Python implementation on fixed inputs and writes `src/viz/algorithms/__fixtures__/<area>.json`, for example every Reed-Solomon codeword ([`gen_rs_fixtures.py`](scripts/gen_rs_fixtures.py)), the state of a list, stack, queue, rope, hash table, cache, tree or heap after every operation, or the MD5 positions of the Bloom filter. The TypeScript ports must reproduce every value. CI regenerates every file and fails if one changes.

---

## Conventions

- **ASCII-only sources** (repository rule): use `SYM` from `src/viz/ui/symbols.ts` (or `String.fromCodePoint`) for UI symbols; otherwise write them as escapes in strings (`'\u221e'`), as entities in markup (`&#x2197;`) and as CSS escapes in stylesheets (`'\2713'`).
- **Colors are role tokens** (`--viz-compare`, `--viz-active`, `--viz-done`, ...) defined once in `src/styles/tokens.css` for light and dark. The three categorical roles were checked for color-vision-deficiency separation in both themes; status colors (match / mismatch) always come with a ✓ / ✕ glyph, and every visualization has a legend, so color never carries meaning alone.
- **Text keeps 4.5:1 in both themes**: text on a role fill uses `--viz-ink-on-fill` and text in a role's colour uses `--role-text`, both set per role in `src/viz/ui/roles.css`; page text in the accent colour uses `--accent-text`. Measure a new colour pair in both themes before using it. Code blocks use Shiki's github themes with their two faint token colours replaced ([`src/lib/codeColors.ts`](src/lib/codeColors.ts)).
- **No external requests**: the fonts and the search index are served with the site; no CDN scripts, no analytics.

---

## Deployment

`pages.yml` builds `web/` and deploys `web/dist` to GitHub Pages at `https://snykk.github.io/dsa-playground/`. The deploy job is skipped while the repository is private. After making it public, enable **Settings → Pages → Source: GitHub Actions** once.

For a custom domain, build with `SITE_URL=https://example.com SITE_BASE=/ npm run build`.
