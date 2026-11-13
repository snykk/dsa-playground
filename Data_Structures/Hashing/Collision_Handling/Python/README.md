# Collision Handling -- Python Implementation

Chaining, linear probing and quadratic probing. See the [topic README](../README.md).

## Files

- `collision_handling.py`: `HashTableChaining`, a shared base `_OpenAddressing`, and its subclasses `HashTableOpenAddressing` (linear) and `HashTableQuadraticProbing`.
- `collision_handling_test.py`: tests, including forced collisions, tombstones, wrap-around, a full table and a differential test against `dict`.

## API

| Member | Description |
|--------|-------------|
| `HashTableChaining(capacity=16)` | `put`, `get` (None if absent), `remove` (True if removed), `size` |
| `HashTableOpenAddressing(capacity=16)` | linear probing; same methods |
| `HashTableQuadraticProbing(capacity=16)` | triangular-number probing; same methods |

`put` raises `Exception("Hash table is full")` for a new key in a full open-addressing table. Capacity 0 or less raises `ValueError`.

## Python-Specific Notes

- Open addressing walks the whole probe sequence once (`_probe`), remembering the first tombstone, so `put` never duplicates a key.
- `get` returns None for a missing key, so a stored None value is indistinguishable from a miss.
- Integers hash as `key mod capacity` (non-negative in Python), strings with `h*31 + c`, other keys with built-in `hash()`.

## How to Run

```bash
python3 -m unittest collision_handling_test
```

## Key Takeaways

- Tombstones keep probe sequences intact after a delete.
- Triangular steps cover a power-of-two table; plain squares do not.
- Check the whole sequence before inserting.
