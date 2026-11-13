# Splay Tree -- Python Implementation

## Files

- `splay_tree.py`: `SplayNode` and `SplayTree`.
- `splay_tree_test.py`: unit tests, including a randomized comparison with a dict and a parent-pointer check.

## API

- `SplayTree()`: empty tree.
- `insert(key, value=None)`: insert or overwrite, then splay.
- `search(key)`: the stored value, or `None` on a miss (the last visited node is still splayed). Note that a stored `None` value looks like a miss.
- `delete(key)`: `True` if removed, `False` if absent (the last visited node is splayed).
- `find_min()`, `find_max()`: the key (splayed to the root), or `None` when empty.
- `inorder_traversal()`: sorted keys. `size()`, `is_empty()`.
- `root`: the root node, public for inspection.

## Python-Specific Notes

- Keys only need `<` and `==`; values can be anything.
- `inorder_traversal()` and `size()` are iterative, so a tree built from 5000 sorted inserts (a path) is fine.
- Rotations and splaying are iterative as well.

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/Splay_Tree/Python"
python3 -m unittest splay_tree_test
```

## Key Takeaways

- Every operation, hit or miss, splays a node.
- Delete is split and join; clear parent pointers before splaying inside the left subtree.
