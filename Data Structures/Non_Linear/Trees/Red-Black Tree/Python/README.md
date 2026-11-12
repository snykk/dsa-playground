# Red-Black Tree -- Python Implementation

## Files

- `red_black_tree.py`: `Color`, `RBNode` and `RedBlackTree`.
- `red_black_tree_test.py`: unit tests, including a randomized invariant checker.

## API

- `RedBlackTree()`: empty tree with a shared black `NIL` sentinel.
- `insert(data)`: insert (duplicates allowed), then fix colors. O(log n).
- `search(data)`: `True` or `False`. O(log n).
- `inorder_traversal()`: sorted list. O(n).
- `height()`: height in nodes, 0 for an empty tree. O(n).
- `size()`, `is_empty()`.
- `find_min()`, `find_max()`: `None` when the tree is empty.

There is no delete.

## Python-Specific Notes

- Keys only need to support `<` and `==`.
- `RBNode.color` is `Color.RED` (0) or `Color.BLACK` (1).
- Traversal, search and size are recursive; recursion depth is at most about 2 log2 n, so there is no recursion-limit risk.
- Equal keys go to the right on insert, and rotations may later move an equal key to the left.

## How to Run

```bash
cd "Data Structures/Non_Linear/Trees/Red-Black Tree/Python"
python3 -m unittest red_black_tree_test
```

## Key Takeaways

- New nodes are red; the fix-up recolors or rotates so the five rules hold again.
- The tests check root color, no red-red, equal black height, key order and parent links after every insert.
