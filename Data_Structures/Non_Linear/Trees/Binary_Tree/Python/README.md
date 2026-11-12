# Binary Tree -- Python Implementation

## Files

- `binary_tree.py`: `TreeNode` and `BinaryTree`.
- `binary_tree_test.py`: unit tests for insert, search, the four traversals, height and size, a 7-node tree with every traversal, and a 1,000-node height check.

## API

- `insert(data)`: level-order insert into the first free slot.
- `search(data)`: returns a bool; O(n).
- `inorder_traversal()`, `preorder_traversal()`, `postorder_traversal()`, `level_order_traversal()`: return lists.
- `height()` in edges (empty = -1), `size()`, `is_empty()`.

```python
from binary_tree import BinaryTree

t = BinaryTree()
for i in range(1, 8):
    t.insert(i)
print(t.inorder_traversal())     # [4, 2, 5, 1, 6, 3, 7]
print(t.level_order_traversal()) # [1, 2, 3, 4, 5, 6, 7]
```

## Python-Specific Notes

- Insert and level order use `collections.deque`.
- Traversals are recursive. The tree is always complete, so the depth stays near log2(n) and the recursion limit is not reached.
- Values can be any type that supports `==`.

## How to Run

```bash
python3 -m unittest binary_tree_test
```

## Key Takeaways

- Pre-, in- and post-order differ only in when the node is visited.
- Level order needs a queue and uses O(width) space.
- No ordering means O(n) search.
