# Weighted & Unweighted Graphs -- C++ Implementation

`unordered_map<int, vector<pair<int, double>>>` adjacency list. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `weighted_graph.cpp`: the `WeightedGraph` class
- `weighted_graph_test.cpp`: assert-based tests (weights, total weight, undirected removal)

## API

- `WeightedGraph(bool directed = false)`
- `add_vertex(v)`, `add_edge(u, v, weight = 1.0)`
- `remove_edge(u, v)`: removes both directions when undirected
- `has_edge(u, v)`, `get_weight(u, v)` (-1.0 when absent), `get_neighbors(u)`
- `get_total_weight()`, `bfs(start)`

## C++-Specific Notes

Weights are `double`. The one-way removal used when `add_edge` replaces an edge is a private helper (`remove_one_way`), so the public `remove_edge` can clear both directions. `get_weight` uses -1.0 for "absent", which is also a legal weight; call `has_edge` first when negative weights are possible. Everything is standard containers, so copying is safe.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD weighted_graph_test.cpp -o weighted_graph_test
./weighted_graph_test
```

## Key Takeaways

- Weight defaults to 1.0; re-adding an edge updates it.
- Undirected removal clears both entries.
- `get_weight` returning -1.0 is ambiguous with negative weights.
