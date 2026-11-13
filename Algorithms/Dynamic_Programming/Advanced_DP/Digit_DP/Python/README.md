# Digit DP -- Python Implementation

Counts the numbers in `0..n` whose decimal digit sum equals a target, using a memoized recursion over `(position, tight, sum)`.

## Files

| File | Description |
|------|-------------|
| `digit_dp.py` | `count_numbers_with_digit_sum` |
| `digit_dp_test.py` | `unittest` tests (5), including a brute-force comparison |

## API

- `count_numbers_with_digit_sum(n, target_sum)`: the count of integers `x` with `0 <= x <= n` and digit sum equal to `target_sum`. Returns 0 when `n < 0`. Time O(d * target_sum * 10), space O(d * target_sum), where d is the number of digits of `n`.

For a range `[L, R]`:

```python
from digit_dp import count_numbers_with_digit_sum as count

in_range = count(100, 5) - count(10 - 1, 5)   # 6 - 1 = 5: 14, 23, 32, 41, 50
```

## Python-Specific Notes

- The memo is a dictionary created inside each call, so different bounds never share entries.
- Python integers do not overflow, so `n` can be far above 10^18; recursion depth is the number of digits.
- `n = 0` counts the number 0 (digit sum 0), so `count(0, 0)` is 1.
- Only digit sum is implemented. Other rules need a different state; see the topic README.

## How to Run

From this folder:

```bash
python3 -m unittest digit_dp_test
```

## Key Takeaways

- The tight flag is part of the memo key because a tight state and a free state differ.
- Prune on `sum + d <= target` to keep the state space small.
- Subtracting `count(L - 1)` gives range counts, and `count(-1)` is 0.
