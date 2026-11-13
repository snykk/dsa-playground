# Cartesian Tree -- Python Implementation

## Files

- `cartesian_tree.py`: `CartesianNode` and `CartesianTree`.
- `cartesian_tree_test.py`: build, heap order, empty and single inputs, sorted and duplicate inputs, traversals, range queries compared with brute force on every range, and a 5,000-node chain.

## API

- `CartesianTree(array=None)`, `build_from_array(array)`: O(n) stack build.
- `get_min_index(left, right)`: index of the minimum in `array[left..right]` (leftmost on ties); -1 for an empty tree or when `left < 0`, `right >= len(array)` or `left > right`. O(h).
- `inorder_traversal()`, `preorder_traversal()`, `postorder_traversal()`: lists of values.
- `height()` in edges (empty = -1), `size()`, `is_empty()`.
- `root`: the root node (`root.value`, `root.index`); there is no `get_root_value`.

```python
from cartesian_tree import CartesianTree

a = [9, 3, 7, 1, 8, 12, 10, 20, 15, 18, 5]
t = CartesianTree(a)
print(t.inorder_traversal() == a)  # True
print(t.get_min_index(4, 8))       # 4 (value 8)
```

## Python-Specific Notes

- Traversals, height and size are iterative, so sorted input (a chain) does not raise `RecursionError`.
- The tree keeps a copy of the array for range validation.
- Values can be any mutually comparable type.

## How to Run

```bash
python3 -m unittest cartesian_tree_test
```

## Key Takeaways

- A range minimum is the LCA of its ends; walk down from the root.
- The stack build is linear because each element is popped at most once.
- Sorted input makes a chain, so avoid recursion.
