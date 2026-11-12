# DP on Trees -- Python Implementation

Two tree DPs over a rooted tree of `TreeNode` objects: maximum-weight independent set and maximum path sum.

## Files

| File | Description |
|------|-------------|
| `tree_dp.py` | `TreeNode`, `tree_dp_max_independent_set`, `tree_dp_max_path_sum` |
| `tree_dp_test.py` | `unittest` tests (9), including a check that each node is expanded once |

## API

- `TreeNode(val=0, children=None)`: a node with a value and a list of child nodes.
- `tree_dp_max_independent_set(root)`: the maximum sum of node values with no two chosen nodes adjacent (parent and child). Returns 0 for `None`. The empty selection is allowed, so an all-negative tree gives 0. Time O(n).
- `tree_dp_max_path_sum(root)`: the maximum sum over paths with at least one node, any start and end, each node used once. Uses at most two child chains at a node. Returns `float('-inf')` for `None`. Time O(n).

```python
from tree_dp import TreeNode, tree_dp_max_independent_set, tree_dp_max_path_sum

root = TreeNode(10, [TreeNode(20), TreeNode(30, [TreeNode(40)])])
print(tree_dp_max_independent_set(root))   # 60  (20 + 40)
print(tree_dp_max_path_sum(root))          # 100 (20, 10, 30, 40)
```

## Python-Specific Notes

- Both functions are recursive, so a tree deeper than about 1,000 levels raises `RecursionError` unless the limit is raised.
- Nodes hold any number of children (a general rooted tree, not only binary).
- The path function keeps the two largest positive child chains; negative chains are never taken, so an all-negative tree returns the largest single value.

## How to Run

From this folder:

```bash
python3 -m unittest tree_dp_test
```

## Key Takeaways

- Visit each child once and reuse the result; a second call per child is exponential.
- A path through a node uses at most two child chains; the parent can extend only one.
- Independent set needs two values per node because the parent's choice constrains the child.
