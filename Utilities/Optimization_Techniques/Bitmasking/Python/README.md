# Bitmasking -- Python Implementation

Bit operations, subset enumeration, bitmask DP and bit tricks as plain functions.

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `bitmasking.py` | the functions below, plus a small demo |
| `bitmasking_test.py` | 19 tests: bit operations, subsets (including `k = 0`), TSP (including one and zero cities), power-of-two helpers beyond 32 bits, subset sums, SOS DP with non-power-of-two lengths |

## API

- `get_bit`, `set_bit`, `clear_bit`, `toggle_bit`, `count_bits`, `lowest_set_bit`, `clear_lowest_bit`.
- `enumerate_subsets(mask)`: generator over all submasks, empty set last.
- `subsets_of_size_k(n, k)`: generator over masks with `k` bits (Gosper's hack); `k = 0` yields only `0`.
- `tsp(dist)`: shortest tour starting and ending at city 0; returns 0 for 0 or 1 city.
- `count_subset_sum(nums, target)`: number of subsets with that sum.
- `is_power_of_2(n)`, `next_power_of_2(n)` (any width), `log2_floor(n)`, `log2_ceil(n)`.
- `sos_dp(a)`: sum over subsets for any list length.
- `meet_in_middle_subset_sum(nums, target)`: does any subset reach the target.

## Python-Specific Notes

- Integers are unbounded: no overflow, and `next_power_of_2` uses `bit_length` instead of a shift-or ladder.
- `tsp` uses `float('inf')` as the unreachable value, so it returns `inf` for a disconnected input.
- Enumeration is lazy (generators); only `sos_dp` and `tsp` allocate tables.
- Cost per operation is far higher than in C++; use it for correctness and small n.

## How to Run

```bash
python3 -m unittest bitmasking_test
python3 bitmasking.py        # demo
```

## Key Takeaways

1. A set is an integer; the loop `(sub - 1) & mask` walks its submasks.
2. Process masks in increasing order for DP.
3. Handle the edge cases (k = 0, one city, non-power-of-two lengths) explicitly.
