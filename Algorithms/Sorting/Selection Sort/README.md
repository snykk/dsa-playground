# Selection Sort

Selection Sort repeatedly finds the smallest element of the unsorted part and swaps it to the front of that part. It always makes n(n - 1)/2 comparisons (O(n^2) in every case) but at most n - 1 swaps, runs in place and is not stable.

## Intuition

Lining up a class by height: find the shortest student and send them to the front, then find the shortest of the rest and put them second, and so on. Each choice is final.

Invariant: before round `i`, `arr[0..i-1]` holds the `i` smallest elements in sorted order and in their final positions; everything in `arr[i..n-1]` is at least as large.

## Visual

```text
sorted | unsorted
[ ]    | 29 10 14 37 13       min = 10 (index 1)  -> swap with arr[0]
[10]   | 29 14 37 13          min = 13 (index 4)  -> swap with arr[1]
[10 13]| 14 37 29             min = 14 (index 2)  -> already in place
[10 13 14] | 37 29            min = 29 (index 4)  -> swap with arr[3]
[10 13 14 29] | 37            one element left: done
```

## How It Works

1. For `i = 0 .. n - 1`, set `min_idx = i`.
2. For `j = i + 1 .. n - 1`, if `arr[j] < arr[min_idx]` set `min_idx = j`.
3. If `min_idx != i`, swap `arr[i]` and `arr[min_idx]`.

The strict `<` keeps the first of several equal minima. The `min_idx != i` guard avoids useless self-swaps, so the sort makes at most n - 1 swaps.

## Step-by-Step Trace

Input `[29, 10, 14, 37, 13]`:

| Round | Minimum (index) | Action | Array after |
|-------|-----------------|--------|-------------|
| 0 | 10 (1) | swap with arr[0] | 10 29 14 37 13 |
| 1 | 13 (4) | swap with arr[1] | 10 13 14 37 29 |
| 2 | 14 (2) | already in place | 10 13 14 37 29 |
| 3 | 29 (4) | swap with arr[3] | 10 13 14 29 37 |
| 4 | 37 (4) | already in place | 10 13 14 29 37 |

10 comparisons (4 + 3 + 2 + 1) and 3 swaps.

## Complexity

| Case | Time | Space | When |
|------|------|-------|------|
| Best | O(n^2) | O(1) | sorted input: the scans still run in full, 0 swaps |
| Average | O(n^2) | O(1) | n(n - 1)/2 comparisons |
| Worst | O(n^2) | O(1) | the same number of comparisons, at most n - 1 swaps |

Round `i` always compares against all `n - i - 1` elements after position `i`, so the comparisons are (n - 1) + (n - 2) + ... + 1 = n(n - 1)/2 for any input. The number of swaps is at most n - 1 (a round whose minimum is already in place swaps nothing).

## When to Use

Use it when writes are much more expensive than comparisons, for tiny arrays, and for teaching. Avoid it for large arrays and when stability matters. Insertion Sort is faster on nearly sorted data because Selection Sort never adapts.

## Selection Sort vs. Alternatives

| Algorithm | Best | Worst | Swaps (worst) | Stable |
|-----------|------|-------|---------------|--------|
| Selection Sort | O(n^2) | O(n^2) | n - 1 | No |
| [Bubble Sort](../Bubble%20Sort/README.md) | O(n) | O(n^2) | O(n^2) | Yes |
| [Insertion Sort](../Insertion%20Sort/README.md) | O(n) | O(n^2) | O(n^2) shifts | Yes |
| [Heap Sort](../Heap%20Sort/README.md) | O(n log n) | O(n log n) | O(n log n) | No |

## Common Pitfalls

- Resetting `min_idx` to 0 instead of `i` in each round.
- Swapping with `arr[j]` instead of `arr[min_idx]`.
- Expecting stability: `[2a, 2b, 1]` becomes `[1, 2b, 2a]`, because the swap moves a 2 past its twin.
- Expecting speed on sorted input: the scans always run in full.
- Using `<=` in the scan: it picks the last equal minimum and causes extra swaps.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `selection_sort.py` | `selection_sort(arr)` sorts in place and returns the list |
| C++ | [C++](C++/) | `selection_sort.cpp` | template over `std::vector<T>`, instantiated for `int` and `double`; in place |
| Go | [Go](Go/) | `main.go` | `SelectionSort([]int)`; in place |

All three skip the swap when the minimum is already in position.

## Practice Problems

- [Sort an Array (LeetCode 912)](https://leetcode.com/problems/sort-an-array/)
- [Kth Largest Element in an Array (LeetCode 215)](https://leetcode.com/problems/kth-largest-element-in-an-array/)
- [Sort Colors (LeetCode 75)](https://leetcode.com/problems/sort-colors/)

## Related

- [Bubble Sort](../Bubble%20Sort/README.md)
- [Insertion Sort](../Insertion%20Sort/README.md)
- [Heap Sort](../Heap%20Sort/README.md)
- [Merge Sort](../Merge%20Sort/README.md)
