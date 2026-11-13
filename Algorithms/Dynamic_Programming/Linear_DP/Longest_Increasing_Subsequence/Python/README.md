# Longest Increasing Subsequence -- Python Implementation

Four ways to find the LIS, from exponential recursion to O(n log n).

## Files

| File | Contents |
|------|----------|
| `lis.py` | the functions below |
| `lis_test.py` | `unittest` cases |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `lis_naive(arr)` | length by take-or-skip recursion | O(2^n) | O(n) |
| `lis_dp(arr)` | length by the `dp[i]` table | O(n^2) | O(n) |
| `lis_binary_search(arr)` | length by the sorted tails array and `bisect_left` | O(n log n) | O(n) |
| `lis_with_sequence(arr)` | `(length, sequence)` using a parent array | O(n^2) | O(n) |

All return 0 (or `(0, [])`) for an empty list, and all treat the subsequence as strictly increasing.

```python
from lis import lis_dp, lis_binary_search, lis_with_sequence

arr = [10, 9, 2, 5, 3, 7, 101, 18]
print(lis_dp(arr))               # 4
print(lis_binary_search(arr))    # 4
print(lis_with_sequence(arr))    # (4, [2, 5, 7, 101])
```

## Python-Specific Notes

- `lis_binary_search` uses the standard `bisect` module; `bisect_left` is what makes equal values non-increasing.
- `lis_naive` has no memoization and also recurses `n` deep, so keep it to small inputs.
- `lis_with_sequence` starts from the first index with the maximum `dp`, so on ties it follows the earliest end.
- Integers are unbounded; values only need to be comparable.

## How to Run

From this folder:

```bash
python3 -m unittest lis_test
```

## Key Takeaways

- The answer is the maximum over all `dp[i]`.
- The tails array gives the length but is not a subsequence of the input.
- Strictness comes from `<` and `bisect_left`.
