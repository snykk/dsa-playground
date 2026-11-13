# Tarjan's SCC Algorithm -- C++ Implementation

SCCs in one iterative DFS pass. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `tarjan.cpp` | `tarjanSCC`, `tarjanSCCCount`, `isStronglyConnected`, helper `strongConnect`, and a demo `main` (compiled out when `IS_TEST_BUILD` is defined) |
| `tarjan_test.cpp` | 5 assert-based tests: basic, component contents and order, strongly connected, negative ids and neighbour-only vertices, a 10^6-vertex cycle and path; it `#include`s `tarjan.cpp` |

## API

- `std::vector<std::vector<int>> tarjanSCC(const std::unordered_map<int, std::vector<int>>& graph)`: components, sinks first.
- `int tarjanSCCCount(graph)`: number of components.
- `bool isStronglyConnected(graph)`: exactly one component (false for an empty graph).

Bridges and articulation points are not in the C++ version; see `Tarjan_Bridges_Articulation`.

## C++-Specific Notes

- **Explicit stack.** `strongConnect` keeps `(vertex, next neighbour index)` pairs in a `std::vector`, so a 10^6-vertex cycle does not overflow the call stack.
- **Hash maps and sets.** `indices`, `lowLink` and `onStack` are hash containers, so any `int`, including negative ids, is a valid vertex.
- **Neighbour-only vertices.** `neighborsOf` returns an empty list for a vertex that is not a key.
- **Component order.** Sinks first; the order of unrelated components depends on `unordered_map` iteration.

## How to Run

```bash
# tests
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD tarjan_test.cpp -o tarjan_test
./tarjan_test

# demo
g++ -std=c++17 -O2 -Wall tarjan.cpp -o tarjan_demo
./tarjan_demo
```

## Key Takeaways

1. An explicit stack replaces recursion on deep graphs.
2. Hash containers remove any assumption about vertex ids.
3. Build the test file alone: it includes the implementation.
