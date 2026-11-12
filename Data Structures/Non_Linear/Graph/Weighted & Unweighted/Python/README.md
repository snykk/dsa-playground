# Weighted & Unweighted Graphs -- Python Implementation

Adjacency list of `(neighbor, weight)` pairs for directed and undirected graphs. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `weighted_graph.py`: the `WeightedGraph` class
- `weighted_graph_test.py`: unit tests (add, update, remove, traversals, total weight, copies)

## API

- `WeightedGraph(directed=False)`
- `add_vertex(v)`, `add_edge(u, v, weight=1.0)`, `remove_edge(u, v)`
- `has_edge(u, v)`, `get_weight(u, v)` (None when absent)
- `get_neighbors(u)`, `get_neighbors_with_weights(u)` (a copy)
- `get_vertices()`, `get_edges()` (triples; an undirected edge once), `get_total_weight()`
- `bfs(s)`, `dfs(s)`, `dfs_recursive(s)`, `is_connected()` (raises `ValueError` on a directed graph)

## Python-Specific Notes

Weights are ordinary Python numbers, so ints, floats, zero and negative values all work. `dfs_recursive` recurses once per level, so a very deep graph can hit the recursion limit; `dfs` is iterative.

## How to Run

```bash
python3 -m unittest weighted_graph_test
```

## Key Takeaways

- Weight defaults to 1.0, so an unweighted graph is a special case.
- Re-adding an edge updates its weight.
- BFS ignores weights; use Dijkstra or Bellman-Ford for cheapest paths.
