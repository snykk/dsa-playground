# Randomized Quickselect

Given an array of `n` elements and a rank `k`, find the **k-th smallest element** in **O(n) expected time**: faster than sorting (O(n log n)) and simpler than the deterministic median-of-medians algorithm. It is the idea behind `std::nth_element` and many top-k pipelines.

## Intuition

You need the median of a million numbers. Sorting takes O(n log n), but the median is a single element, so why order everything?

Quick Sort's partition tells you exactly where the pivot lands in sorted order. If its final position covers rank `k`, you are done. Otherwise `k` is on exactly one side, and you only recurse into **that** side. Quick Sort recurses into both sides; keeping one is what drops the expected cost from O(n log n) to O(n).

A random pivot is what makes the O(n) hold for every input. A fixed pivot (first or last element) gives O(n^2) on sorted input.

The invariant: the element of rank `k` always lies inside the current range `arr[lo..hi]`, because everything smaller than the pivot is to its left and everything larger is to its right.

## Visual

Find the 4th smallest (`k = 3`, 0-indexed) of `[7, 2, 9, 2, 5, 2, 8]`:

```text
start       [7, 2, 9, 2, 5, 2, 8]     pivot = the value 2 (index 1)
round 1     [2, 2, 2 | 5, 9, 8, 7]    equal band = indexes 0..2, k = 3 is to the right
round 2     [2, 2, 2, 5, 8, 7, 9]     range 3..6, pivot = 5, equal band = 3..3 contains k
answer      arr[3] = 5
```

## How It Works

1. Set `lo = 0`, `hi = n - 1`.
2. While `lo < hi`: pick a random index in `lo..hi` and partition `arr[lo..hi]` into three bands (`< pivot`, `== pivot`, `> pivot`). The partition returns `lt..gt`, the band of keys equal to the pivot.
3. If `k < lt`, set `hi = lt - 1`. If `k > gt`, set `lo = gt + 1`. Otherwise `arr[k]` is the answer.
4. When `lo == hi`, `arr[lo]` is the answer.

```text
quickselect(arr, k):
    lo = 0; hi = len(arr) - 1
    while lo < hi:
        lt, gt = partition3(arr, lo, hi, random index in [lo, hi])
        if k < lt:   hi = lt - 1
        elif k > gt: lo = gt + 1
        else:        return arr[k]
    return arr[lo]

partition3(arr, lo, hi, p):          # Dutch national flag
    pivot = arr[p]; lt = lo; i = lo; gt = hi
    while i <= gt:
        if arr[i] < pivot:   swap(arr[lt], arr[i]); lt++; i++
        elif arr[i] > pivot: swap(arr[i], arr[gt]); gt--
        else:                i++
    return lt, gt                    # arr[lt..gt] == pivot
```

All three implementations are iterative (a `while lo < hi` loop), so the stack does not grow.

## Step-by-Step Trace

Array `[7, 2, 9, 2, 5, 2, 8]`, `k = 3`; the sorted array is `[2, 2, 2, 5, 7, 8, 9]`.

| Round | Range | Pivot | Result of the partition | Decision |
|-------|-------|-------|-------------------------|----------|
| 1 | 0..6 | 2 | `[2, 2, 2, 5, 9, 8, 7]`, equal band 0..2 | `k = 3 > 2`: continue with `lo = 3` |
| 2 | 3..6 | 5 | `[2, 2, 2, 5, 8, 7, 9]`, equal band 3..3 | `lt <= k <= gt`: return `arr[3] = 5` |

## Complexity

| Aspect | Bound | Why |
|--------|-------|-----|
| Expected time | O(n) | a random pivot lands in the middle half with probability 1/2, so the range shrinks to at most 3/4 every two rounds: n + 3n/4 + 9n/16 + ... = O(n) |
| Worst-case time | O(n^2) | every pivot is extreme; the probability falls off exponentially with n |
| Extra space | O(1) | iterative, in place |
| All-equal input | O(n) | the three-way partition removes the whole equal band in one pass |

A two-way Lomuto partition with a strict `<` is O(n^2) on all-equal or duplicate-heavy input whatever the pivot, because every equal key lands on the same side. That is why this code uses three bands.

## When to Use

Use Quickselect for the k-th smallest or largest element, the median or a percentile, or top-k selection where the data fits in memory and you do not need the rest sorted.

Do not use it when you need everything sorted (sort), when `k` is tiny or the data is a stream (a heap of size `k` is O(n log k) with O(k) memory), or when you need a hard worst-case O(n) bound (median of medians).

## Quickselect vs. Alternatives

| Algorithm | Time | Space | Notes |
|-----------|------|-------|-------|
| Randomized Quickselect | O(n) expected | O(1) | simple and fast in practice |
| Median of medians | O(n) worst case | O(1) to O(n) | guaranteed, but with a large constant factor |
| Heap of size k | O(n log k) | O(k) | best when k is much smaller than n, or for streams |
| Sort, then index | O(n log n) | O(1) to O(n) | simplest; best when you also need the order |
| `std::nth_element` | O(n) on average | O(1) | the standard only guarantees linear time on average; common implementations use introselect with a guaranteed fallback |

## Common Pitfalls

1. **Recursing into both sides.** That is Quick Sort, at O(n log n).
2. **A two-way partition on duplicates.** Quadratic on all-equal input; use three bands.
3. **A fixed pivot.** First or last element pivots are quadratic on sorted input.
4. **Off-by-one on `k`.** `k` is 0-indexed here: `k = 0` is the minimum, `k = n - 1` the maximum.
5. **Forgetting that the input is reordered.** Copy it first (`list(arr)`, `auto work = arr;`, `append([]int(nil), arr...)`) if the caller needs the original.
6. **Biased pivots.** Use a uniform generator, not `rand() % n`.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `quickselect.py` | iterative; optional `random.Random`; `top_k_smallest` helper |
| C++ | [C++/](C++/) | `quickselect.h` | header-only; takes a `std::mt19937&` or seeds one; no top-k helper |
| Go | [Go/](Go/) | `main.go` | iterative; `*rand.Rand` (or `nil`); `TopKSmallest` helper; panics on bad input |

## Practice Problems

- [Kth Largest Element in an Array (LeetCode 215)](https://leetcode.com/problems/kth-largest-element-in-an-array/)
- [K Closest Points to Origin (LeetCode 973)](https://leetcode.com/problems/k-closest-points-to-origin/)
- [Minimum Moves to Equal Array Elements II (LeetCode 462)](https://leetcode.com/problems/minimum-moves-to-equal-array-elements-ii/)
- [Top K Frequent Elements (LeetCode 347)](https://leetcode.com/problems/top-k-frequent-elements/)
- [Wiggle Sort II (LeetCode 324)](https://leetcode.com/problems/wiggle-sort-ii/)

## Related

- [Quick Sort](../../Sorting/Quick_Sort/README.md) - the same partition primitive.
- [Reservoir Sampling](../Reservoir_Sampling/README.md) - another randomized algorithm for large data.
- [Randomized Algorithms overview](../README.md)
