# B+ Tree -- Python Implementation

A B+ tree of minimum degree `t`: all data in linked leaves, internal nodes hold separators only. See the [topic README](../README.md) for the algorithms.

## Files

| File | Contents |
| ---- | -------- |
| `b_plus_tree.py` | `BPlusTreeNode` and `BPlusTree` |
| `b_plus_tree_test.py` | unit tests, regression tests (duplicate keys, string keys) and a randomized test against a dict with an invariant checker |

## API

| Call | Result |
| ---- | ------ |
| `BPlusTree(min_degree=3)` | empty tree |
| `insert(key, value)` | stores the pair; an existing key has its value overwritten |
| `search(key)` | the value, or `None` |
| `range_search(start_key, end_key)` | list of `(key, value)` with `start_key <= key <= end_key`, in key order |
| `traverse()` | list of all `(key, value)` pairs in key order |

There is no delete.

## Python-Specific Notes

- Keys can be any mutually comparable values (numbers, strings). `traverse` starts at the leftmost leaf by following `children[0]`, so it does not depend on numeric keys.
- A stored value of `None` cannot be told apart from a missing key by `search`.
- Leaf `next` pointers are plain object references; there is nothing to free.

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/B_Plus_Tree/Python"
python3 -m unittest b_plus_tree_test
```

## Key Takeaways

- Leaf splits copy the separator up; internal splits push the median up.
- Equal keys descend to the right, and a search always ends in a leaf.
- Range queries are one descent plus a walk along `next`.
