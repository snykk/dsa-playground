# Adjacency List -- C++ Implementation

Hash-map-of-vectors graph with optional direction and weights. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `adjacency_list.cpp`: the `AdjacencyList` class
- `adjacency_list_test.cpp`: assert-based tests, including removal on directed and undirected graphs

## API

- `AdjacencyList(bool directed = false, bool weighted = false)`
- `add_vertex(v)`, `add_edge(u, v, weight = 1.0)`: O(deg(u) + deg(v))
- `remove_edge(u, v)`: removes both directions when undirected
- `has_edge(u, v)`: O(deg(u))
- `get_neighbors(v)`: returns a copy
- `bfs(start)`: empty vector for an unknown start vertex

## C++-Specific Notes

Two maps are kept, `unordered_map<int, vector<int>>` for unweighted graphs and `unordered_map<int, vector<pair<int, double>>>` for weighted ones; only the one matching `weighted` is used. The one-way removal used by `add_edge` is a private helper (`remove_one_way`) so the public `remove_edge` can keep both directions in sync. Only the operations above exist; DFS, degrees and connectivity are in the Python version only.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD adjacency_list_test.cpp -o adjacency_list_test
./adjacency_list_test
```

## Key Takeaways

- One vector per vertex, space O(V + E).
- Undirected edges are stored twice; `remove_edge` removes both copies.
- Edge lookup is a linear scan of one vector.
