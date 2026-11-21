# Hash Set -- Python Implementation

A chaining hash set that doubles its buckets at load 0.75. See the [topic README](../README.md).

## Files

- `hash_set.py`: the `HashSet` class.
- `hash_set_test.py`: unit tests (add, remove, contains, iteration, clear, a chain longer than one, resize, invalid capacity).

## API

| Member | Description | Time |
|--------|-------------|------|
| `HashSet(capacity=16)` | `ValueError` if capacity is not positive | O(capacity) |
| `add(x)` | True if new, False if already present | O(1) amortized |
| `remove(x)` | True if removed | O(1) average |
| `contains(x)` / `x in s` | membership | O(1) average |
| `is_empty()`, `len(s)` | bookkeeping | O(1) |
| `clear()` | a fresh empty list per bucket | O(capacity) |
| `to_list()`, `for x in s`, `repr(s)` | elements in bucket order | O(capacity + n) |

## Python-Specific Notes

- Buckets are lists, and membership inside a bucket uses `==`.
- Integers hash as `x mod capacity`, strings as `h*31 + c`, others with `hash()`.
- For real code use the built-in `set`.

## How to Run

```bash
python3 -m unittest hash_set_test
```

## Key Takeaways

- `add` returning a boolean gives duplicate detection for free.
- Resizing keeps the chains short.
- No order is guaranteed.
