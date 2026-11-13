# Bit Manipulation -- Python Implementation

Common bit tricks as small functions. See the [topic README](../README.md) for the identities.

## Files

| File | Contents |
|------|----------|
| `bit_manipulation.py` | 13 functions and a demo `main` |
| `bit_manipulation_test.py` | Unit tests per function, including negative inputs |

## API

- `is_power_of_two(n)`, `is_even(n)`: boolean tests.
- `count_set_bits(n)`: Kernighan popcount; a negative `n` counts as a 64-bit value.
- `get_bit(n, i)`, `set_bit(n, i)`, `clear_bit(n, i)`, `toggle_bit(n, i)`
- `lowest_set_bit(n)`: `n & -n`, 0 for 0.
- `highest_set_bit(n)`: position, or -1 for `n <= 0`.
- `count_differing_bits(a, b)`: Hamming distance.
- `swap_without_temp(a, b)`: returns the tuple `(b, a)`.
- `next_power_of_two(n)`: smallest power of two `>= n`, 1 for `n <= 1`.
- `subset_generation(n)`: all 2^n subsets as lists of indices, in mask order.

## Python-Specific Notes

- Integers have unlimited size, so shifts never overflow.
- A negative int has infinitely many sign bits; `count_set_bits` masks negatives to 64 bits so the loop ends.
- `subset_generation` is O(n * 2^n) time and builds the whole result in memory.

## How to Run

```bash
python3 -m unittest bit_manipulation_test
python3 bit_manipulation.py
```

## Key Takeaways

- `n & (n - 1)` clears the lowest set bit and drives popcount.
- Always pair the power-of-two test with `n > 0`.
- Mask negatives before looping over bits in Python.
