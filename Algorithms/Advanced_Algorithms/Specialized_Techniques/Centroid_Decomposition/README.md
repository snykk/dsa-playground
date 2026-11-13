# Centroid Decomposition

Centroid decomposition repeatedly removes the node that splits a tree into pieces of at most half its size, and records which centroid was removed inside which. The records form a *centroid tree* of height O(log N), which turns all-pairs and path problems on a tree from O(N^2) into O(N log N). Building it costs O(N log N).

## Intuition

A **centroid** of a tree with N nodes is a node whose removal leaves every component with at most N/2 nodes. Every tree has one. Remove it, and each remaining component again has a centroid; keep going until single nodes remain. Because every component is at most half of the previous one, a node is separated at most floor(log2 N) + 1 times.

The invariant that makes it useful: for any two nodes u and v, the path between them passes through their lowest common ancestor in the centroid tree. Every path is therefore handled at exactly one centroid, and each node has only O(log N) centroid ancestors.

## Visual

```text
Original tree (edges 0-1, 0-2, 1-3, 1-4, 2-5, 4-6)

        0
       / \
      1   2          centroid of the whole tree: 1
     / \   \         (components {0,2,5}, {3}, {4,6}: all <= 3)
    3   4   5
        |
        6

Centroid tree (parent = [2, -1, 1, 1, 1, 2, 4])

        1
      / | \
     2  3  4
    / \    |
   0   5   6
```

## How It Works

1. Run a DFS from any node of the current component and compute subtree sizes, ignoring removed nodes. The root's size is `total`.
2. Starting at the DFS root, move to any child whose size is greater than `total // 2`; stop when there is none. That node is the centroid.
3. Mark the centroid removed and set `parent[centroid]` to the centroid of the level above (`-1` for the first one).
4. Recurse into every non-removed neighbor of the centroid, passing the centroid as the parent.

`build(root)` starts at `root` and resets all state first, so calling it twice gives the same result.

## Step-by-Step Trace

Tree above, `build(0)`, neighbors visited in adjacency-list order:

| Round | Component | Centroid | Why |
|-------|-----------|----------|-----|
| 1 | {0,1,2,3,4,5,6} | 1 | rooted at 0, size[1] = 4 > 3, so move to 1; its children have sizes 1 and 2 |
| 2 | {0,2,5} | 2 | size[2] = 2 > 1, so move to 2 |
| 2 | {3} | 3 | single node |
| 2 | {4,6} | 4 | size[6] = 1 is not > 1 |
| 3 | {0}, {5}, {6} | themselves | parents 2, 2 and 4 |

## Complexity

| Part | Time | Space |
|------|------|-------|
| One level of the recursion | O(N) | |
| Whole `build` | O(N log N) | O(N) |
| `get_centroid_tree` (Python) | O(N) | O(N) |

Why: components on one level are disjoint, so their DFS passes total at most N nodes, and there are at most floor(log2 N) + 1 levels. The recursion depth of `decompose` is only O(log N).

The implementations build the decomposition only. The per-query cost (for example "nearest marked node" in O(log N)) comes from walking the O(log N) centroid ancestors of a node, and needs per-centroid data that this code does not contain.

## When to Use

Use it when:
- the problem is about all pairs of nodes or about paths (count pairs at distance k, nearest marked node, path sums);
- the tree is static and N is around 10^5.

Do not use it when the tree changes shape (edges are added or removed), or when a plain DP on the tree is enough.

## Centroid Decomposition vs. Alternatives

| | Centroid decomposition | Heavy-light decomposition | Plain DFS per query |
|---|---|---|---|
| Idea | remove balanced separator nodes | split into heavy chains | walk the path |
| Best for | all-pairs counting, nearest marked node | online path queries and updates | tiny trees |
| Path cost | O(log N) ancestors | O(log^2 N) with a segment tree | O(N) |

## Common Pitfalls

- Forgetting the `removed` flag: the DFS walks back into earlier centroids.
- Reusing subtree sizes from the previous level; recompute them for each component.
- Taking the DFS root as the centroid; only the walk towards oversized children finds it.
- Double counting when combining pairs at a centroid: pairs inside the same child component must be excluded.
- Deep recursion: Python's version uses loops for sizes and the centroid walk, but the C++ size DFS is recursive and can overflow the stack on a very long path.
- Calling `build` on a forest: it only decomposes the component containing `root`.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `centroid_decomposition.py` | iterative size DFS and centroid walk; also `get_centroid_tree()` |
| C++ | [C++/](C++/) | `centroid_decomposition.cpp` | recursive size DFS; `getParent()` |
| Go | [Go/](Go/) | `main.go` | recursive size DFS; `GetParent()` |

No language implements a distance or nearest-marked-node query.

## Practice Problems

- [CSES - Fixed-Length Paths I](https://cses.fi/problemset/task/2080)
- [CSES - Fixed-Length Paths II](https://cses.fi/problemset/task/2081)

## Related

- [Heavy-Light Decomposition](../Heavy_Light_Decomposition/)
- [Square Root Decomposition](../Square_Root_Decomposition/)
- [Specialized Techniques overview](../)
