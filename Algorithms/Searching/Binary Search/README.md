# Binary Search

Binary Search finds a value in a **sorted** array by comparing it with the middle element and discarding the half that cannot contain it. Each probe halves the range, so the search takes O(log n) time and O(1) extra space.

## Intuition

Think of looking up a word in a dictionary: you open it in the middle, see whether your word comes before or after, and throw away the other half. Repeating that 20 times is enough for a million entries.

The invariant: **if the target is in the array, it is inside `arr[lo..hi]`.** It is true at the start; when `arr[mid] < target` every element up to `mid` is too small, and when `arr[mid] > target` every element from `mid` on is too large, so discarding that half keeps it true. When the window is empty the target is absent.

## Visual

```text
Array:  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]      target = 7
index:   0  1  2  3  4  5  6  7  8  9

step 1:  lo=0 ................ mid=4 ....... hi=9    arr[4]=5 < 7  -> lo = 5
step 2:           lo=5 ... mid=7 ... hi=9           arr[7]=8 > 7  -> hi = 6
step 3:                lo=5 mid=5 hi=6              arr[5]=6 < 7  -> lo = 6
step 4:                     lo=mid=hi=6             arr[6]=7      -> found, return 6
```

## How It Works

1. Set `left = 0` and `right = n - 1`.
2. While `left <= right`, compute `mid = left + (right - left) / 2`.
3. If `arr[mid] == target`, return `mid`.
4. If `arr[mid] < target`, set `left = mid + 1`; otherwise set `right = mid - 1`.
5. If the loop ends, return -1.

For the first (or last) occurrence of a duplicate, do not return on a match: save `mid`, then continue left (`right = mid - 1`) or right (`left = mid + 1`).

## Step-by-Step Trace

Search for 7 in `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`:

| Step | left | right | mid | arr[mid] | Decision |
|------|------|-------|-----|----------|----------|
| 1 | 0 | 9 | 4 | 5 | 5 < 7: `left = 5` |
| 2 | 5 | 9 | 7 | 8 | 8 > 7: `right = 6` |
| 3 | 5 | 6 | 5 | 6 | 6 < 7: `left = 6` |
| 4 | 6 | 6 | 6 | 7 | found, return 6 |

Four probes for ten elements, which is `floor(log2 10) + 1`, the worst case.

## Complexity

| Case | Time | Space |
|------|------|-------|
| Best | O(1) | O(1) |
| Average | O(log n) | O(1) |
| Worst | O(log n) | O(1) |

Each probe halves the window: T(n) = T(n/2) + O(1) = O(log n), at most `floor(log2 n) + 1` probes. The recursive version uses O(log n) stack. Binary search is optimal for comparison-based search in a sorted array, since a decision tree with n + 1 outcomes has depth at least `log2(n + 1)`.

| n | Linear search (worst) | Binary search (worst) |
|---|-----------------------|-----------------------|
| 10 | 10 | 4 |
| 1,000 | 1,000 | 10 |
| 1,000,000 | 1,000,000 | 20 |
| 1,000,000,000 | 1,000,000,000 | 30 |

## When to Use

Use it on sorted arrays with random access, especially for many lookups on mostly static data, and for "binary search on the answer" problems (a monotone yes/no condition over a range).

Do not use it on unsorted data (sorting first costs O(n log n)), on linked lists (reaching the middle is O(n)), or on tiny arrays where a linear scan is just as fast.

## Binary Search vs. Alternatives

| Method | Time | Needs sorted | Notes |
|--------|------|--------------|-------|
| Binary Search | O(log n) | Yes | repeated lookups in a sorted array |
| [Linear Search](../Linear%20Search/) | O(n) | No | unsorted data, linked lists |
| [Interpolation Search](../Interpolation%20Search/) | O(log log n) on uniform data | Yes | degrades to O(n) on skewed data |
| [Ternary Search](../Ternary%20Search/) | O(log n), more comparisons | Yes | for unimodal functions, not plain lookup |
| Hash table | O(1) average | No | exact lookup, no ordering |

## Common Pitfalls

- **Unsorted input.** There is no error, just a wrong answer.
- **Wrong loop condition.** With `right = n - 1` use `left <= right`; with `right = mid` use `left < right`. Mixing the two loops forever or skips the last element.
- **`left = mid` instead of `mid + 1`.** It can loop forever on two elements.
- **Overflow.** `(left + right) / 2` can overflow `int` in C++ and Go on huge arrays; `left + (right - left) / 2` cannot. Python integers do not overflow.
- **Duplicates.** The plain search returns any match: on `[1, 2, 2, 2, 2, 3, 4]` searching for 2 gives index 3, while the first and last occurrence versions give 1 and 4.
- **Ties in the closest search.** Python `binary_search_closest` returns the larger value on a tie: for `[1, 3, 5, 7, 9]` and target 4 it returns the index of 5.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `binary_search.py` | iterative, recursive, first and last occurrence, closest |
| C++ | [C++/](C++/) | `binary_search.cpp` | templates; `int` and `double` instances; no closest search |
| Go | [Go/](Go/) | `main.go` | `[]int` only; no closest search |

No language implements lower and upper bound (the insertion point); Python's `bisect_left` and `bisect_right` do.

## Practice Problems

- [Binary Search (LeetCode 704)](https://leetcode.com/problems/binary-search/)
- [Search Insert Position (LeetCode 35)](https://leetcode.com/problems/search-insert-position/)
- [Find First and Last Position of Element in Sorted Array (LeetCode 34)](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/)
- [Search in Rotated Sorted Array (LeetCode 33)](https://leetcode.com/problems/search-in-rotated-sorted-array/)
- [Koko Eating Bananas (LeetCode 875)](https://leetcode.com/problems/koko-eating-bananas/) - binary search on the answer.

## Related

- [Linear Search](../Linear%20Search/)
- [Interpolation Search](../Interpolation%20Search/)
- [Ternary Search](../Ternary%20Search/)
- [Binary Search on Answer](../../../Problem_Patterns/Binary%20Search%20on%20Answer/)
- [Divide and Conquer](../../Divide_and_Conquer/)

Reference: CLRS poses binary search as Exercise 2.3-5 (the chapter on getting started); Skiena's Algorithm Design Manual also covers it.
