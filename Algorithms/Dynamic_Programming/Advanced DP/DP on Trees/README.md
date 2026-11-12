# DP on Trees

DP on trees computes an answer for every subtree from the leaves upward, combining the answers of a node's children into the node's own. The repository solves the maximum-weight independent set and the maximum path sum in O(n) time with one post-order DFS.

## Intuition

A tree has no cycles, so the subtrees of two siblings never interact: the best answer for a subtree depends only on the subtrees of its children. Each node therefore reports a small state to its parent (one or two numbers) and the parent combines them. Because every node is expanded exactly once, the work is linear.

## Visual

```text
        1            (include, exclude)
       / \
      2   3          4: (4, 0)    5: (5, 0)    3: (3, 0)
     / \             2: (2, 9)    1: (10, 12)  -> answer 12, set {3, 4, 5}
    4   5
```

Independent set: if a node is taken its children are skipped; if it is skipped each child takes its better value.

## How It Works

1. Choose the state a subtree reports (here `(include, exclude)`, or the best downward chain).
2. Recurse into every child once and keep the result.
3. Combine:
   - Independent set: `include = val + sum(child exclude)`, `exclude = sum(max(child include, child exclude))`. The answer is `max(include, exclude)` at the root.
   - Maximum path sum: `chain(v) = val + best1`, where `best1` and `best2` are the two largest positive child chains (0 if none). The best path through `v` is `val + best1 + best2`; the answer is the maximum of that over all nodes.
4. Read the answer from the root, or from the running maximum for path problems.

## Step-by-Step Trace

Independent set on the tree above (root 1, children 2 and 3, node 2 has leaves 4 and 5):

| Node | Children | include | exclude |
|------|----------|---------|---------|
| 4 | none | 4 | 0 |
| 5 | none | 5 | 0 |
| 2 | 4, 5 | 2 + 0 + 0 = 2 | max(4,0) + max(5,0) = 9 |
| 3 | none | 3 | 0 |
| 1 | 2, 3 | 1 + 9 + 0 = 10 | max(2,9) + max(3,0) = 12 |

The answer is 12. Maximum path sum on root 10 with children 20 and 30 (30 has child 40): the chains are 40, 70 (30 + 40) and 20, and at the root `10 + 70 + 20 = 100`, the path 20, 10, 30, 40. For a star (root 1, leaves 2, 3, 4) the answer is 8, the path 3, 1, 4, because a path can use at most two children.

## Complexity

| | Time | Space |
|---|------|-------|
| `tree_dp_max_independent_set` | O(n) | O(h) |
| `tree_dp_max_path_sum` | O(n) | O(h) |

n is the number of nodes and h the height (the recursion stack): O(log n) for a balanced tree and O(n) for a chain. Each node is expanded once. Python's default recursion limit (about 1,000) is reached by a chain of more than that many nodes.

## When to Use

- Choosing nodes or edges under a neighbour constraint, best paths, diameters and per-subtree aggregates on a rooted tree.
- Not for graphs with cycles (use DP on a DAG or other methods), and take care with very deep trees (use an iterative post-order).

## Tree DP vs. Alternatives

| Approach | Time | Notes |
|----------|------|-------|
| Tree DP | O(n) | exact for adjacency constraints and path questions |
| Brute force over subsets | O(2^n) | tiny trees only |
| Greedy | varies | works for some problems but needs a proof |

## Common Pitfalls

- Taking every positive child in a path sum: a path uses at most two child chains.
- Calling the recursion twice per child, which makes the time exponential.
- Returning the through-node sum (`val + best1 + best2`) to the parent instead of the downward chain.
- If every value is negative, the best path is the largest single value, not 0.
- Empty tree: independent set returns 0 and path sum returns `-inf`.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `tree_dp.py` | Complete: independent set and maximum path sum; 9 tests |
| C++ | [C++](C++/) | `tree_dp.cpp` | Placeholder: comment-only stub, test only prints a message |
| Go | [Go](Go/) | `main.go` | Placeholder: package stub, test asserts nothing |

## Practice Problems

- [House Robber III (LeetCode 337)](https://leetcode.com/problems/house-robber-iii/)
- [Binary Tree Maximum Path Sum (LeetCode 124)](https://leetcode.com/problems/binary-tree-maximum-path-sum/)
- [Diameter of Binary Tree (LeetCode 543)](https://leetcode.com/problems/diameter-of-binary-tree/)
- [Tree Diameter (CSES)](https://cses.fi/problemset/task/1131)

## Related

- [DP on Graphs](../DP%20on%20Graphs/)
- [Bitmask DP](../Bitmask%20DP/)
- [Maximum Subarray (Kadane)](../../Linear%20DP/Maximum%20Subarray%20(Kadane's%20Algorithm)/)
- [DFS](../../../Graph_Algorithms/Traversal/DFS/)
