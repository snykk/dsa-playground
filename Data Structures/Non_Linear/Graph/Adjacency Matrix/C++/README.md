# Adjacency Matrix -- C++ Implementation

`vector<vector<double>>` graph with optional direction and weights. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `adjacency_matrix.cpp`: the `AdjacencyMatrix` class
- `adjacency_matrix_test.cpp`: assert-based tests, including zero, negative and very large weights

## API

- `AdjacencyMatrix(int n, bool directed = false, bool weighted = false)`
- `add_edge(u, v, weight = 1.0)`, `remove_edge(u, v)`: out-of-range vertices are ignored
- `has_edge(u, v)`: O(1)
- `get_weight(u, v)`: -1.0 when absent or unweighted (ambiguous with a real -1.0 weight)
- `try_get_weight(u, v, double& out)`: returns false when absent; use this one
- `get_neighbors(u)`, `bfs(start)`, `dfs(start)`

## C++-Specific Notes

Weights are `double` for both kinds of graph. A `vector<vector<bool>>` presence table decides whether an edge exists, and absent weight cells hold `infinity()` rather than `INT_MAX`, so even an edge of weight 2147483647 is found. There is no destructor or manual memory: every member is a standard container, so copies are safe.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD adjacency_matrix_test.cpp -o adjacency_matrix_test
./adjacency_matrix_test
```

## Key Takeaways

- O(1) edge lookup, O(V) neighbors, O(V^2) space.
- Presence and weight are separate, so 0 and negative weights are valid edges.
- Prefer `try_get_weight` over `get_weight`.
