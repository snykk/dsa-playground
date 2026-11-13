# Centroid Decomposition -- Python Implementation

## Files

| File | Contents |
|------|----------|
| `centroid_decomposition.py` | the `CentroidDecomposition` class and a demo `main()` |
| `centroid_decomposition_test.py` | unit tests |

## API

| Member | Description | Time |
|--------|-------------|------|
| `CentroidDecomposition(n, adj)` | `adj` is an adjacency list of a tree on nodes `0..n-1` | O(n) |
| `build(root=0)` | resets state and decomposes the component containing `root` | O(n log n) |
| `parent` | list: centroid-tree parent of each node, `-1` for the root | |
| `removed` | list of booleans, all `True` after `build` | |
| `get_centroid_tree()` | the centroid tree as an adjacency list | O(n) |
| `dfs_size(u, p)`, `find_centroid(u, p, total)`, `decompose(u, p)` | internal steps | |

## Python-Specific Notes

- `dfs_size` and `find_centroid` are iterative, so a path of thousands of nodes does not hit the recursion limit. `decompose` recurses only O(log n) deep.
- The adjacency list is stored, not copied.
- `build` is re-entrant: it resets `removed` and `parent`.

## How to Run

```bash
python3 -m unittest centroid_decomposition_test
python3 centroid_decomposition.py
```

## Key Takeaways

- The centroid tree has height at most floor(log2 n) + 1 on any tree, including a path.
- Only the decomposition is implemented; queries are left to the caller.
