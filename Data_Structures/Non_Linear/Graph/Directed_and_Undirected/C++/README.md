# Directed & Undirected Graphs -- C++ Implementation

One `Graph` class for both kinds, stored as `unordered_map<int, vector<int>>`. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `graph.cpp`: the `Graph` class
- `graph_test.cpp`: assert-based tests (add, remove, traversals, connectivity)

## API

- `Graph(bool directed = false)`
- `add_vertex(v)`, `add_edge(u, v)`, `remove_edge(u, v)`
- `has_edge(u, v)`, `get_neighbors(u)`, `get_vertices()`, `get_edges()`
- `bfs(start)`, `dfs(start)`
- `is_connected()`: throws `std::invalid_argument` on a directed graph
- `get_degree(u)`: directed graphs return in-degree plus out-degree

## C++-Specific Notes

All storage is standard containers, so copying a `Graph` is safe. `get_neighbors` returns a copy. There is no recursive DFS in this version. `get_edges()` removes the mirror copy of an undirected edge by remembering a string key for each pair.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD graph_test.cpp -o graph_test
./graph_test
```

## Key Takeaways

- The `directed` flag controls only whether the reverse entry is stored.
- Edge updates and lookups scan a vector: O(deg).
- `is_connected()` is defined only for undirected graphs.
