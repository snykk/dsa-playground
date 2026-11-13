# Disjoint Set Union -- Python Implementation

Union by rank plus path compression, with a `size` array and a component counter.

## Files

- `dsu.py`: the `DSU` class and a small demo under `__main__`.
- `dsu_test.py`: unit tests (init, union, find, path compression, connected, components, sizes, bad input, random sequences against a brute-force label array, graph helpers).

## API

| Method | Description | Time |
|--------|-------------|------|
| `DSU(n)` | n singleton sets; `ValueError` if `n < 0` | O(n) |
| `find(x)` | root of x with path compression; `IndexError` if x is outside `[0, n)` | O(alpha(n)) |
| `union(x, y)` | merge by rank; True if merged | O(alpha(n)) |
| `connected(x, y)` | same set? | O(alpha(n)) |
| `get_size(x)` | size of the set of x | O(alpha(n)) |
| `get_component_count()` | number of sets | O(1) |
| `get_components()` | dict root to member list | O(n alpha(n)) |
| `get_parent(x)` | raw parent, no compression | O(1) |
| `get_count()`, `count` | alias of `get_component_count()`; `UnionFind` is an alias of `DSU` | O(1) |
| `connected_components`, `has_cycle`, `kruskal_mst`, `largest_component` | graph helpers over `(u, v[, w])` edge lists | O(E alpha(n)) and up |

## Python-Specific Notes

- `find` is recursive. Union by rank limits the depth to log2(n), so the recursion limit is not a concern.
- Negative indices would silently alias in a list (`parent[-1]`), so `find` checks the range explicitly.
- `get_components()` returns members in increasing order.

## How to Run

```bash
python3 -m unittest dsu_test
python3 dsu.py
```

## Key Takeaways

- Two small optimizations turn a slow forest into near-constant time operations.
- `find(x)` is the set id; `parent[x]` is not.
- Only merging is supported.
