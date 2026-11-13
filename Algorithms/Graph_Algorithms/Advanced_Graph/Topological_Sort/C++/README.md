# Topological Sort -- C++ Implementation

Kahn's algorithm and a DAG check. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `topological_sort.cpp` | `topologicalSortKahn`, `isDAG` and a demo `main` (compiled out when `IS_TEST_BUILD` is defined) |
| `topological_sort_test.cpp` | 6 assert-based tests: basic order, cycle, `isDAG`, empty graph and neighbour-only vertices, order validity, a 10^6-vertex chain; it `#include`s `topological_sort.cpp` |

## API

- `std::vector<int> topologicalSortKahn(const std::unordered_map<int, std::vector<int>>& graph)`: an order including neighbour-only vertices, or an empty vector for a cycle (and for an empty graph).
- `bool isDAG(graph)`: true for the empty graph and for any acyclic graph, false when there is a cycle (self-loops included).

There is no DFS version, all-orders enumeration or longest path in C++ (Python has them).

## C++-Specific Notes

- **Empty vector is ambiguous.** It means a cycle or an empty graph, so call `isDAG` to decide.
- **In-degrees live in an `unordered_map`**, filled from keys and neighbours; the cycle check compares with its size, not with `graph.size()`.
- **Order of ties** depends on `unordered_map` iteration, so tests check validity, not one list.
- **Iterative.** Kahn uses a `std::queue`; a chain of 10^6 vertices is fine.

## How to Run

```bash
# tests
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD topological_sort_test.cpp -o topological_sort_test
./topological_sort_test

# demo
g++ -std=c++17 -O2 -Wall topological_sort.cpp -o topological_sort_demo
./topological_sort_demo
```

## Key Takeaways

1. Count vertices from the in-degree map, not from the keys.
2. Use `isDAG` instead of testing for an empty result.
3. Build the test file alone: it includes the implementation.
