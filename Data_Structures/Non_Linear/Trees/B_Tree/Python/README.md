# B-Tree -- Python Implementation

A B-tree of minimum degree `t`: nodes hold `t - 1` to `2t - 1` sorted keys (the root at least one), internal nodes included, and all leaves share one depth. See the [topic README](../README.md) for the algorithms.

## Files

| File | Contents |
| ---- | -------- |
| `b_tree.py` | `BTreeNode` and `BTree` (insert with proactive splits, delete with borrow and merge, search, traverse) |
| `b_tree_test.py` | unit tests, regression tests for the delete bug, and a randomized test against a sorted reference with an invariant checker |

## API

| Call | Result |
| ---- | ------ |
| `BTree(min_degree=3)` | empty tree; `max_keys = 2t - 1`, `min_keys = t - 1` |
| `insert(key)` | adds a key in one downward pass; an existing key is stored again |
| `search(key)` | `(node, index)` where `node.keys[index] == key`, or `None` |
| `delete(key)` | removes one copy; does nothing if absent |
| `traverse()` | list of all keys in sorted order |

## Python-Specific Notes

- Keys can be any mutually comparable values, not only numbers.
- `search` exposes the internal node object; do not mutate it.
- The recursion depth is the tree height, which stays tiny even for millions of keys.
- Delete merges a deficient last child with its left sibling and any other child with its right sibling; after a merge it re-selects the child to descend into.

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/B_Tree/Python"
python3 -m unittest b_tree_test
```

## Key Takeaways

- Splits happen before descending, so insert never walks back up.
- Delete keeps every node it enters above the minimum, using borrow or merge.
- The random test checks fill bounds, key order and equal leaf depth against a sorted list.
