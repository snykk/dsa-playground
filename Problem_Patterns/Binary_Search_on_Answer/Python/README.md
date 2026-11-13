# Binary Search on Answer -- Python Implementation

Binary search over the answer range with a greedy feasibility check. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `binary_search_on_answer.py` | The search and three problems |
| `binary_search_on_answer_test.py` | Unit tests, including infeasible inputs and a brute-force comparison |

## API

- `binary_search_answer(left, right, check)`: smallest value in `[left, right]` with `check` True, or `-1`.
- `find_min_capacity(weights, days)`: least ship capacity to ship in order within `days`; `-1` if `days < 1`.
- `split_array_largest_sum(nums, m)`: least possible largest sum when splitting into at most `m` parts; `-1` if `m < 1`.
- `find_kth_smallest_distance(nums, k)`: k-th smallest pair distance, or `-1` when fewer than `k` pairs exist.

## Python-Specific Notes

- Integers never overflow, so bounds can be the plain sum.
- `find_kth_smallest_distance` sorts the caller's list in place and runs its own loop with a two-pointer count; the other functions call `binary_search_answer`.
- Empty input raises (`ValueError` from `max`, `IndexError` in the k-th distance function).
- Compatible with Python 3.9 and newer.

## How to Run

```bash
python3 -m unittest binary_search_on_answer_test
python3 binary_search_on_answer.py
```

## Key Takeaways

- Prove the check is monotone before writing the loop.
- Initialise `result` to `-1` so "nothing feasible" is distinguishable from an answer.
- The check is the problem; the search is boilerplate.
