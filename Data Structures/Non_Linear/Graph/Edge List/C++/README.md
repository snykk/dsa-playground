# Edge List -- C++ Implementation

Vector-based edge list with optional direction and weights. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `edge_list.cpp`: the `EdgeList` class
- `edge_list_test.cpp`: assert-based tests (add, weights, self-loops, undirected removal)

## API

- `EdgeList(bool directed = false, bool weighted = false)`
- `add_edge(u, v, weight = 1.0)`: O(E)
- `remove_edge(u, v)`: removes both entries when undirected
- `has_edge(u, v)`, `get_weight(u, v)` (-1.0 when absent or unweighted), `get_neighbors(u)`
- `get_edge_count()`: undirected edges and self-loops counted once
- `bfs(start)`

## C++-Specific Notes

Two vectors are kept: `vector<tuple<int, int, double>>` for weighted graphs and `vector<pair<int, int>>` for unweighted ones; only the matching one is used. Storage is plain standard containers, so copies are safe. `get_edges`, `dfs`, `is_connected` and `to_adjacency_list` exist only in the Python version.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD edge_list_test.cpp -o edge_list_test
./edge_list_test
```

## Key Takeaways

- Every query is a scan of the edge vector: O(E).
- An undirected edge takes two entries, a self-loop one.
- `get_weight` uses -1.0 for "absent", which can be a legal weight.
