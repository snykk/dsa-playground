# Bipartite Matching -- C++ Implementation

Maximum matching in an unweighted bipartite graph with Kuhn's algorithm and Hopcroft-Karp, and a minimum vertex cover by Konig's theorem. For the idea, the traces and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `bipartite_matching.cpp` | `kuhn`, `hopcroftKarp`, `minVertexCover` and a demo `main` (compiled out when `IS_TEST_BUILD` is defined) |
| `bipartite_matching_test.cpp` | 11 assert-based tests: the worked example, edge cases, invalid input, an augmenting path through 200000 left vertices, 600 random graphs against brute force and max flow, and 40 graphs pinned to the Python outputs; it `#include`s `bipartite_matching.cpp` |

## API

- `struct Matching { int size; std::vector<int> matchLeft; }`: `matchLeft[u]` is `u`'s partner or -1.
- `struct VertexCover { std::vector<int> left, right; }`: the cover's vertices on each side, increasing.
- `Matching kuhn(int nLeft, int nRight, const std::vector<Edge>& edges)`: a maximum matching with Kuhn's algorithm. `Edge` is `std::pair<int, int>`, left vertex first.
- `Matching hopcroftKarp(int nLeft, int nRight, const std::vector<Edge>& edges)`: the same with Hopcroft-Karp.
- `VertexCover minVertexCover(int nLeft, int nRight, const std::vector<Edge>& edges)`: Konig's cover from the Hopcroft-Karp matching.

All three throw `std::invalid_argument` for a negative side size or an edge endpoint out of range.

## C++-Specific Notes

- **No recursion.** The searches keep their path in vectors, so an augmenting path through 200000 left vertices (the long-path test) cannot overflow the call stack.
- **Helpers.** The adjacency builder, the two searches, the BFS and the path flip live in `namespace bipartite_detail`.
- **Same matching as Python.** `adj[u]` keeps the edges in input order, and the searches try them in that order; the agreement test checks the matching and the cover on 40 graphs computed by the Python code.
- **Test build.** The test `#include`s the `.cpp`, so build only the test file, and define `IS_TEST_BUILD` to drop the demo `main`. CI also runs it under AddressSanitizer and UndefinedBehaviorSanitizer.

## How to Run

```bash
# tests
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD bipartite_matching_test.cpp -o bipartite_matching_test
./bipartite_matching_test

# demo
g++ -std=c++17 -O2 -Wall bipartite_matching.cpp -o bipartite_matching_demo
./bipartite_matching_demo
```

## Key Takeaways

1. A matching is two arrays, `matchLeft` and `matchRight`; flipping a path rewrites one entry of each per left vertex on it.
2. Hopcroft-Karp's `dist` array does two jobs: it holds the layers, and -1 marks the dead ends of a phase.
3. Build the test file alone: it already `#include`s the implementation, and compiling both `.cpp` files together without `IS_TEST_BUILD` gives two `main` functions.
