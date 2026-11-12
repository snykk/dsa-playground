# Prim's Algorithm -- Python Implementation

Prim's algorithm in three forms: adjacency list with a heap, edge list, and adjacency matrix.

## Files

| File | Contents |
|------|----------|
| `prim.py` | `prim_mst_adjacency_list`, `prim_mst_edge_list`, `prim_mst_adjacency_matrix` |
| `prim_test.py` | 8 unit tests (`unittest`) |

## API

| Function | Returns |
|----------|---------|
| `prim_mst_adjacency_list(graph, start=0)` | `(mst_edges, total_weight)` for `{vertex: [(neighbor, weight), ...]}`; `([], 0)` for an empty graph |
| `prim_mst_edge_list(edges, num_vertices, start=0)` | the same, from `(u, v, weight)` edges (builds the adjacency list, then calls the first function) |
| `prim_mst_adjacency_matrix(matrix, start=0)` | the same, from a matrix where `0` means no edge; O(V^2) |

Each edge is `(from, to, weight)`. The heap versions run in O(E log V); the matrix version in O(V^2).

```python
from prim import prim_mst_adjacency_list

graph = {0: [(1, 10), (2, 6), (3, 5)], 1: [(0, 10), (3, 15)],
         2: [(0, 6), (3, 4)], 3: [(0, 5), (1, 15), (2, 4)]}
print(prim_mst_adjacency_list(graph, 0))   # ([(0, 3, 5), (3, 2, 4), (0, 1, 10)], 19)
```

## Python-Specific Notes

- The heap holds `(weight, from, to)` tuples, so ties are broken by `from`, then `to`.
- The loop runs until the heap is empty, so a vertex that appears only in a neighbor list is still added.
- The matrix version treats every non-zero entry as an edge, negative weights included. A weight of exactly 0 cannot be represented there.
- A disconnected graph returns only the tree of the start vertex.

## How to Run

```bash
cd "Algorithms/Graph_Algorithms/Minimum_Spanning_Tree/Prims_Algorithm/Python"
python3 -m unittest prim_test
```

## Key Takeaways

- Stale heap entries are skipped, not updated.
- Pick the matrix version for dense graphs, the heap versions otherwise.
- Check the edge count against V - 1 for connectivity.
