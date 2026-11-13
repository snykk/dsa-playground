# Changelog

Every release of this repository, newest first. When a version's tag is pushed, the release workflow publishes that version's section as its GitHub Release notes; RELEASING.md describes the flow.

## [v0.2.0] - 2026-11-13

A web site for the repository, an article for every topic and area, and one name and one home for every topic.

- Web site (`web/`, Astro), deployed to GitHub Pages once the repository is public:
  - a hand-written article for each of the 153 topics and an overview for each of the 50 areas that group topics
  - the Python, C++ and Go sources of every topic as tabs
  - 53 interactive visualizations covering 52 topics; their TypeScript ports are checked against the Python code with golden fixtures
- Repository:
  - every content folder named in one convention, ASCII `Title_Case_With_Underscores`
  - Suffix Array, Pattern Matching, Union-Find and Hash Map merged into one topic each; folders that only pointed elsewhere removed
  - every topic, language and category README rewritten to a template, without emoji
  - bugs fixed in all three languages across the topics, for example in the B-Tree, splay tree, network flow, FFT and convex hull implementations
- Tooling:
  - CI on release branches and pull requests, with a time limit on every job, C++ under AddressSanitizer and UndefinedBehaviorSanitizer, and README and broken-link checks
  - RELEASING.md, CHANGELOG.md and a workflow that publishes a GitHub Release for each version tag

## [v0.1.0] - 2026-11-12

Data structures and algorithms implemented in Python, C++ and Go.

- 155 topics, each with a README and an implementation plus unit tests in all three languages:
  - Data structures (50): linear, trees, heaps, graphs, hashing, advanced structures
  - Algorithms (80): sorting, searching, dynamic programming, graphs, strings, math, greedy, geometry, divide and conquer, randomized, backtracking, specialized techniques
  - Problem patterns (13), complexity analysis (5), competitive programming utilities (7)
- `make test` runs the Python, C++ and Go suites; GitHub Actions CI runs them on every push
- STUDY_GUIDE.md: a structured learning path

[v0.2.0]: https://github.com/snykk/dsa-playground/releases/tag/v0.2.0
[v0.1.0]: https://github.com/snykk/dsa-playground/releases/tag/v0.1.0
