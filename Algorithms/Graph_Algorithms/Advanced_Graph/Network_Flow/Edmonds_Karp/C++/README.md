# Edmonds-Karp Algorithm -- C++ Implementation

Maximum flow with BFS augmenting paths. For the idea, the trace and the complexity proof, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `edmonds_karp.cpp` | `edmondsKarp(graph, source, sink)` and a demo `main` (compiled out when `IS_TEST_BUILD` is defined) |
| `edmonds_karp_test.cpp` | 8 assert-based tests; it `#include`s `edmonds_karp.cpp` |

## API

- `long long edmondsKarp(const std::unordered_map<int, std::unordered_map<int, int>>& graph, int source, int sink)`: the maximum flow value. `graph[u][v]` is the capacity of `u -> v`. Returns 0 when `source == sink` or the sink is unreachable.

## C++-Specific Notes

- **Overflow.** Capacities are `int`, but the residual graph and the total are `long long`, so adding several `INT_MAX` paths is safe (a regression test covers two such paths).
- **Hash maps.** Vertex ids can be any `int`, including negative ones and ones that are not map keys. Neighbour order is unspecified, so the chosen shortest path may differ from Python, but the flow value is the same.
- **Test build.** The test `#include`s the `.cpp`, so build only the test file, and define `IS_TEST_BUILD` to drop the demo `main`.

## How to Run

```bash
# tests
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD edmonds_karp_test.cpp -o edmonds_karp_test
./edmonds_karp_test

# demo (prints "Maximum flow: 23")
g++ -std=c++17 -O2 -Wall edmonds_karp.cpp -o edmonds_karp_demo
./edmonds_karp_demo
```

## Key Takeaways

1. Use a wider type for flow totals than for single capacities.
2. Include reverse edges of capacity 0 in the residual graph.
3. Build the test file alone: compiling both `.cpp` files together defines every symbol twice.
