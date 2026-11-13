# Treap -- Python Implementation

## Files

- `treap.py`: `Treap`, plus the module-level helpers `_split`, `_merge` and `_drop_min`.
- `treap_test.py`: unit tests, including a 1000-operation randomized test and regression tests for float and huge keys.

## API

- `Treap()`: empty treap.
- `insert(key) -> bool`: `False` if the key is already present.
- `delete(key) -> bool`: `False` if the key is absent.
- `key in treap`: membership. `len(treap)`: number of keys.
- `inorder() -> list`: sorted keys.
- `check_heap_property() -> bool`: diagnostic.

## Python-Specific Notes

- Priorities are `random.random()` floats.
- Keys only need `<` and `==`, so floats and big integers work. Delete does not compute `key + 1`.
- `inorder()` and `check_heap_property()` are recursive; for a random treap the depth is O(log n).

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/Treap/Python"
python3 -m unittest treap_test
python3 treap.py
```

## Key Takeaways

- Insert is split plus two merges; delete is split, drop the minimum, merge.
- Expected O(log n) comes from the random priorities, not from any rebalancing rule.
