# Ford-Fulkerson Method -- C++ Implementation

Maximum flow with DFS augmenting paths. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `ford_fulkerson.cpp` | `fordFulkerson`, the iterative `dfsFindPath`, and a demo `main` (compiled out when `IS_TEST_BUILD` is defined) |
| `ford_fulkerson_test.cpp` | 8 assert-based tests; it `#include`s `ford_fulkerson.cpp` |

## API

- `long long fordFulkerson(const std::unordered_map<int, std::unordered_map<int, int>>& graph, int source, int sink)`: maximum flow value. `graph[u][v]` is the capacity of `u -> v`. Returns 0 when `source == sink` or the sink is unreachable.
- `std::vector<int> dfsFindPath(const ResidualGraph& residual, int source, int sink)`: one augmenting path, or an empty vector.

There is no per-edge flow, no list of paths and no min-cut function in C++ (Python has them).

## C++-Specific Notes

- **Overflow.** Capacities are `int`; the residual graph (`ResidualGraph`) and the total are `long long`. A regression test adds two `INT_MAX` paths.
- **Vertex ids.** Visited state is a hash map, so any `int` works, including ids of 1000 or more and negative ids (both have regression tests).
- **Iterative DFS.** A stack of `(vertex, iterator)` pairs avoids deep recursion; a 200000-vertex chain is tested.
- **Test build.** The test `#include`s the `.cpp`, so build only the test file with `-DIS_TEST_BUILD`.

## How to Run

```bash
# tests
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD ford_fulkerson_test.cpp -o ford_fulkerson_test
./ford_fulkerson_test

# demo (prints "Maximum flow: 23")
g++ -std=c++17 -O2 -Wall ford_fulkerson.cpp -o ford_fulkerson_demo
./ford_fulkerson_demo
```

## Key Takeaways

1. Never size a visited array by a guess; key it by vertex.
2. Use `long long` for flow totals.
3. Build the test file alone, with the flag.
