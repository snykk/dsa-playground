# Hash Map -- Python Implementation

`HashMap` subclasses the Hash Table class and adds iteration and helpers. See the [topic README](../README.md).

## Files

- `hash_map.py`: the `HashMap` class. It imports `HashTable` from `../../Hash Table/Python` by adding that folder to `sys.path`.
- `hash_map_test.py`: unit tests (inherited operations, iteration, repr, defaults, insert if absent with None values, update, copy).

## API

| Member | Description | Time |
|--------|-------------|------|
| everything in `HashTable` | `put`, `get`, `remove`, `contains`, `keys`, `values`, `items`, `clear`, `len`, `in`, `[]` | see Hash Table |
| `get_or_default(key, default)` | value or default | O(1) average |
| `put_if_absent(key, value)` | True if stored, False if the key exists (even with a None value) | O(1) average |
| `update(other)` | put all pairs of a `dict` or `HashMap`; other types are ignored | O(m) |
| `copy()` | independent map with the same capacity and pairs | O(m) |
| `for pair in map` | iterates `(key, value)` tuples | O(capacity + n) |
| `repr(map)` | `{key: value, ...}` | O(n) |

## Python-Specific Notes

- Iteration yields `(key, value)` tuples, unlike `dict`, which yields keys.
- `update` does not accept a list of pairs or keyword arguments, and does not complain.
- `capacity <= 0` raises `ValueError` (from `HashTable`).

## How to Run

```bash
python3 -m unittest hash_map_test
```

## Key Takeaways

- A map helper is a thin layer over lookup and insert.
- "Absent" is not the same as "stored as None".
- Iteration order follows buckets.
