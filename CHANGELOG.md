# Changelog

All notable changes to this repository, newest first. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/): each release groups its changes under Added, Changed, Removed and Fixed, in that order. Versions follow [Semantic Versioning](https://semver.org/) with a `v` prefix.

Each version is an annotated git tag on `master`. When it is pushed, the release workflow publishes that version's section below as its GitHub Release notes; RELEASING.md describes the flow.

## Versioning guide

Before v1.0.0:

- **MINOR** (`v0.3.0`): new topics, visualizations or site features.
- **PATCH** (`v0.3.1`): fixes only, in the code, the tests, the documents or the site.

## Unreleased

Changes on `master` that are not in a release yet.

## [v0.10.0] - 2026-11-25

Ten new topics on number theory, algebra, sorting and dynamic programming, and article text that fills the column.

### Added

- **Ten new topics, bringing the repository to 169.** Each has Python, C++ and Go code with tests (the C++ and Go tests pin outputs computed by the Python code), READMEs, an article with checked practice problems, and a visualization whose tracer is pinned to the Python code by golden fixtures (fourteen new visualizations, 213 in all):
  - **Euler's Totient**: phi(n) by factorization in O(sqrt n), phi of every number up to n with the linear sieve, which crosses out each composite once, and the modular inverse by Euler's theorem. ([8897bcc](https://github.com/snykk/dsa-playground/commit/8897bcc0d44d3abc36c977c681e3670b55be3827), [2d80f45](https://github.com/snykk/dsa-playground/commit/2d80f457052b8f90e63cac09fa31a0574fbbc8d1))
  - **Combinatorics**: binomial coefficients by Pascal's triangle, by the multiplicative formula and modulo a prime from factorial tables with one inverse; Catalan numbers, stars and bars, and derangements, with the 64-bit limits of each. ([c2099b6](https://github.com/snykk/dsa-playground/commit/c2099b6f0954c1499e11fc79bc462cae4ace3d54))
  - **Number Theoretic Transform**: the FFT's butterflies modulo 998244353, iterative and in place, with polynomial products exact modulo the prime, and measurements of where the floating-point FFT starts to round wrongly. ([c25a081](https://github.com/snykk/dsa-playground/commit/c25a0816641d967e5fb9814eb362292c05206be0))
  - **Gaussian Elimination**: solving `A x = b` with partial pivoting in floating point and exactly modulo a prime, telling apart no solution, one and infinitely many, with the rank and the determinant. ([cba694a](https://github.com/snykk/dsa-playground/commit/cba694a160eb4128c60cab8514bcf683414047a1))
  - **Shell Sort**: insertion sort over shrinking gaps with Shell's, Knuth's and Ciura's sequences, and the comparisons each one makes. ([a61f8ee](https://github.com/snykk/dsa-playground/commit/a61f8eef01258f77cf21f2d731e4348b89ce2e93))
  - **Timsort**: natural runs, minrun, binary insertion, the merge stack with the 2015 four-run check, and galloping, following CPython's `list.sort()`; its comparison counts equal CPython 3.9's on the inputs tested. ([75ca527](https://github.com/snykk/dsa-playground/commit/75ca527e0b10b9d62495094560bf809a28063202))
  - **Unbounded Knapsack**: one row filled upward, the only difference from the 0/1 knapsack, with an optimal multiset read back and the two counts that show how the loop order decides what Coin Change counts. ([be2fe8f](https://github.com/snykk/dsa-playground/commit/be2fe8fbdcafdd2b4462acc06e4e388af5f4243a))
  - **Interval DP**: tables over ranges filled by length, on merging piles, bursting balloons and the fewest palindrome cuts. ([9ae9865](https://github.com/snykk/dsa-playground/commit/9ae986532d7f19bfc87778ad26c709d6dbb2a1f0))
  - **Knuth Optimization**: interval DP in O(n^2) instead of O(n^3) when the best split moves one way, on merging piles and the optimal binary search tree, with the splits tried counted. ([62590d9](https://github.com/snykk/dsa-playground/commit/62590d9c910dd02dc26b51259a50327fd1b3d7c1))
  - **Divide and Conquer Optimization**: a layered DP in O(k n log n) instead of O(k n^2) when the best split is monotone, on splitting an array into k groups, with a cost that breaks the condition. ([26f2494](https://github.com/snykk/dsa-playground/commit/26f2494691e814e70c18dd470c93dfef087d7be6))

### Changed

- **The topic lists, overviews and the study guide include the new topics.** Pages that called a new topic missing or not implemented now link to it: the Sieve of Eratosthenes (the linear sieve), Insertion Sort and Merge Sort (binary insertion and natural runs), and the Fast Fourier Transform (the NTT). Matrix Chain Multiplication, 0/1 Knapsack, Coin Change, the Convex Hull Trick, Matrix Exponentiation and Strassen's Matrix Multiplication link to their new neighbours. ([72e770e](https://github.com/snykk/dsa-playground/commit/72e770e428c7a2d26f438bab246252c4e3aafa80), [8897bcc](https://github.com/snykk/dsa-playground/commit/8897bcc0d44d3abc36c977c681e3670b55be3827), [a61f8ee](https://github.com/snykk/dsa-playground/commit/a61f8eef01258f77cf21f2d731e4348b89ce2e93), [75ca527](https://github.com/snykk/dsa-playground/commit/75ca527e0b10b9d62495094560bf809a28063202), [c25a081](https://github.com/snykk/dsa-playground/commit/c25a0816641d967e5fb9814eb362292c05206be0), [be2fe8f](https://github.com/snykk/dsa-playground/commit/be2fe8fbdcafdd2b4462acc06e4e388af5f4243a), [9ae9865](https://github.com/snykk/dsa-playground/commit/9ae986532d7f19bfc87778ad26c709d6dbb2a1f0), [26f2494](https://github.com/snykk/dsa-playground/commit/26f2494691e814e70c18dd470c93dfef087d7be6), [62590d9](https://github.com/snykk/dsa-playground/commit/62590d9c910dd02dc26b51259a50327fd1b3d7c1), [cba694a](https://github.com/snykk/dsa-playground/commit/cba694a160eb4128c60cab8514bcf683414047a1))

### Fixed

- **Article text stopped at about 70% of the column on wide screens**, while tables and visualizations took all of it. Running text now has the column's width, up to about 90 characters a line; phone widths are unchanged. ([0f3946a](https://github.com/snykk/dsa-playground/commit/0f3946a10d5ce1caf63e7dccca68df890a242322))

## [v0.9.0] - 2026-11-24

Six new topics on graphs, trees and strings, a complete Fibonacci heap, and a player that keeps keyboard focus.

### Added

- **Six new topics, bringing the repository to 159.** Each has Python, C++ and Go code with tests (the C++ and Go tests pin outputs computed by the Python code), READMEs, an article with checked practice problems, and a visualization whose tracer is pinned to the Python code by golden fixtures (eight new visualizations, 199 in all):
  - **Bipartite Matching**: Kuhn's augmenting paths in O(V E) and Hopcroft-Karp in O(E sqrt(V)), with a minimum vertex cover read off the matching (Konig's theorem). ([ad4c202](https://github.com/snykk/dsa-playground/commit/ad4c20273a91b2052f79fa18e8d2a7eb49881a4a))
  - **Dinic's Algorithm**: level graphs and blocking flows with a current-arc pointer, O(V^2 E), with the flow on every edge and the minimum cut. ([dee7901](https://github.com/snykk/dsa-playground/commit/dee790124004a7ab2d6e42f8f9be322c270e7b40))
  - **Eulerian Path and Circuit**: when one exists in directed and undirected graphs, and Hierholzer's algorithm with an explicit stack in O(V + E). ([fc02652](https://github.com/snykk/dsa-playground/commit/fc026521a2b7c593c4caec180d833085c30e793d))
  - **0-1 BFS**: shortest paths with weights 0 and 1 on a deque in O(V + E), with paths and a grid example. ([48edb25](https://github.com/snykk/dsa-playground/commit/48edb25c5f6c1276dc01843a457119d002cfece5))
  - **Lowest Common Ancestor**: binary lifting and the Euler tour with a sparse table, with distances and k-th ancestors. ([72ed855](https://github.com/snykk/dsa-playground/commit/72ed855591cc3c3bf06277bc03141c4928700d5e))
  - **String Hashing**: prefix hashes and double hashing, substring equality, the longest common prefix and comparison by binary search, distinct substrings, the probability of a collision, and the Thue-Morse strings that break hashing modulo 2^64. ([4f7b58f](https://github.com/snykk/dsa-playground/commit/4f7b58f46f4943915d12acec7b4e2746fe3232ed))
- **The Fibonacci heap's decrease-key, delete and merge**, in all three languages: insert returns a handle, decrease-key cuts and walks up the marked ancestors (cascading cuts) in O(1) amortized, and a stale handle is rejected. The article shows a Dijkstra that calls decrease-key, and the visualization shows cuts, marks, delete and merge. ([4ee2bca](https://github.com/snykk/dsa-playground/commit/4ee2bca2b5800dbd65541787aa9109d82306de1e))

### Changed

- **The topic lists, overviews and the study guide include the new topics**, and the Edmonds-Karp pages point to Dinic's algorithm instead of calling it missing. ([0bf1a6c](https://github.com/snykk/dsa-playground/commit/0bf1a6c463808c5442fd41e2e2ada912e5bbf0e0), [dee7901](https://github.com/snykk/dsa-playground/commit/dee790124004a7ab2d6e42f8f9be322c270e7b40))
- **The home page's demo has a soft glow of the accent behind it**, faint on paper and visible in the dark theme. ([3e876e4](https://github.com/snykk/dsa-playground/commit/3e876e41f05c4add1665cf15d4b3aa31d22b9d13))
- **Changelog entries link the commits that made them**, from this version on, and each version's footer link opens its compare view. ([1643947](https://github.com/snykk/dsa-playground/commit/1643947ad8afe15df127dae4053bf11dbf03a89b))

### Fixed

- **The player kept keyboard focus only until the last step.** Next and Last disabled themselves there and dropped focus to the page; they now stay focusable, are announced as unavailable, and ignore presses. ([d520199](https://github.com/snykk/dsa-playground/commit/d5201997b222374428b089616e0e260720ee5aec))
- **The wide pictures of the optimization visualizations** (Precomputation and the others drawn in the same frame) could not be scrolled from the keyboard at phone width; they take a tab stop while they overflow. ([72ed855](https://github.com/snykk/dsa-playground/commit/72ed855591cc3c3bf06277bc03141c4928700d5e))

## [v0.8.1] - 2026-11-22

A Code of Conduct, a security policy, a README that shows what the site offers, and workflows on Node 24.

### Added

- **A Code of Conduct** (`CODE_OF_CONDUCT.md`): the Contributor Covenant 2.1, with the address to report a violation to. CONTRIBUTING.md and the README point to it.
- **A security policy** (`SECURITY.md`): which versions get fixes, how to report a vulnerability privately (GitHub's private vulnerability reporting, or email), what happens after a report, and what is in and out of scope. The issue chooser links to the private form, and the bug report form says not to report security problems there.

### Changed

- **The workflows use the Node 24 releases of GitHub's actions** (checkout, setup-python, setup-go and setup-node v7, upload-pages-artifact and deploy-pages v5), so jobs no longer warn that Node.js 20 is deprecated. The site is still built with Node 22.
- **The README** points to the practice problems at the end of the articles, the site's search and the study guide's ticks; shows how to run one topic's tests in each language; says how the explanations were checked against the code; and has a latest-release badge.

## [v0.8.0] - 2026-11-22

Site search, practice problems on every article, link previews, conveniences in the player and the study guide, an accessibility pass, and documents for contributors.

### Added

- **Site search**: Pagefind 1.6.0 indexes the built site (210 pages; the index loads only when a search starts). The search button in the header, or `/` anywhere outside a field or the player, opens the dialog; results show where a page sits and its matching text, and the arrow keys and Enter pick one. Only the article text is indexed: the player, the code tabs, breadcrumbs and lists of related pages are left out.
- **Practice problems on 151 articles**: three to five problems each, from easy to harder, on LeetCode, CSES, Codeforces, AtCoder, Kattis and SPOJ, each with a sentence on what of the topic it exercises. Every problem was checked on its judge (the number, the title, and that it is not premium); premium-only problems gave way to free ones, and problems that do not practise their topic were dropped. The topic READMEs list the same problems. Galois Field and Reed-Solomon have none, since no judge has a problem that practises them. A test fails when an article lacks the section, has two, or lists a problem twice, and the build fails on a problem with an empty field, a link that is not https, or an unknown judge.
- **A weekly check of the practice links** (`scripts/check_practice_links.py`, run by `.github/workflows/practice-links.yml` on Mondays or by hand): it asks each judge whether every problem still exists under its name and number and is free, and fails only on a definite problem. SPOJ refuses scripts, so its problems are listed as unchecked.
- **Link-preview images**: every page has its own 1200 by 630 card with its title and where it sits, drawn at build time with the site's own fonts; the `og:` and `twitter:` tags point to it.
- **A sitemap and `robots.txt`**, generated from `SITE_URL` and `SITE_BASE`; the 404 page is left out of the sitemap.
- **In the player**:
  - on a phone, the algorithm tabs are one row that scrolls sideways and keeps the selected tab in view; the tabs follow the ARIA tabs pattern;
  - `?` or a keyboard button lists every shortcut, from the same table the key handler reads;
  - a link button copies a link to the current step, with the input when it is not the first example; old `?step=N` links still work.
- **Progress in the study guide**: each topic in its lists gets a checkbox, each list a count, and the top of the page the total with a button that clears it. The ticks stay in the reader's browser.
- **Print styles**: a page prints in the light theme with the article alone; the player prints its current frame with its legend and caption, the code its selected language, FAQ answers open, and links that leave the site show their address.
- **A picture of the site in the README**, in the light and the dark theme.
- **Issue forms** for a bug, a content error and a topic request, and a pull request template.

### Changed

- **CONTRIBUTING has one "Adding a Topic" checklist**, in the order a contributor works, each item naming the check or the command that enforces it. It replaces the two older checklists and the issue templates that were written in the document.
- **Colours**: the muted text is a shade darker in the light theme and lighter in the dark one, the light compare, active and done fills are a shade deeper, and text on the bright orange and green fills is dark instead of white.
- **The sidebar's category rows**: the chevron is a toggle of its own, 24 px wide, beside the link to the category.
- **The body font is preloaded**, so text no longer reflows when it arrives (layout shift on the contributing page at phone size went from 0.144 to 0).

### Fixed

- **Accessibility, against WCAG 2.2 AA**: axe-core finds no violation on the audited pages (home, overview, study guide, visualizations, 404, a category, two articles, a document page, and the open search and shortcut dialogs) at 390 and 1300 px in both themes, where it found up to 169 failing elements per page before. Lighthouse's accessibility score is 100 in all 18 runs, from 87 to 100 before. Among the fixes:
  - text contrast of page text, code token colours and visualization labels; in all 193 players, 23,024 text samples were under the minimum before and 24 after;
  - the sidebar's category links sat inside a `<summary>`, where they were not exposed as links;
  - the closed phone menu's links took focus off screen;
  - search results were options holding links hidden from assistive technology;
  - wide tables, diagrams and pseudocode could not be scrolled from the keyboard;
  - the player's caption was announced at every frame while it played;
  - links that open a new tab did not say so, and README task-list checkboxes had no name;
  - small targets (the sidebar toggles, the study guide checkboxes) and a header that did not fit at 320 px.
- **Keys pressed with Ctrl, Cmd or Alt** reached the player, so Alt+Left did not go back.

## [v0.7.1] - 2026-11-21

An accuracy audit of every topic, the Job Scheduling rules C++ and Go were missing, and maintenance.

### Added

- **Job Scheduling's earliest-deadline-first and Smith's rules in C++ and Go**, which had only the deadline rule. They keep Python's order for equal keys and its handling of a zero processing time, and their tests pin outputs computed by the Python code.
- **A golden fixture for the LCS traceback**, pinning the visualization's subsequence to `lcs_sequence` on 66 pairs.

### Changed

- **CI runs on `ubuntu-26.04`**, the image of the last green run, instead of the moving `ubuntu-latest`; six graph Go modules that asked for Go 1.25 ask for 1.24, the version CI installs.
- **Fourteen slow tests** check the same conditions in plain code and assert once per run; most take tens of milliseconds instead of more than a second.
- **GraphView places weights, badges and marks** clear of edges, arrowheads and other labels, checked by a new test.

### Fixed

- **About 400 statements in the articles, overviews, READMEs and docstrings** that the code contradicted. An audit ran the code behind 3,654 claims across all 153 topics: worked examples and traces, behaviour, complexity, API names, cross-language claims and the visualization sections. Among them: probe counts in the searches, Quick Sort's comparison count, the Bellman-Ford trace, the space of Dijkstra, Kosaraju, Kruskal and Prim, the order of strongly connected components, resize copies under 2n, `clear` costing O(capacity), the cost of the suffix array and of the FFT, backtracking's worst cases, and Go's 64-bit `int`.
- **Code bugs**, each with a regression test that fails before the fix:
  - Interpolation Search crashed on very large float keys in Python and C++;
  - the Go FFT's `MultiplyPolynomials` panicked on empty input;
  - GF(2^8) `pow` and Reed-Solomon's first consecutive root overflowed `int` in C++ and Go;
  - the Miller-Rabin visualization accepted 25 digits where its help says 24.
- **The LCS visualization** broke ties the other way from `lcs_sequence`, so on ABCBDAB and BDCABA it showed BCAB while the code returns BDAB.
- **Visualization details**: Bellman-Ford's "Needs later rounds" example settled in one round, the radix and bucket sort legends left out a use of blue, two example labels named things that do not exist, and the complexity notes of N-Queens, the suffix array and the recursive matrix power were wrong.
- **Job Scheduling's time bound** gains "+ D": creating the D + 1 slots costs O(D).

## [v0.7.0] - 2026-11-17

Visualizations for the last 26 topics: complexity analysis, number theory, advanced math, the remaining problem patterns and the competitive programming utilities. Every topic now has one.

### Added

- **55 visualizations for 26 topics**, bringing the site to 191 visualizations; every one of the 153 topics now has at least one:
  - complexity: Big-O, Big-Omega and Big-Theta as growth charts that count the operations of the repository's own example functions (nothing is timed), space complexity as the call stack and the live cells with their peak, and amortized analysis by the aggregate, accounting and potential methods, with the binary counter;
  - number theory: Euclid's algorithm as a rectangle tiled by squares with the extended coefficients, modular arithmetic on a clock of residues, modular exponentiation, Miller-Rabin with seeded witnesses drawn as Python draws them, the Chinese remainder theorem as merging combs, and the sieve;
  - advanced math: matrix exponentiation, iterative and recursive, and the FFT with polynomial multiplication;
  - problem patterns: meet in the middle, bit manipulation and subset generation, the 0/1 knapsack and LCS on rolling rows, coordinate compression in one and two dimensions, number of islands, BFS shortest path, DFS with an explicit stack, Kahn's topological sort, and inclusion-exclusion on a Venn diagram;
  - contest techniques: factorial tables, the smallest-prime-factor sieve, 2D prefix sums and LCA by binary lifting; submask enumeration and SOS DP; fast I/O, counting calls into stdin and stdout; Lucas's theorem; a zigzag permutation, Havel-Hakimi and the northwest-corner rule; Nim, Grundy numbers and the win/lose labelling of a game graph; and interactive problems against a simulated judge that counts the queries.
- **Two groups on the Visualizations page**: Complexity, first, as in the study guide, and Competitive Programming, last.
- **Renderers for them**: growth charts, memory over time, amortized costs, a residue clock, witness chains, congruence combs, a sieve grid, matrix powers, FFT butterflies, factorial and smallest-prime-factor tables, Lucas's base-p digits, bit and mask rows, a subset lattice, a Venn diagram, a compressed plane, a 2D prefix grid, binary lifting, an input stream with its buffer, Nim piles, Grundy values, a game graph and a judge's transcript.
- **Side-by-side tabs** on the overviews of Time Complexity, Complexity Analysis, Number Theory, Advanced Math, Optimization Techniques and Problem Types; the Problem Patterns tabs include the new patterns.
- **Golden fixtures for the new visualizations**: five generators run the Python implementations, and the TypeScript ports must reproduce every result. FFT values are compared rounded, since sine and cosine may differ in the last bit between JavaScript and Python.
- **Draws of any size** in the port of CPython's random: `randrange(start, stop)` and draws of more than 32 bits, as Miller-Rabin's `randrange(2, n - 1)` needs.
- **Regression tests** for the amortized analysis demos fixed in v0.2.0.

### Changed

- **Every topic has a visualization**, so the "visualized" markers on the study guide, the category contents, the home page's area list and the overview headers are gone; they come back if a topic without one is added. The home page, the overview and the study guide say that every topic runs step by step.
- **The README** says the site animates every topic.
- **Tests** may run for 20 s, so a busy machine or a two-core CI runner does not fail a slow but correct random check; the slowest random checks now assert once per run and take milliseconds.

### Fixed

- **`count_divisible`** in Python returned a negative count for n below 1, -4 for n = -10 and the divisor 3. It returns 0, as C++ and Go already did, and each language has a regression test.
- **The spacing of an article's lists** no longer reaches the lists of the components inside it: the player's legend and pseudocode, the diagram legends, the complexity cases, pros and cons and the study guide's rows.
- **The player's panel titles** are set in sentence case like every other label.
- **Documents that described what the code does not do**: the Matrix Exponentiation README's A^11 trace, the Interactive Problems bound (at most floor(log2 n) queries), the Miller-Rabin article's sequence for 561, two Python test docstrings about the bounds of quick sort and binary search, and what Python raises at the end of input in the Fast I/O article.

## [v0.6.0] - 2026-11-15

Visualizations for advanced dynamic programming, advanced strings, network flow, 2-SAT, Huffman coding, job scheduling and the Galois field; C++ and Go ports for the five topics that only had Python; and a new design for the site.

### Added

- **18 visualizations for 15 topics**, bringing the site to 136 visualizations covering 127 of the 153 topics:
  - advanced DP: bitmask DP (the traveling salesman table), digit DP with its memo and call stack, DP on trees (independent set and path sum), the longest path in a DAG, and the convex hull trick's lower envelope;
  - advanced strings: Aho-Corasick (the trie, its failure and output links, then the scan), the longest common substring, Manacher's algorithm and the suffix array with its searches;
  - graphs: Ford-Fulkerson and Edmonds-Karp on the same networks, ending at the minimum cut, and 2-SAT on its implication graph;
  - greedy and coding theory: Huffman coding move for move with Python's heap, job scheduling by all three of its rules, and arithmetic in the Galois field GF(2^8).
- **C++ and Go ports** of bitmask DP, DP on graphs, DP on trees, digit DP and Huffman coding, which held only a stub before. Their tests pin outputs computed by the Python code, and Huffman gives the same code table as Python, ties included.
- **Renderers for them**: a DP table for masks and digits, a tree that carries a pair of values per node, a lower envelope of lines, a trie with failure and output links, sorted suffixes, a flow network whose pipes fill, an implication graph, a Huffman forest under its heap, deadline slots, and bytes as bits beside the ring of powers of 3.
- **Side-by-side tabs** on the Advanced DP, Advanced String and Network Flow overviews; 2-SAT joins the Advanced Graph tabs, Huffman coding and job scheduling the Greedy tabs, and the Galois field the Coding Theory tabs.
- **Golden fixtures for the new visualizations**: four generators run the Python implementations, and the TypeScript ports must reproduce every result.
- **A regression test** for the convex hull trick's constant-time pop from the front of its deque.

### Changed

- **The site's design**: a cool paper palette, Atkinson Hyperlegible Next and JetBrains Mono (self-hosted), visualizations on a graph-paper stage, and text at a reading measure. The home page opens with a short pitch and a running visualization, then the steps to study a topic, the visualizations by area and the repository's areas. Lists of topics, related topics, FAQs, complexity cases and pros and cons read as lists and sheets instead of grids of cards; the code tabs sit on the page; the Visualizations page is an index by area.
- **Wide displays**: the page spans the window, with the sidebar and the contents list at its edges, instead of floating in a centred box.
- **The README** counts the 127 topics the site animates.

### Removed

- **The card grid components** (Card, CardGrid, StatTile), which nothing used after the redesign.

### Fixed

- **Opening a FAQ answer** no longer makes the sidebar and the contents list jump at the end of a page: the footer sits in the content column, so the sticky columns are never pushed.
- **A README-only category with no topics**, such as Templates, no longer says "0 topics".
- **Documents that called the C++ and Go code of five topics placeholders**, in the articles, the overviews, the READMEs and the overview page.
- **The Ford-Fulkerson article**: its DFS takes the diamond's cross edge first only when that edge is inserted before `1->3` (4 rounds); otherwise it takes 2.
- **The Galois field's `pow` documentation** in Python and Go: a negative exponent is reduced modulo 255; the code never calls `inv` first.

## [v0.5.0] - 2026-11-15

Visualizations for backtracking, computational geometry, the specialized decompositions, Strassen's algorithm and the randomized algorithms.

### Added

- **17 visualizations for 16 topics**, bringing the site to 118 visualizations covering 112 of the 153 topics:
  - backtracking: N-Queens, the Sudoku solver, rat in a maze and graph coloring, each board or graph drawn beside the call stack;
  - geometry: points, lines and circles, segment intersection, the convex hull by Graham's scan and by Jarvis's march, rotating calipers and the closest pair of points;
  - specialized techniques: square root decomposition, Mo's algorithm, heavy-light decomposition and centroid decomposition;
  - Strassen's matrix multiplication, randomized quickselect and reservoir sampling.
- **Reproducible randomness**: the randomized visualizations draw from a port of CPython's `random.Random`, so a seed reproduces Python's choices exactly.
- **Renderers for them**: a board beside the call stack, a coordinate plane for points, segments, polygons and circles, a general rooted tree with its chains, Mo's sorted queries, Strassen's quadrants and seven products, a three-way partition, and a stream with its reservoir.
- **A cutoff parameter for Strassen's algorithm** in all three languages, 64 by default, so a small matrix can be split into the seven products.
- **Side-by-side tabs on the overviews** of Backtracking, Computational Geometry, Basic and Advanced Geometry, Specialized Techniques and Randomized Algorithms.
- **Golden fixtures for the new visualizations**: four generators run the Python implementations, and the TypeScript ports must reproduce every result.

### Changed

- **The README** counts the 112 topics the site animates.

### Fixed

- **The convex hull's documentation**: a set of fewer than three distinct points comes back sorted, not as it was given, and a test in each language pins the order.
- **Two descriptions of the code**: the closest pair sorts its points on x alone, and the Python Strassen code multiplies a 2 x 2 with the naive loop unless its cutoff is lowered.

## [v0.4.0] - 2026-11-14

Visualizations for every tree, heap and graph representation in the repository.

### Added

- **23 visualizations for 23 topics**, bringing the site to 101 visualizations covering 96 of the 153 topics:
  - binary and balanced trees: the binary tree's traversals, the red-black tree, the splay tree, the treap, the Cartesian tree and the interval tree;
  - multiway and string trees: the B-tree, the B+ tree, the trie and the suffix tree;
  - range queries and space: the segment tree, the lazy segment tree, the Fenwick tree, the sparse table and the K-D tree;
  - heaps: the min heap, the max heap and the Fibonacci heap;
  - graph representations: the adjacency list, the adjacency matrix, the edge list, directed and undirected graphs, and weighted and unweighted graphs.
- **Renderers for them**: nodes that hold several keys, with labelled edges; segment trees drawn over their ranges; a sparse table; a K-D tree beside its 2D plane; a Fibonacci heap's root ring and degree table; and a graph beside how a class stores it. The binary tree renderer gains labels, colours and trees side by side, and draws the BST and AVL tree exactly as before.
- **Side-by-side tabs on the overviews**: six search trees on the Trees overview, and every heap and graph representation on the Heaps and Graph overviews.
- **Golden fixtures for the new visualizations**: four generators run the Python implementations, and the TypeScript ports must reproduce every result.
- **A copy check for the C++ interval tree**: its test asserts at compile time that the class, which owns raw memory, cannot be copied.

### Changed

- **The red-black tree's README and docstring** say that `height()` counts nodes, as the code does.
- **The README** counts the 96 topics the site animates.

### Removed

- **The dot in the sidebar** next to every visualized topic, which cluttered the navigation.

### Fixed

- **A lazy segment tree over an empty array**: a range such as `[-1, 0]` read node 1 of an empty tree, raising IndexError in Python, writing out of bounds in C++ and panicking in Go. It now returns at once in all three languages.
- **Fibonacci heap ties**: with equal keys, the C++ and Go heaps could pick a different minimum from Python, and Go a different one on every run. Both now follow Python's order.
- **Three article statements**: the splay tree's zig-zag example, the weighted graph's total weight, which is the float `22.0`, and a self-loop, which is stored once.

## [v0.3.0] - 2026-11-14

Visualizations for every linear structure, hashing topic and cache, and the overview and study guide as articles.

### Added

- **25 visualizations for 21 topics**, bringing the site to 78 visualizations covering 73 of the 153 topics:
  - the dynamic array, the singly, doubly and circular linked lists, and the skip list;
  - the static, dynamic and linked-list stacks, the simple and circular queues, the deque, and the priority queue drawn as a heap;
  - string basics, string manipulation and the rope;
  - the hash table and hash set, collision handling with chaining, linear and quadratic probing, the Bloom filter, and the LRU and LFU caches.
- **Renderers for them**: linked nodes with their pointers and named references, a ring buffer, a heap drawn as a tree and an array at once, a rope, an open-addressing table and a Bloom filter's bit array.
- **Golden fixtures for the new visualizations**: four generators run the Python implementations, and the TypeScript ports must reproduce every result.
- **The overview and the study guide as hand-written pages**, at `/overview/` and `/study-guide/`. The study guide lists every topic by phase, with its level and whether it is visualized.
- **Tests that keep the pages honest**: the study guide must list every topic once, in the order of `STUDY_GUIDE.md`, and the visualization catalog must register exactly the pages that embed each visualization.
- **Copy checks for the C++ stacks and circular queue**: their tests assert at compile time that these classes, which own raw memory, cannot be copied.

### Changed

- **Area overviews are marked as visualized**: twelve overviews that embed visualizations were not registered for them, so the navigation marked Sorting but not Searching. All are registered now.
- **The README** counts the 73 topics the site animates.
- **The dynamic array stack's README** says that CPython's list shrinks on pop, unlike the C++ and Go versions.

### Fixed

- **Pages fit a phone screen**: at a width of 390px, more than twenty pages scrolled sideways, because wide array diagrams and long key facts were wider than the page.
- **The home page and the footer**: the home page no longer says that every topic has a visualization, and the footer no longer says that the content comes from the READMEs.

## [v0.2.0] - 2026-11-13

A web site for the repository, an article for every topic and area, and one name and one home for every topic.

### Added

- **The web site** (`web/`, Astro), deployed to GitHub Pages once the repository is public:
  - a hand-written article for each of the 153 topics, and an overview for each of the 50 areas that group topics;
  - the Python, C++ and Go sources of every topic as tabs;
  - 53 interactive visualizations covering 52 topics, whose TypeScript ports are checked against the Python code with golden fixtures.
- **Galois Field and erasure decoding**: a GF(2^8) arithmetic topic, and Reed-Solomon decoders that take erasures and a first consecutive root, in all three languages.
- **Release tooling**: RELEASING.md, this changelog, and a workflow that publishes a GitHub Release for each version tag.
- **CI on release branches and pull requests**, with a time limit on every job, the C++ tests under AddressSanitizer and UndefinedBehaviorSanitizer, a check of every README, and a build that fails on a broken link.

### Changed

- **One naming convention**: every content folder is named in ASCII `Title_Case_With_Underscores`.
- **One home per topic**: Suffix Array, Pattern Matching, Union-Find and Hash Map are one topic each, MST lives under Graph Algorithms and Closest Pair under Geometry.
- **READMEs rewritten to templates**: every topic, language and category README, without emoji; the root README, the study guide and CONTRIBUTING describe the repository as it is.
- **The complexity topics** teach O, Omega and Theta as bounds, not as best, average and worst cases.

### Removed

- **Folders that only pointed at a topic elsewhere**, and the duplicates merged above. With those merges and the new Galois Field topic, the repository has 153 topics, where v0.1.0 had 155.

### Fixed

- **Bugs in all three languages across the topics**, among them the B-Tree, splay and treap deletes, network flow capacities, FFT, extended gcd and 64-bit modular products, convex hulls and segment intersection, Bloom filter sizing, open addressing, and lists deleting their only node.
- **The Python tests no longer hang**: a splay tree search miss looped forever. Every Python and C++ test now runs under a time limit, and the test runners report a timeout as a timeout.
- **C++ geometry on GCC**: each cross-product term is rounded on its own, so a fused multiply-add cannot break a collinear test.

## [v0.1.0] - 2026-11-12

Data structures and algorithms implemented in Python, C++ and Go.

### Added

- **155 topics**, each with a README and an implementation plus unit tests in all three languages:
  - data structures (50): linear, trees, heaps, graphs, hashing, advanced structures;
  - algorithms (80): sorting, searching, dynamic programming, graphs, strings, math, greedy, geometry, divide and conquer, randomized, backtracking, specialized techniques;
  - problem patterns (13), complexity analysis (5), competitive programming utilities (7).
- **`make test`** runs the Python, C++ and Go suites, and GitHub Actions CI runs them on every push.
- **STUDY_GUIDE.md**: a structured learning path.

[v0.10.0]: https://github.com/snykk/dsa-playground/compare/v0.9.0...v0.10.0
[v0.9.0]: https://github.com/snykk/dsa-playground/compare/v0.8.1...v0.9.0
[v0.8.1]: https://github.com/snykk/dsa-playground/compare/v0.8.0...v0.8.1
[v0.8.0]: https://github.com/snykk/dsa-playground/compare/v0.7.1...v0.8.0
[v0.7.1]: https://github.com/snykk/dsa-playground/compare/v0.7.0...v0.7.1
[v0.7.0]: https://github.com/snykk/dsa-playground/compare/v0.6.0...v0.7.0
[v0.6.0]: https://github.com/snykk/dsa-playground/compare/v0.5.0...v0.6.0
[v0.5.0]: https://github.com/snykk/dsa-playground/compare/v0.4.0...v0.5.0
[v0.4.0]: https://github.com/snykk/dsa-playground/compare/v0.3.0...v0.4.0
[v0.3.0]: https://github.com/snykk/dsa-playground/compare/v0.2.0...v0.3.0
[v0.2.0]: https://github.com/snykk/dsa-playground/compare/v0.1.0...v0.2.0
[v0.1.0]: https://github.com/snykk/dsa-playground/releases/tag/v0.1.0
