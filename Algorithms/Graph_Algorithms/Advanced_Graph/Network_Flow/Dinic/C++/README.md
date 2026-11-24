# Dinic's Algorithm -- C++ Implementation

Maximum flow with level graphs and blocking flows, plus the flow on every edge and the minimum cut. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `dinic.cpp` | `dinic`, `dinicFlow`, `struct DinicResult`, the helpers in `namespace dinic_detail`, and a demo `main` (compiled out when `IS_TEST_BUILD` is defined) |
| `dinic_test.cpp` | 19 assert-based tests: the classic network, edge cases, `INT_MAX` capacities, a 200000-vertex chain, 700 random networks against an Edmonds-Karp reference with the cut and the flow conservation, unit networks from bipartite matching, the comb, and 40 networks pinned to the Python outputs; it `#include`s `dinic.cpp` |

## API

- `long long dinic(const std::unordered_map<int, std::unordered_map<int, int>>& graph, int source, int sink)`: the maximum flow value. `graph[u][v]` is the capacity of `u -> v`. Returns 0 when `source == sink` or the sink is unreachable.
- `DinicResult dinicFlow(const std::unordered_map<int, std::unordered_map<int, int>>& graph, int source, int sink)`: `maxFlow`, `flows` (`flows[u][v]`, a `long long` for every edge of `graph`), `sourceSide` (the increasing vertices the last BFS reached), `phases` (BFS runs, the last one included) and `edgeVisits` (residual entries the depth-first searches looked at). When `source == sink` every flow is 0, `sourceSide` is `{source}` and both counts are 0.

Neither function throws; like `edmondsKarp`, they return a flow of 0 for the cases above.

## C++-Specific Notes

- **Overflow.** Capacities are `int`, but the residual graph, the flows and the total are `long long`, so two paths of `INT_MAX` give 4294967294 (a test checks it).
- **Order.** The input is a hash map, whose order is unspecified, so `neighbours` copies each vertex's residual entries into a vector and sorts it. Every search tries them in that order, and the agreement test checks the flows, the cut and both counts on 40 networks computed by the Python code.
- **No recursion.** `findPath` keeps the path in a vector, so the 200000-vertex chain in the tests cannot overflow the call stack.
- **Test build.** The test `#include`s the `.cpp`, so build only the test file, and define `IS_TEST_BUILD` to drop the demo `main`. CI also runs it under AddressSanitizer and UndefinedBehaviorSanitizer.

## How to Run

```bash
# tests
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD dinic_test.cpp -o dinic_test
./dinic_test

# demo (maximum flow 23, source side 0 1 2 4, 3 phases, 40 edge visits)
g++ -std=c++17 -O2 -Wall dinic.cpp -o dinic_demo
./dinic_demo
```

## Key Takeaways

1. A hash map gives no order, so sort the entries once if the result must be reproducible.
2. Keep flows and totals in a wider type than single capacities.
3. `current[u]` is a `std::size_t` index into the sorted entries; a reference to it stays valid while the map grows.
