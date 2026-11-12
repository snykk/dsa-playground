# Meet in the Middle -- Python Implementation

The largest subset sum that does not exceed a target, using meet in the middle with a sorted half and binary search.

## Files

| File | Description |
|------|-------------|
| `meet_in_middle.py` | `get_subset_sums`, `closest_subset_sum` and a demo `main` |
| `meet_in_middle_test.py` | `unittest` tests (7), including a brute-force comparison |

## API

- `get_subset_sums(arr)`: all 2^len(arr) subset sums, starting with the empty subset (0). O(2^n).
- `closest_subset_sum(nums, target)`: the largest subset sum `<= target` (the empty subset counts, so the result is at least 0). O(2^(n/2) * n) time, O(2^(n/2)) space. Returns 0 for an empty list. Raises `ValueError` if any number is negative (the pruning needs non-negative values) or if `target` is negative (no subset qualifies).

```python
from meet_in_middle import closest_subset_sum

print(closest_subset_sum([5, 3, 2, 7, 10], 14))    # 14  (5 + 2 + 7)
print(closest_subset_sum([5, 3, 2, 7, 10], 1))     # 0   (only the empty subset fits)
```

## Python-Specific Notes

- The array is split at `n // 2`; the right half's sums are sorted and searched with `bisect.bisect_right`.
- Sums are Python integers, so there is no overflow. Memory is the limit: each half holds 2^(n/2) integers.
- This version answers "closest below the target", not "exact": the exact-sum question is answered by the C++ and Go versions.

## How to Run

From this folder:

```bash
python3 -m unittest meet_in_middle_test
python3 meet_in_middle.py
```

## Key Takeaways

- Split in two, enumerate both halves, join with a sort and a binary search.
- The pruning `l_sum > target` is only valid for non-negative numbers, so the function checks them.
- The cost is exponential in n/2, not in n.
