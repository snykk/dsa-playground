# Edge List -- Python Implementation

Flat list of edge tuples with optional direction and weights. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `edge_list.py`: the `EdgeList` class
- `edge_list_test.py`: unit tests (add, remove, edges, counts, traversals, conversion)

## API

- `EdgeList(directed=False, weighted=False)`
- `add_edge(u, v, weight=None)`: weight defaults to 1.0 when weighted; O(E)
- `remove_edge(u, v)`, `has_edge(u, v)`, `get_weight(u, v)` (None when absent)
- `get_neighbors(u)`, `get_edges()` (a copy; both directions when undirected), `get_vertices()`
- `get_edge_count()`: an undirected edge counts once, a self-loop counts once
- `bfs(s)`, `dfs(s)`, `dfs_recursive(s)`, `is_connected()` (raises `ValueError` on a directed graph)
- `to_adjacency_list()`: a dict of neighbor lists (or `(neighbor, weight)` lists)

## Python-Specific Notes

Edges are tuples: `(u, v)` or `(u, v, weight)`. An undirected edge is stored as two tuples, so `len(get_edges())` is twice `get_edge_count()`, except that each self-loop is stored once. `dfs_recursive` recurses once per level, so a very deep graph can hit the recursion limit.

## How to Run

```bash
python3 -m unittest edge_list_test
```

## Key Takeaways

- Everything except iterating the edges is a scan: O(E).
- `add_edge` replaces duplicates, so it is O(E), not O(1).
- Convert with `to_adjacency_list()` before heavy traversal.
