# Binary Search Tree -- Python Implementation

## Files

- `bst.py`: `TreeNode` and `BinarySearchTree`.
- `bst_test.py`: unit tests, plus a 5,000-node chain (sorted input), a randomized comparison with a `set`, and traversal orders after a delete.

## API

- `insert(data)`, `search(data)`, `delete(data)`: duplicates and missing keys are ignored; `search` returns a bool.
- `find_min()`, `find_max()`: return `None` on an empty tree.
- `inorder_traversal()`, `preorder_traversal()`, `postorder_traversal()`, `level_order_traversal()`: return lists.
- `height()` in edges (empty = -1), `size()`, `is_empty()`.

```python
from bst import BinarySearchTree

t = BinarySearchTree()
for k in [50, 30, 70, 20, 40, 60, 80]:
    t.insert(k)
t.delete(50)
print(t.level_order_traversal())  # [60, 30, 70, 20, 40, 80]
```

## Python-Specific Notes

- Every operation is iterative (explicit stacks for traversals), so a chain of thousands of nodes works. The recursive version raised `RecursionError` around 1,000 sorted inserts.
- Keys can be any mutually comparable values.
- The two-child delete copies the in-order successor's value into the node.

## How to Run

```bash
python3 -m unittest bst_test
```

## Key Takeaways

- Each comparison discards a subtree; cost is the height.
- Sorted input is the worst case, so avoid recursion on trees you do not control.
- Delete has three cases; the two-child case uses the in-order successor.
