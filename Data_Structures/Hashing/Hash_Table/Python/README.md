# Hash Table -- Python Implementation

A chaining hash table with a doubling resize and dict-style access. See the [topic README](../README.md).

## Files

- `hash_table.py`: the `HashTable` class.
- `hash_table_test.py`: unit tests, including forced collisions, resize, None values, invalid capacity, negative keys, the map helpers and random operations checked against `dict`.

## API

| Member | Description | Time |
|--------|-------------|------|
| `HashTable(capacity=16)` | `ValueError` if capacity is not positive | O(capacity) |
| `put(key, value)` / `table[key] = value` | insert or update; resize at load > 0.75 | O(1) amortized |
| `get(key, default=None)` | value or default | O(1) average |
| `table[key]` | value, `KeyError` if absent | O(1) average |
| `remove(key)` / `del table[key]` | True if removed (`del` raises `KeyError`) | O(1) average |
| `contains(key)` / `key in table` | presence, even when the stored value is None | O(1) average |
| `keys()`, `values()`, `items()` | lists in bucket order | O(capacity + n) |
| `clear()`, `is_empty()`, `len(table)` | bookkeeping | O(1) |
| `get_or_default(key, default)` | value or default (a stored None is returned as None) | O(1) average |
| `put_if_absent(key, value)` | True if inserted, False if the key exists (even with None) | O(1) average |
| `update(other)` | put every pair of a `dict` or `HashTable` | O(m) |
| `copy()` | independent table, same capacity | O(m) |
| `for k, v in table`, `repr(table)` | iterate `(key, value)` pairs in bucket order | O(capacity + n) |

## Python-Specific Notes

- Integers hash as `key mod capacity` (always non-negative in Python), strings as `h*31 + c` reduced at each step, other keys with the built-in `hash()`.
- A private sentinel (`_MISSING`) separates "absent" from a stored None, so `in` and `table[key]` are correct for None values.
- Iteration order follows the buckets and changes after a resize.
- For real code use `dict`: it is implemented in C and handles collisions differently.

## How to Run

```bash
python3 -m unittest hash_table_test
```

## Key Takeaways

- One bucket lookup plus a short walk gives O(1) on average.
- Doubling makes resizing cheap on average.
- Never test membership through the value.
