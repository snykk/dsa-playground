# Bloom Filter -- Python Implementation

A Bloom filter with k hash functions derived from MD5. See the [topic README](../README.md).

## Files

- `bloom_filter.py`: the `BloomFilter` class.
- `bloom_filter_test.py`: tests for add/contains, no false negatives, sizing, invalid arguments, tiny filters and the measured false positive rate.

## API

| Member | Description | Time |
|--------|-------------|------|
| `BloomFilter(capacity, error_rate=0.01)` | `ValueError` if capacity <= 0 or error_rate not in (0, 1) | O(m) |
| `add(item)` | set k bits for `str(item)` | O(k) |
| `contains(item)` / `item in bf` | maybe present (True) or definitely not (False) | O(k) |
| `get_stats()` | dict: capacity, num_bits, num_hashes, set_bits, load | O(m) |

## Python-Specific Notes

- Items are converted with `str(item)`, so `add(1)` makes `contains("1")` true.
- Position i is `md5(str(item) + str(i)) mod m`. Slower than double hashing but simple.
- Bits live in a `bytearray` (one byte per bit), not a packed bitset.
- `m = ceil(-n ln p / (ln 2)^2)` and `k = max(1, round(m ln 2 / n))`.

## How to Run

```bash
python3 -m unittest bloom_filter_test
```

## Key Takeaways

- "No" is certain, "yes" is only "maybe".
- Size the filter for the expected item count.
- There is no delete.
