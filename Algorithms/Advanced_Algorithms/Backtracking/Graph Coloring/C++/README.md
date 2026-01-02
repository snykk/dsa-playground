# Graph Coloring - C++

This folder contains a C++ implementation of **Graph Coloring** using backtracking.

---

## Concept

Colors a graph with minimum number of colors such that no two adjacent vertices have the same color. Uses backtracking to find a valid coloring.

**Key Features:**
- Backtracking algorithm
- Finds minimum chromatic number
- Validates coloring constraints

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `isSafe(graph, v, color, c)` | Check if color c is safe for vertex v | O(V) |
| `graphColoring(graph, m)` | Color graph with m colors | O(m × k^n) |
| `chromaticNumber(graph)` | Find minimum colors needed | O(V × m × k^n) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Graph Coloring | O(m × k^n) | O(n) |
| Chromatic Number | O(V × m × k^n) | O(n) |
| Safety Check | O(V) | O(1) |

---

## Usage

```cpp
#include "graph_coloring.cpp"

vector<vector<int>> graph = {
    {0, 1, 1, 1},
    {1, 0, 1, 0},
    {1, 1, 0, 1},
    {1, 0, 1, 0}
};

auto color = graphColoring(graph, 3);
if (color.has_value()) {
    // Use coloring
}

int chromNum = chromaticNumber(graph);
```

---

## Running Tests

```bash
g++ -o test graph_coloring_test.cpp && ./test
```

---

_Last Updated: December 2025_

