# Kosaraju's Algorithm -- C++ Implementation

SCCs with two iterative DFS passes. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `kosaraju.cpp` | `kosarajuSCC`, `kosarajuSCCCount`, `isStronglyConnected`, helpers `dfs1` and `dfs2`, and a demo `main` (compiled out when `IS_TEST_BUILD` is defined) |
| `kosaraju_test.cpp` | 5 assert-based tests: basic, component contents, strongly connected, negative ids and neighbour-only vertices, a 10^6-vertex cycle and path; it `#include`s `kosaraju.cpp` |

## API

- `std::vector<std::vector<int>> kosarajuSCC(const std::unordered_map<int, std::vector<int>>& graph)`: the components, source components first.
- `int kosarajuSCCCount(graph)`: number of components.
- `bool isStronglyConnected(graph)`: exactly one component (false for an empty graph).

There is no condensation function in C++ (Python has one).

## C++-Specific Notes

- **Explicit stacks.** Both passes use `std::vector<std::pair<int, size_t>>` (vertex, next neighbour index), so a 10^6-vertex cycle does not overflow the call stack.
- **Hash sets.** `visited` is an `std::unordered_set<int>`, so any `int` is a valid vertex id, including negative ones.
- **Neighbour-only vertices.** `neighborsOf` returns an empty list for a vertex that is not a key.
- **Order of components** that are unrelated in the condensation depends on `unordered_map` iteration order.

## How to Run

```bash
# tests
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD kosaraju_test.cpp -o kosaraju_test
./kosaraju_test

# demo (prints the SCC count and whether the graph is strongly connected)
g++ -std=c++17 -O2 -Wall kosaraju.cpp -o kosaraju_demo
./kosaraju_demo
```

## Key Takeaways

1. An explicit stack replaces recursion on deep graphs.
2. A hash set removes any assumption about vertex ids.
3. Build the test file alone: it includes the implementation.
