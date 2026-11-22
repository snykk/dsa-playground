# Interpolation Search

Interpolation Search finds a value in a **sorted** array by estimating its position from the values at the ends of the search range, like looking up a name in a phone book. On evenly spread numeric keys it needs about O(log log n) probes; on skewed keys it can degrade to O(n).

## Intuition

Binary Search always probes the middle and ignores the actual values. If the keys are spread evenly, the value you want tells you where it is: 70 in `10, 20, ..., 100` is about 60 percent of the way along. Interpolation Search draws a straight line from `(left, arr[left])` to `(right, arr[right])` and probes where it reaches the target.

The invariant is the same as in Binary Search: if the target is in the array, it is inside `arr[left..right]`. Only the probe differs, so the result is always correct; the key distribution decides how fast it is.

## Visual

```text
value
 100 |                                    *            a[right]
  90 |                               *
  80 |                          *
  70 |                     *  <-- probe: the line meets the target
  60 |                *
  50 |           *
  ...|      *
  10 | *                                            a[left]
     +------------------------------------------> index
       0                   6                  9
```

## How It Works

1. While `left <= right` and `arr[left] <= target <= arr[right]`:
2. If `left == right` or `arr[left] == arr[right]` (a flat window), return `left` if `arr[left] == target`, else -1. This also prevents a division by zero.
3. Estimate `pos = left + (target - arr[left]) * (right - left) / (arr[right] - arr[left])`, rounded down.
4. If `arr[pos] == target`, return `pos`. If `arr[pos] > target`, set `right = pos - 1`; otherwise set `left = pos + 1`.
5. If the loop ends, return -1.

## Step-by-Step Trace

Evenly spread: search 70 in `[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]`. `pos = 0 + (70 - 10) * 9 / 90 = 6`, and `arr[6] = 70`: found after one probe.

Skewed: search 64 in `[1, 2, 4, 8, 16, 32, 64, 128, 256, 512]` (probes from the Python code):

| Probe | left | right | pos | arr[pos] | Decision |
|-------|------|-------|-----|----------|----------|
| 1 | 0 | 9 | 1 | 2 | 2 < 64: `left = 2` |
| 2 | 2 | 9 | 2 | 4 | 4 < 64: `left = 3` |
| 3 | 3 | 9 | 3 | 8 | 8 < 64: `left = 4` |
| 4 | 4 | 9 | 4 | 16 | 16 < 64: `left = 5` |
| 5 | 5 | 9 | 5 | 32 | 32 < 64: `left = 6` |
| 6 | 6 | 9 | 6 | 64 | found |

Six probes, against 4 for Binary Search. With 60 powers of two, finding 2^30 takes 31 probes by interpolation and 5 by binary search.

## Complexity

| Case | Time | Space |
|------|------|-------|
| Best | O(1) | O(1) |
| Average (uniform keys) | O(log log n) | O(1) |
| Worst (skewed keys) | O(n) | O(1) |

Why log log n: on uniform keys the estimate is off by about the square root of the range size, so the range goes n, n^(1/2), n^(1/4), ..., which reaches a constant after log2(log2 n) steps. The recursive versions use O(n) stack in the worst case.

## When to Use

Use it on large sorted arrays of numbers whose values are close to uniform (sequential ids, steady timestamps), especially when each probe is expensive.

Do not use it on skewed or clustered data, on small arrays (the arithmetic costs more than it saves), or on non-numeric keys. Binary Search's guaranteed O(log n) is the safe default.

## Interpolation Search vs. Binary Search

| Aspect | Interpolation Search | Binary Search |
|--------|----------------------|---------------|
| Average time | O(log log n) on uniform keys | O(log n) |
| Worst time | O(n) | O(log n) |
| Keys | numeric, roughly uniform | any sorted, comparable |
| Probe | estimated from the values | the middle |
| Duplicates | needs a flat-window guard | no special case |

## Common Pitfalls

- **Division by zero.** When `arr[left] == arr[right]` with `left < right` (a run of duplicates) the denominator is zero. All three implementations check for the flat window first.
- **Overflow.** `target - arr[left]` and `arr[right] - arr[left]` can overflow fixed-width integers for values spread over the full range. C++ takes the differences in `double`; Go takes them as `uint64`; Python integers do not overflow.
- **Skipping the range check.** Without `arr[left] <= target <= arr[right]` the estimate can fall outside the window.
- **Assuming it is faster everywhere.** On skewed data it is much slower than Binary Search.
- **Unsorted input.** No error, just a wrong answer.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `interpolation_search.py` | iterative and recursive; exact integer arithmetic |
| C++ | [C++/](C++/) | `interpolation_search.cpp` | templates; `int` and `double` instances; differences in `double` |
| Go | [Go/](Go/) | `main.go` | `[]int` only; differences as `uint64` |

## Practice Problems

- [Binary Search (LeetCode 704)](https://leetcode.com/problems/binary-search/)
- [Search Insert Position (LeetCode 35)](https://leetcode.com/problems/search-insert-position/)
- [Search a 2D Matrix (LeetCode 74)](https://leetcode.com/problems/search-a-2d-matrix/)

## Related

- [Binary Search](../Binary_Search/)
- [Linear Search](../Linear_Search/)
- [Ternary Search](../Ternary_Search/)
