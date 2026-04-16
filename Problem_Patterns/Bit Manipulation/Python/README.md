# Bit Manipulation Patterns (Python)

Python implementation of common bit manipulation techniques.

## Files

| File | Description |
|------|-------------|
| `bit_manipulation.py` | Main implementation with 13 utility functions |
| `bit_manipulation_test.py` | Test cases |

## How to Run

```bash
python bit_manipulation.py       # Run demo
python bit_manipulation_test.py  # Run tests
```

## Key Functions

| Function | Description | Time |
|----------|-------------|------|
| `is_power_of_two(n)` | Check if n is a power of 2 | O(1) |
| `count_set_bits(n)` | Count 1-bits (Brian Kernighan) | O(k) |
| `get_bit(n, i)` | Get i-th bit value | O(1) |
| `set_bit(n, i)` | Set i-th bit to 1 | O(1) |
| `clear_bit(n, i)` | Clear i-th bit to 0 | O(1) |
| `toggle_bit(n, i)` | Toggle i-th bit | O(1) |
| `lowest_set_bit(n)` | Isolate lowest set bit | O(1) |
| `highest_set_bit(n)` | Position of highest set bit | O(log n) |
| `count_differing_bits(a, b)` | Hamming distance | O(k) |
| `swap_without_temp(a, b)` | XOR swap | O(1) |
| `next_power_of_two(n)` | Next power of 2 >= n | O(log n) |
| `subset_generation(n)` | Generate all bitmask subsets | O(2^n) |

---

_Last Updated: April 2026_
