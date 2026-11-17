# Changelog

All notable changes to this repository, newest first. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/): each release groups its changes under Added, Changed, Removed and Fixed, in that order. Versions follow [Semantic Versioning](https://semver.org/) with a `v` prefix.

Each version is an annotated git tag on `master`. When it is pushed, the release workflow publishes that version's section below as its GitHub Release notes; RELEASING.md describes the flow.

## Versioning guide

Before v1.0.0:

- **MINOR** (`v0.3.0`): new topics, visualizations or site features.
- **PATCH** (`v0.3.1`): fixes only, in the code, the tests, the documents or the site.

## Unreleased

Changes on `master` that are not in a release yet.

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

[v0.7.0]: https://github.com/snykk/dsa-playground/releases/tag/v0.7.0
[v0.6.0]: https://github.com/snykk/dsa-playground/releases/tag/v0.6.0
[v0.5.0]: https://github.com/snykk/dsa-playground/releases/tag/v0.5.0
[v0.4.0]: https://github.com/snykk/dsa-playground/releases/tag/v0.4.0
[v0.3.0]: https://github.com/snykk/dsa-playground/releases/tag/v0.3.0
[v0.2.0]: https://github.com/snykk/dsa-playground/releases/tag/v0.2.0
[v0.1.0]: https://github.com/snykk/dsa-playground/releases/tag/v0.1.0
