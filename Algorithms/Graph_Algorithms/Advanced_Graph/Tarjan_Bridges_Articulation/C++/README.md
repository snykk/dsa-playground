# Tarjan's Bridges & Articulation Points — C++ Implementation

Single-pass O(V + E) DFS finding all bridges (critical edges) and articulation points (cut vertices) in an undirected graph.

For the conceptual overview, visuals, and walkthrough, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `tarjan_bridges.h` | Header-only `TarjanBridges` class producing a `TarjanResult` struct |
| `tarjan_bridges_test.cpp` | Assertion-based tests covering standard topologies and edge cases |

---

## C++-Specific Notes

- **Edge-indexed adjacency**: `std::vector<std::pair<int, int>>` per vertex (neighbor, edge ID). Handles parallel edges correctly — a pure vertex-parent check silently fails on multigraphs.
- **Struct return via `TarjanResult`** keeps the API clean — no output parameters. RVO makes this zero-cost.
- **`std::set<std::pair<int,int>>` for bridges** ensures uniqueness and sorted output. For performance-critical code, a `std::vector` with post-sort + unique is faster.
- **Structured bindings** (`auto& [v, eid] : adj_[u]`) — C++17 feature. Clean iteration with named components.
- **Iterative DFS**: an explicit `std::vector<Frame>` stack replaces recursion. A recursive DFS overflows the default call stack on a path of about 10^5 vertices; the iterative one handles 10^6 (see `testLongPath`).

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall tarjan_bridges_test.cpp -o tarjan_bridges_test
./tarjan_bridges_test
```

---

## Key Takeaways for Learners

1. **Single DFS, two outputs.** The magic of Tarjan: bridges and articulation points share the same `disc`/`low` machinery. Don't be tempted to write two separate passes.
2. **Edge IDs beat vertex parents.** For any production graph algorithm that might encounter parallel edges, track the incoming edge ID rather than the parent vertex.
3. **`low[v] > disc[u]` vs `low[v] >= disc[u]`.** Strict for bridges, non-strict for articulation. The reason is that a back edge to `u` itself lets the subtree "escape" through `u`'s own position — enough for articulation but not enough to spare the bridge.
