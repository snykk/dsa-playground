# Binary Search on Answer

Binary search on the *range of possible answers* instead of on an array. When a yes/no check "is X big enough?" is monotone, the smallest X that passes is found in O(log R) checks, so "minimize the maximum" problems cost O(C log R), where C is the cost of one check and R the size of the answer range.

## Intuition

Finding the best answer directly is hard; deciding whether a given answer is good enough is usually easy. If feasibility flips from False to True exactly once as X grows, the feasible values form a suffix of the range, and binary search finds its first element.

The invariant: every value below `left` is infeasible, `result` is the smallest feasible value seen so far, and each probe halves the range without losing the boundary.

Signals in a problem statement: "minimize the maximum", "maximize the minimum", "the least capacity / speed that finishes in D days", "the k-th smallest among many candidates", and a checker that is a single greedy pass.

## Visual

```text
answer:       10 11 12 13 14 15 16 17 18 19 ...  55
check(x):      F  F  F  F  F  T  T  T  T  T  ...  T
                               ^
                               first True = answer (15)
days needed:   7  6  6  6  6  5  5  4  4  4        (limit: 5 days)
```

## How It Works

1. Choose `left` and `right` so the answer is inside (ship capacity: `max(weights)` to `sum(weights)`).
2. Write `check(x)`: a greedy pass that says whether x works.
3. Probe `mid = left + (right - left) / 2`. If `check(mid)` is True, remember it and set `right = mid - 1`; otherwise set `left = mid + 1`.
4. When `left > right`, return the remembered value, or `-1` if no value worked.

```text
result = -1
while left <= right:
    mid = left + (right - left) / 2
    if check(mid): result = mid; right = mid - 1
    else:          left = mid + 1
return result
```

For "largest feasible x", keep `mid` and move `left = mid + 1` on True.

## Step-by-Step Trace

Ship `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]` in at most 5 days. The range is `[10, 55]`.

| left | right | mid | days needed | check(mid) |
|------|-------|-----|-------------|------------|
| 10 | 55 | 32 | 2 | True, keep 32 |
| 10 | 31 | 20 | 4 | True, keep 20 |
| 10 | 19 | 14 | 6 | False |
| 15 | 19 | 17 | 4 | True, keep 17 |
| 15 | 16 | 15 | 5 | True, keep 15 |
| 15 | 14 | stop | | answer 15 |

## Complexity

| Part | Time | Space |
|------|------|-------|
| Search loop | O(log R) probes | O(1) |
| Whole algorithm | O(C log R) | O(1) plus the check |
| Capacity / split problems | O(n log(sum)) | O(1) |
| k-th pair distance | O(n log n + n log D) | O(1) |

Each probe halves the range, so 10^9 candidates need about 30 probes.

## When to Use

Use it when the answer is a number in a known range, a candidate is cheap to verify, and feasibility is monotone in the candidate. Do not use it when increasing the candidate can make a feasible answer infeasible again, or when there is a direct formula.

## Binary Search on Answer vs. Alternatives

| Approach | Searches | Needs | Typical cost |
|----------|----------|-------|--------------|
| Binary search on answer | answer range | monotone check | O(C log R) |
| Binary search on array | sorted array | sorted input | O(log n) |
| Dynamic programming | all splits | optimal substructure | often O(n^2) or worse |
| Linear scan of answers | answer range | a check | O(C * R) |

## Common Pitfalls

- A non-monotone check gives silently wrong answers; verify the property on small cases.
- `left` above or `right` below the true answer skips it.
- Mixing `right = mid - 1` with `left < right` (or `right = mid` with `left <= right`) loops forever.
- Returning an end of the range when nothing is feasible; the code here returns `-1`.
- 32-bit overflow when summing weights; use 64-bit bounds when sums are large.
- `find_kth_smallest_distance` sorts the caller's list in Python and C++ (Go sorts a copy). Empty input raises in Python, is undefined in C++ and returns 0 in Go.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `binary_search_on_answer.py` | k-th distance runs its own loop; raises on empty input |
| C++ | [C++/](C++/) | `binary_search_answer.cpp` | `std::function` check; no empty-input guard |
| Go | [Go/](Go/) | `main.go` | copies before sorting; closures as checks |

## Practice Problems

- LeetCode 1011, Capacity to Ship Packages Within D Days
- LeetCode 410, Split Array Largest Sum
- LeetCode 875, Koko Eating Bananas
- LeetCode 719, Find K-th Smallest Pair Distance

## Related

- [Binary Search](../../Algorithms/Searching/Binary_Search/)
- [Greedy Algorithms](../../Algorithms/Greedy/)
- [Two Pointers](../Two_Pointers/)
- [Sliding Window](../Sliding_Window/)
