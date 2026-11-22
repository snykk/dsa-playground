# Insertion Sort

Insertion Sort builds the sorted array one element at a time: it takes the next element and slides it left into its place in the already sorted prefix. It is O(n^2) in general, O(n) on nearly sorted input, stable, in place and online, which makes it the best of the simple sorts for small arrays.

## Intuition

Sorting playing cards in your hand: pick up the next card and move it left past every larger card until it fits. The cards in your hand are always in order.

Invariant: before step `i`, the prefix `arr[0..i-1]` holds the original first `i` elements in sorted order. Step `i` inserts `arr[i]` into it, so the prefix grows by one and stays sorted.

## Visual

```text
sorted prefix | unsorted
[ 3  5  7 ]   | 1  6  2        key = 1

shift 7, 5, 3 one place right:
[ _  3  5  7 ] | 6  2          the gap is at index 0

drop the key into the gap:
[ 1  3  5  7 ] | 6  2
```

## How It Works

1. Start at `i = 1` (a one-element prefix is sorted).
2. `key = arr[i]`, `j = i - 1`.
3. While `j >= 0` and `arr[j] > key`: `arr[j + 1] = arr[j]`, `j -= 1`.
4. `arr[j + 1] = key`.
5. Repeat for the next `i`.

The comparison is a strict `>`, so equal keys are not moved past each other and the sort is stable.

## Step-by-Step Trace

Input `[7, 3, 5, 1, 6, 2]`:

| i | Key | Array after | Shifts |
|---|-----|-------------|--------|
| 1 | 3 | 3 7 5 1 6 2 | 1 |
| 2 | 5 | 3 5 7 1 6 2 | 1 |
| 3 | 1 | 1 3 5 7 6 2 | 3 |
| 4 | 6 | 1 3 5 6 7 2 | 1 |
| 5 | 2 | 1 2 3 5 6 7 | 4 |

10 shifts and 13 comparisons. The input has exactly 10 inversions (pairs in the wrong order), and every shift removes one, so the number of shifts equals the number of inversions.

## Complexity

| Case | Time | Space | When |
|------|------|-------|------|
| Best | O(n) | O(1) | already sorted: one comparison per element |
| Average | O(n^2) | O(1) | about n(n - 1)/4 inversions |
| Worst | O(n^2) | O(1) | reverse-sorted: n(n - 1)/2 inversions |

The running time is (n - 1) + I, where I is the number of inversions. The recursive Python variant needs O(n) stack space.

## When to Use

Use it for small arrays, for nearly sorted data, for streams where items arrive one by one, and as the small-range sort inside hybrid algorithms. Avoid it for large random inputs.

## Insertion Sort vs. Alternatives

| Algorithm | Best | Worst | Stable | Notes |
|-----------|------|-------|--------|-------|
| Insertion Sort | O(n) | O(n^2) | Yes | adaptive, online, few comparisons |
| [Bubble Sort](../Bubble_Sort/README.md) | O(n) | O(n^2) | Yes | same number of moves, more comparisons |
| [Selection Sort](../Selection_Sort/README.md) | O(n^2) | O(n^2) | No | at most n - 1 swaps |
| [Merge Sort](../Merge_Sort/README.md) | O(n log n) | O(n log n) | Yes | for large inputs |

## Common Pitfalls

- Overwriting `arr[i]` while shifting without saving it in `key` first.
- Off-by-one: after the loop the key goes to `arr[j + 1]`.
- Unsigned indices in C++: `j >= 0` is always true for `size_t`, which is why the C++ version tracks the gap and tests `j > 0`.
- Using `>=`, which makes the sort unstable.
- `insertion_sort_recursive` (Python) nests one call per element and raises `RecursionError` for lists of about 1,000 elements or more.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `insertion_sort.py` | `insertion_sort` and `insertion_sort_recursive`; in place, return the same list |
| C++ | [C++](C++/) | `insertion_sort.cpp` | template over `std::vector<T>`, instantiated for `int` and `double`; in place |
| Go | [Go](Go/) | `main.go` | `InsertionSort([]int)`; in place |

Binary insertion is not implemented.

## Practice Problems

- [Insertion Sort List (LeetCode 147)](https://leetcode.com/problems/insertion-sort-list/)
- [Sort an Array (LeetCode 912)](https://leetcode.com/problems/sort-an-array/)
- [Global and Local Inversions (LeetCode 775)](https://leetcode.com/problems/global-and-local-inversions/)
- [Insertion Sort (Codeforces 362C)](https://codeforces.com/problemset/problem/362/C)
- [Sort Colors (LeetCode 75)](https://leetcode.com/problems/sort-colors/)

## Related

- [Bubble Sort](../Bubble_Sort/README.md)
- [Selection Sort](../Selection_Sort/README.md)
- [Merge Sort](../Merge_Sort/README.md)
- [Quick Sort](../Quick_Sort/README.md)
