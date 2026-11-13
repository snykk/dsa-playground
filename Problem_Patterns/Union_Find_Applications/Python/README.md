# Union-Find Applications -- Python Implementation

A disjoint set union with path compression and union by rank, plus a component counter. See the [topic README](../README.md) for the applications.

## Files

| File | Contents |
|------|----------|
| `union_find.py` | `UnionFind`, `count_components` and a demo `main` |
| `union_find_test.py` | Unit tests: basics, bounds, rank, components, cycle detection and Kruskal via `union` |

## API

- `UnionFind(size)`: `size` singleton sets; `ValueError` if `size < 0`.
- `find(x)`: root of `x` with path compression; `ValueError` if `x` is out of range.
- `union(x, y)`: merge by rank; `True` if merged, `False` if already connected.
- `connected(x, y)`: whether the two items share a root.
- `get_count()`: number of sets.
- `count_components(n, edges)`: components of an undirected graph with nodes `0..n-1` and edges `[u, v]`.

## Python-Specific Notes

- `find` is recursive; union by rank keeps trees at most log n tall, so recursion stays shallow.
- The `parent` and `rank` lists are public attributes (tests inspect `parent`).
- The annotation `list[list[int]]` needs Python 3.9 or newer.
- Cycle detection and Kruskal are not functions here; use the boolean from `union` as in the topic README.

## How to Run

```bash
python3 -m unittest union_find_test
python3 union_find.py
```

## Key Takeaways

- Compare roots (`find`), never raw parents.
- `union` returning `False` means the edge is redundant.
- `count_components` takes `n` first, then the edges.
