# Adjacency Matrix -- Python Implementation

V-by-V matrix graph with optional direction and weights. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `adjacency_matrix.py`: the `AdjacencyMatrix` class
- `adjacency_matrix_test.py`: unit tests, including zero, negative and infinite weights

## API

- `AdjacencyMatrix(num_vertices, directed=False, weighted=False)`
- `add_edge(u, v, weight=1.0)`: raises `ValueError` for a vertex outside `[0, n)`
- `remove_edge(u, v)`, `has_edge(u, v)`: out-of-range vertices are ignored / False
- `get_weight(u, v)`: None when the edge is absent or the graph is unweighted
- `get_neighbors(u)`, `get_degree(u)` (directed: in plus out)
- `bfs(s)`, `dfs(s)`, `dfs_recursive(s)`, `is_connected()` (raises on a directed graph)
- `get_matrix()`: a copy of the weight (or 0/1) table

## Python-Specific Notes

A `present` table of booleans records which edges exist, so weights can be 0, negative or `inf`. Unweighted cells hold 0 or 1; weighted absent cells hold `float('inf')` and the diagonal holds 0. `dfs_recursive` recurses once per level, so a very deep graph can hit the recursion limit; `dfs` is iterative.

## How to Run

```bash
python3 -m unittest adjacency_matrix_test
```

## Key Takeaways

- O(1) edge updates and lookups, O(V) neighbors, O(V^2) space.
- Weighted graphs need a presence flag; 0 and inf are not safe "no edge" markers.
- Undirected edges set two cells, so the matrix stays symmetric.
