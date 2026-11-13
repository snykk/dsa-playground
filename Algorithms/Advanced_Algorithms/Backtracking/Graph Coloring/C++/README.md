# Graph Coloring -- C++ Implementation

## Files

- `graph_coloring.cpp`: the solver (`isSafe`, `graphColoringUtil`, `graphColoring`, `chromaticNumber`; `main` is compiled out with `-DIS_TEST_BUILD`).
- `graph_coloring_test.cpp`: tests (valid coloring, too few colors, chromatic number, `is_safe`, empty graph, edgeless graph, even and odd cycles, complete graph; the returned colorings are checked for validity).

## API

- `isSafe(graph, v, color, c)`: true if color `c` can be given to vertex `v` (no neighbor has it).
- `graphColoring(graph, m)`: tries to color the graph with colors `1..m`; returns `std::optional<std::vector<int>>`, empty if impossible
- `chromaticNumber(graph)`: smallest m for which a coloring exists (0 for an empty graph).

```cpp
#include "graph_coloring.cpp"

vector<vector<int>> graph = {{0, 1, 1, 1}, {1, 0, 1, 0}, {1, 1, 0, 1}, {1, 0, 1, 0}};
auto color = graphColoring(graph, 3);   // {1, 2, 3, 2}
int k = chromaticNumber(graph);         // 3
```

## C++-Specific Notes

- Needs C++17 for `std::optional`.
- The test file includes the `.cpp` directly, so compile one file and define `IS_TEST_BUILD` to drop the demo `main`.
- The graph is `vector<vector<int>>`, passed by const reference.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD graph_coloring_test.cpp -o graph_coloring_test && ./graph_coloring_test
```

## Key Takeaways

- Choose a color, check the neighbors, recurse, and undo on failure.
- The worst case is O(V * m^V); use it for small graphs only.
- The chromatic number comes from trying m = 1, 2, 3, ... until one succeeds.
