# Heavy-Light Decomposition -- Python Implementation

## Files

| File | Contents |
|------|----------|
| `heavy_light_decomposition.py` | the `HLD` class and a demo `main()` |
| `heavy_light_decomposition_test.py` | unit tests (build, LCA, positions, deep path, rebuild, random check against a naive LCA) |

## API

| Member | Description | Time |
|--------|-------------|------|
| `HLD(n, adj)` | `adj` is the adjacency list of a tree on `0..n-1` | O(n) |
| `build(root=0)` | resets state, computes `parent`, `depth`, `size`, `heavy`, `head`, `pos` | O(n) |
| `lca(u, v)` | lowest common ancestor | O(log n) |
| `query_path(u, v)` | list of `(lo, hi)` position segments covering the path (not sums) | O(log n) |
| `head`, `pos`, `depth`, `parent`, `size`, `heavy` | the decomposition arrays | |

## Python-Specific Notes

- `dfs_size` and `decompose` are iterative, so a path of thousands of nodes does not hit the recursion limit.
- The adjacency list is stored, not copied.
- There is no segment tree, path sum or path update; `query_path` returns only position ranges.

## How to Run

```bash
python3 -m unittest heavy_light_decomposition_test
python3 heavy_light_decomposition.py
```

## Key Takeaways

- Any root path crosses at most floor(log2 n) + 1 chains.
- `query_path` gives the segments you would feed to a segment tree.
