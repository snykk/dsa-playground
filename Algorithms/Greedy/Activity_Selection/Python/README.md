# Activity Selection -- Python Implementation

Greedy activity selection (earliest finish first), a weighted dynamic-programming variant and a recursive variant.

## Files

| File | Contents |
|------|----------|
| `activity_selection.py` | the three functions below |
| `activity_selection_test.py` | 11 `unittest` tests, including a brute-force comparison on random inputs and negative times |

## API

| Function | Returns |
|----------|---------|
| `activity_selection(activities)` | list of original indices of a maximum compatible set, in finish order; input is a list of `(start, finish)`; `[]` for empty input |
| `activity_selection_with_weights(activities)` | the maximum total weight; input is `(start, finish, weight)`; dynamic programming, O(n^2) |
| `activity_selection_recursive(activities)` | the same result as `activity_selection`, computed recursively; O(n^2) time and space |

```python
from activity_selection import activity_selection, activity_selection_with_weights

activity_selection([(1, 4), (3, 5), (0, 6), (5, 7), (8, 9), (5, 9)])  # [0, 3, 4]
activity_selection_with_weights([(1, 4, 10), (3, 5, 5), (0, 6, 15), (5, 7, 7)])  # 17
```

## Python-Specific Notes

- `sorted` is stable, so among activities with equal finish times the one earlier in the input is picked first. The input list is not modified.
- The recursive version slices `activities[1:]` and builds `selected + [idx]` in every call, so it copies a lot and fails with `RecursionError` on large inputs. Prefer `activity_selection`.
- `activity_selection_recursive` starts with `last_finish = float('-inf')`, so activities with negative times work (a regression test covers this).
- The weighted variant needs the sorted list; it sorts a copy.

## How to Run

```bash
cd "Algorithms/Greedy/Activity_Selection/Python"
python3 -m unittest activity_selection_test
```

## Key Takeaways

- Sort by finish time, then scan once: O(n log n).
- `start >= last_finish` allows activities that touch.
- Weights need the DP function, not the greedy one.
