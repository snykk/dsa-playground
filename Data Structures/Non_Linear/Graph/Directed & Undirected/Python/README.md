# Directed & Undirected Graphs -- Python Implementation

One `Graph` class for both kinds, stored as a dict of neighbor lists. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `graph.py`: the `Graph` class
- `graph_test.py`: unit tests (add, remove, edges, traversals, connectivity, degree, copy semantics)

## API

- `Graph(directed=False)`
- `add_vertex(v)`, `add_edge(u, v)`, `remove_edge(u, v)`
- `has_edge(u, v)`, `get_neighbors(u)` (a copy), `get_vertices()`, `get_edges()`
- `bfs(s)`, `dfs(s)`, `dfs_recursive(s)`
- `is_connected()`: raises `ValueError` on a directed graph
- `get_degree(u)`: directed graphs return in-degree plus out-degree

## Python-Specific Notes

Vertices are any hashable value in practice, though the type hints say `int`. `get_edges()` returns each undirected edge once, as `(u, v)` in the order it was found. `dfs_recursive` recurses once per level, so a very deep graph can hit the recursion limit; `dfs` is iterative.

## How to Run

```bash
python3 -m unittest graph_test
```

## Key Takeaways

- Directed and undirected differ only in whether the reverse entry is stored.
- Edge updates and lookups scan a list: O(deg).
- `is_connected()` is defined only for undirected graphs.
