# Kruskal's Algorithm -- Python Implementation

Kruskal's algorithm on an edge list of `(u, v, weight)` tuples, with vertices numbered 0 to `num_vertices - 1`.

## Files

| File | Contents |
|------|----------|
| `kruskal.py` | `UnionFind`, `kruskal_mst`, `kruskal_mst_with_details` |
| `kruskal_test.py` | 6 unit tests (`unittest`) |

## API

| Name | Returns |
|------|---------|
| `UnionFind(n)` | `find(x)` with path compression; `union(x, y)` by rank, returning `False` if they were already joined |
| `kruskal_mst(edges, num_vertices)` | `(mst_edges, total_weight)`; `([], 0)` for 0 vertices |
| `kruskal_mst_with_details(edges, num_vertices)` | a dict with `mst_edges`, `total_weight`, `is_connected` and `num_edges_in_mst` |

Time O(E log E), space O(V + E): the union-find arrays plus the sorted copy of the edges.

```python
from kruskal import kruskal_mst

edges = [(0, 1, 10), (0, 2, 6), (0, 3, 5), (1, 3, 15), (2, 3, 4)]
print(kruskal_mst(edges, 4))   # ([(2, 3, 4), (0, 3, 5), (0, 1, 10)], 19)
```

## Python-Specific Notes

- `sorted` makes a copy, so the input list is not changed, and the sort is stable: equal-weight edges keep their input order.
- A disconnected graph returns a spanning forest, with fewer than V - 1 edges; `is_connected` tells you.
- `UnionFind.find` is recursive. Path compression and union by rank keep trees shallow, so the depth stays tiny.
- Negative weights are fine.

## How to Run

```bash
cd "Algorithms/Graph_Algorithms/Minimum_Spanning_Tree/Kruskals_Algorithm/Python"
python3 -m unittest kruskal_test
```

## Key Takeaways

- `union` returning `False` is the cycle test.
- Check `is_connected` before calling the result a spanning tree.
- The total weight is the same for every correct MST, even with ties.
