# DP on Graphs (Go)

Go scaffold for Dynamic Programming on Graphs, a technique that combines graph traversal with memoized subproblem solutions on DAGs and other graph structures. The full implementation is in the Python directory.

## Files

| File | Description |
|------|-------------|
| `main.go` | Placeholder structure (see Python for full implementation) |
| `main_test.go` | Basic structure test |
| `go.mod` | Go module definition (`graphdp`) |

## How to Run

```bash
go test ./...
```

## Key Concepts

| Concept | Description | Typical Complexity |
|---------|-------------|-------------------|
| Longest path in DAG | Find the longest path from a source using DFS with memoization | O(V + E) |
| Topological order DP | Process nodes in topological order to propagate DP values | O(V + E) |
| State: `dp[node]` | Optimal value (e.g., longest path) reachable from `node` | -- |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(V + E) where V = vertices, E = edges |
| Space | O(V) for the DP memo table |

## Notes

- DP on graphs requires a DAG (directed acyclic graph) or equivalent structure to avoid cycles.
- Typically implemented via DFS with memoization or iterating in topological order.
- The Python implementation contains a complete longest-path-in-DAG solver using recursive DFS.
- See `../Python/graph_dp.py` for the full working implementation.

---

_Last Updated: April 2026_
