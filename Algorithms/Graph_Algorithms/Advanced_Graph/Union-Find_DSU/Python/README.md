# Union-Find (Disjoint Set Union) -- Python Implementation

`UnionFind` with path compression and union by rank, plus graph helpers. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `union_find.py` | `UnionFind`, `union_find_connected_components`, `union_find_cycle_detection`, `union_find_kruskal_mst`, `union_find_largest_component` |
| `union_find_test.py` | 12 unit tests: basics, already connected, components, cycle detection, Kruskal, largest component, the README trace (arrays), a 100000-union chain, the empty structure |

## API

- `UnionFind(n)`: elements `0..n-1`; attributes `parent`, `rank`, `count`.
- `find(x) -> int`: the root, with path compression.
- `union(x, y) -> bool`: merge by rank; false if already in one set.
- `connected(x, y) -> bool`, `get_count() -> int`, `get_components() -> Dict[int, List[int]]` (root to members).
- `union_find_connected_components(edges, n) -> List[List[int]]`.
- `union_find_cycle_detection(edges, n) -> bool` (true for a repeated edge or a self-loop too).
- `union_find_kruskal_mst(edges, n) -> List[tuple]`: `edges` are `(u, v, weight)`; returns a minimum spanning forest.
- `union_find_largest_component(edges, n) -> List[int]`.

## Python-Specific Notes

- **Recursive `find`.** Union by rank keeps trees below `log2(n)`, so the recursion stays shallow (a chain of 100000 unions is tested).
- **No bounds checks.** A negative id wraps around like any Python index (`UnionFind(3).union(-1, 0)` returns `True`), and an id `>= n` raises `IndexError`.
- **Kruskal copy.** `union_find_kruskal_mst` sorts with `sorted(..., key=weight)` and stops after `n - 1` edges; the full treatment is in the Greedy topic.
- **Method name** is `union` here, `unite` in C++ and `Union` in Go.

## How to Run

```bash
python3 -m unittest union_find_test
python3 union_find.py      # demo
```

## Key Takeaways

1. Compress paths in `find` and compare ranks in `union`.
2. A `False` from `union` marks an edge inside an existing component.
3. Validate ids yourself if the input is not trusted.
