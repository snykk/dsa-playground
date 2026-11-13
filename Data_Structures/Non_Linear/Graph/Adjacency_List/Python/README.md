# Adjacency List -- Python Implementation

Dictionary-of-lists graph with optional direction and weights. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `adjacency_list.py`: the `AdjacencyList` class
- `adjacency_list_test.py`: 16 unit tests

## API

- `AdjacencyList(num_vertices=0, directed=False, weighted=False)`
- `add_vertex(v)`, `add_edge(u, v, weight=1.0)`, `remove_edge(u, v)`: edge updates are O(deg)
- `has_edge(u, v)`, `get_weight(u, v)` (None when absent or unweighted)
- `get_neighbors(u)`, `get_neighbors_with_weights(u)`: copies
- `get_degree(u)`, `get_vertices()`, `get_edges()`
- `bfs(s)`, `dfs(s)`, `dfs_recursive(s)`, `is_connected()` (raises `ValueError` on a directed graph)

## Python-Specific Notes

Unweighted graphs store plain vertex ids in each list and weighted graphs store `(neighbor, weight)` tuples. `remove_edge` removes both directions when the graph is undirected. `dfs_recursive` recurses once per level of the DFS, so a very long path can hit the recursion limit; `dfs` is iterative.

## How to Run

```bash
python3 -m unittest adjacency_list_test
```

## Key Takeaways

- One list per vertex, space O(V + E).
- Edge updates and lookups scan a list: O(deg), not O(1).
- Undirected edges live in two lists; both must change together.
