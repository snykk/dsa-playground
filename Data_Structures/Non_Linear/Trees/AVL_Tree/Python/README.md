# AVL Tree -- Python Implementation

## Files

- `avl_tree.py`: `AVLNode` and `AVLTree`.
- `avl_tree_test.py`: unit tests, a randomized insert and delete test that recomputes every height and checks the balance factors, and traversal order tests.

## API

- `insert(data)`, `search(data)`, `delete(data)`: duplicates and missing keys are ignored; `search` returns a bool.
- `find_min()`, `find_max()`: return `None` on an empty tree.
- `inorder_traversal()`, `preorder_traversal()`, `postorder_traversal()`, `level_order_traversal()`: return lists.
- `height()` (leaf = 1, empty = 0), `size()`, `is_empty()`, `is_balanced()`.

```python
from avl_tree import AVLTree

t = AVLTree()
for k in [10, 20, 30, 40, 50, 25]:
    t.insert(k)
print(t.level_order_traversal())  # [30, 20, 40, 10, 25, 50]
t.delete(40)
print(t.inorder_traversal())      # [10, 20, 25, 30, 50]
```

## Python-Specific Notes

- Keys can be any mutually comparable values.
- Recursion depth equals the tree height (about log n), so the default recursion limit is never a problem.
- `is_balanced()` reads the stored heights; the tests recompute them independently.

## How to Run

```bash
python3 -m unittest avl_tree_test
```

## Key Takeaways

- Rebalance on the way back up after every change.
- Four cases, two rotations: choose by the heavy child's balance factor.
- The height stays within 1.44 log2(n + 2), even for sorted input.
