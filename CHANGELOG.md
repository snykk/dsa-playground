# Changelog

Every release of this repository, newest first. When a version's tag is pushed, the release workflow publishes that version's section as its GitHub Release notes; RELEASING.md describes the flow.

## [v0.1.0] - 2026-11-12

Data structures and algorithms implemented in Python, C++ and Go.

- 155 topics, each with a README and an implementation plus unit tests in all three languages:
  - Data structures (50): linear, trees, heaps, graphs, hashing, advanced structures
  - Algorithms (80): sorting, searching, dynamic programming, graphs, strings, math, greedy, geometry, divide and conquer, randomized, backtracking, specialized techniques
  - Problem patterns (13), complexity analysis (5), competitive programming utilities (7)
- `make test` runs the Python, C++ and Go suites; GitHub Actions CI runs them on every push
- STUDY_GUIDE.md: a structured learning path

[v0.1.0]: https://github.com/snykk/dsa-playground/releases/tag/v0.1.0
