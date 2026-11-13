# Skip List -- Python Implementation

## Files

| File | Contents |
| --- | --- |
| `skip_list.py` | `Node` and `SkipList` |
| `skip_list_test.py` | unit tests, including a randomized check of the level invariants |

## API

- `SkipList(max_level=16, p=0.5)`: empty list with a header on every level.
- `insert(key)`: add `key`; an existing key is ignored. Expected O(log n).
- `search(key)`: `True` if present. Expected O(log n).
- `delete(key)`: remove `key`; returns `True` if it was present, `False` otherwise.
- `display()`: sorted list of all keys (walks level 0).

## Python-Specific Notes

- Heights come from `random.random()`; seed `random` to make a run repeatable.
- `Node.forward` is a list with one slot per level (`height + 1` entries); the header has `max_level + 1`.
- The header key `-1` is a placeholder and is never compared with a real key, so negative keys work.
- Keys must be mutually comparable with `<` and `==`; the tests use integers.

## How to Run

```bash
cd "Data Structures/Linear/Linked List/Skip List/Python"
python3 -m unittest skip_list_test
```

## Key Takeaways

- Level 0 is the whole list; upper levels are shortcuts.
- `update` records the predecessor on every level for insert and delete.
- Lower `level` after a delete so searches do not start on empty levels.
