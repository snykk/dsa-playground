# Heavy-Light Decomposition

Heavy-light decomposition (HLD) cuts a rooted tree into vertical chains so that any root-to-node path crosses only O(log N) of them. The chains are laid out as contiguous ranges of an array, so a path between two nodes becomes O(log N) array ranges. Build is O(N); an LCA query is O(log N).

In this repository HLD is implemented as the decomposition plus LCA (all languages) and path segments (`query_path`, Python only). There is no segment tree, path sum or path update in any language.

## Intuition

For every node, call the edge to its child with the largest subtree *heavy* and every other child edge *light*. Heavy edges form chains. Walking from any node up to the root, each light edge leads to a parent whose subtree is more than twice as large, so there are at most log2 N light edges, hence at most floor(log2 N) + 1 chains on any root path.

Numbering nodes in pre-order, heavy child first, makes every chain a contiguous range of positions (and every subtree one too). A range structure such as a segment tree over those positions can then answer path queries.

## Visual

```text
        0                 heavy edges: 0-1, 1-4, 4-6, 2-5
       / \                chains: [0 1 4 6] head 0
      1   2                       [3]       head 3
     / \   \                      [2 5]     head 2
    3   4   5
        |                 pos (array order): 0 1 4 6 3 2 5
        6                 i.e. pos = [0, 1, 5, 4, 2, 6, 3] by node id
```

## How It Works

1. `dfs_size`: from the root, compute `parent`, `depth`, `size` and `heavy[u]` (the first child with the largest size; `-1` for a leaf).
2. `decompose`: pre-order, heavy child first. Set `head[u]` (top of the chain) and `pos[u]`. A heavy child inherits the head; a light child becomes its own head.
3. `lca(u, v)`: while `head[u] != head[v]`, move the node whose head is deeper to the parent of its head. Then the shallower node is the LCA.
4. `query_path(u, v)` (Python): the same climb, but it records `(pos[head[u]], pos[u])` for each chain and a final `(pos[shallower], pos[deeper])`.

`build(root)` resets its working state, so it can be called repeatedly.

## Step-by-Step Trace

Tree above, `query_path(3, 6)`:

| Step | u | v | Action |
|------|---|---|--------|
| 1 | 3 | 6 | head[3] = 3, head[6] = 0; chain head 3 is deeper, emit (4, 4), jump to parent[3] = 1 |
| 2 | 1 | 6 | same chain; node 1 is shallower, emit (1, 3) |

Result `[(4, 4), (1, 3)]`: positions 4, 1, 2, 3 are nodes 3, 1, 4, 6. `lca(3, 6)` is 1.

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Build | O(N) | O(N) |
| `lca` | O(log N) | O(1) |
| `query_path` | O(log N) segments | O(log N) |
| Path sum with a segment tree (not implemented) | O(log^2 N) | O(N) |

Why: each loop iteration crosses one chain, and a path crosses O(log N) chains; a range structure adds another O(log N) per chain.

## When to Use

Use it for many online queries or updates on tree paths or subtrees, on a static tree. If you only need LCA, binary lifting or an Euler tour with a sparse table is simpler.

## HLD vs. Alternatives

| Technique | LCA | Path query/update | Memory |
|-----------|-----|-------------------|--------|
| HLD | O(log N) | O(log^2 N) with a segment tree | O(N) |
| Binary lifting | O(log N) | static aggregates only | O(N log N) |
| Euler tour + sparse table | O(1) | no | O(N log N) |
| Centroid decomposition | no | offline all-pairs | O(N) |

## Common Pitfalls

- Calling `decompose` without `dfs_size` first (no heavy children, broken chains); use `build`.
- Climbing from the deeper node instead of the node whose chain head is deeper.
- Off-by-one in the last segment: it is inclusive on both ends.
- Indexing the segment tree by node id instead of `pos[u]`.
- Edge-valued paths: the LCA node must be excluded from the final segment.
- Very deep trees: C++ and Go use recursion in `dfsSize` and `decompose`; Python is iterative.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `heavy_light_decomposition.py` | `build`, `lca`, `query_path`; iterative passes |
| C++ | [C++/](C++/) | `heavy_light_decomposition.cpp` | `build`, `lca`; recursive |
| Go | [Go/](Go/) | `main.go` | `Build`, `LCA`; recursive |

## Practice Problems

- [CSES - Path Queries](https://cses.fi/problemset/task/1138)
- [CSES - Path Queries II](https://cses.fi/problemset/task/2134)
- [LeetCode 236 - Lowest Common Ancestor of a Binary Tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/)

## Related

- [Centroid Decomposition](../Centroid%20Decomposition/)
- [Square Root Decomposition](../Square%20Root%20Decomposition/)
- [Specialized Techniques overview](../)
