# DP Problem Patterns -- Python Implementation

Three space-optimized DPs: 0/1 knapsack, longest common subsequence and longest increasing subsequence.

## Files

| File | Description |
|------|-------------|
| `dp_patterns.py` | `knapsack_01`, `lcs`, `lis` and a demo `main` |
| `dp_patterns_test.py` | `unittest` tests (5) |

## API

- `knapsack_01(weights, values, capacity)`: the maximum total value with total weight at most `capacity`, each item used once. O(N * W) time, O(W) space. A zero-weight item fits in capacity 0.
- `lcs(text1, text2)`: the length of the longest common subsequence. O(N * M) time, O(min(N, M)) space.
- `lis(nums)`: the length of the longest strictly increasing subsequence, via `bisect_left` on a `tails` list. O(N log N) time. `lis([])` is 0 and `lis([7, 7, 7])` is 1.

```python
from dp_patterns import knapsack_01, lcs, lis

print(knapsack_01([1, 3, 4, 5], [1, 4, 5, 7], 7))   # 9
print(lcs("abcde", "ace"))                           # 3
print(lis([10, 9, 2, 5, 3]))                         # 2
```

## Python-Specific Notes

- `lis` returns only the length; `tails` is not itself a subsequence.
- `lcs` swaps the strings so the inner loop runs over the shorter one, and copies the current row into the previous one with a slice assignment.
- Plain lists and integers: no overflow, and the capacity must be non-negative.

## How to Run

From this folder:

```bash
python3 -m unittest dp_patterns_test
python3 dp_patterns.py
```

## Key Takeaways

- A one-dimensional knapsack array works because capacities are processed from high to low.
- The two-row LCS keeps memory small but cannot reconstruct the subsequence.
- `tails` with a binary search turns LIS from O(N^2) into O(N log N).
