# Quick Sort

Quick Sort picks a pivot, rearranges the array so that smaller elements come before it and larger ones after it, then sorts both sides the same way. It runs in O(n log n) time on average, O(n^2) in the worst case, sorts in place and is not stable.

## Intuition

To sort a crowd by height, pick one person as the reference. Everyone shorter goes to their left, everyone taller to their right. The reference person is now exactly where they belong, and the two groups can be sorted independently, with the same trick.

Invariant: after partitioning, every element left of the pivot is `<=` it and every element right of it is `>`. No later step moves an element across the pivot, so the pivot is in its final position and both sides are independent sub-problems.

This repository uses the **Lomuto** partition with the **last element** as the pivot (`arr[high]`). Python also has Hoare's partition with the first element as the pivot (`quick_sort_hoare`).

## Visual

```text
pivot = 70 (last element)           i = boundary of the "<= pivot" part

[10 80 30 90 40 50 | 70]            start, i = -1
 j=0: 10 <= 70 -> grow left part     [10 | 80 30 90 40 50 | 70]
 j=1: 80 >  70 -> leave it
 j=2: 30 <= 70 -> swap into the left [10 30 | 80 90 40 50 | 70]
 j=3: 90 >  70 -> leave it
 j=4: 40 <= 70 -> swap               [10 30 40 | 90 80 50 | 70]
 j=5: 50 <= 70 -> swap               [10 30 40 50 | 80 90 | 70]
 finish: swap pivot into place       [10 30 40 50 | 70 | 90 80]
```

## How It Works

1. Choose the pivot: `arr[high]`.
2. Partition (Lomuto): `i = low - 1`; for `j = low .. high - 1`, if `arr[j] <= pivot` then `i += 1` and swap `arr[i]` with `arr[j]`. Finally swap `arr[i + 1]` with `arr[high]` and return `i + 1`.
3. Sort the part left of the pivot and the part right of it. A range with at most one element is sorted.

The Python version recurses into the smaller side and loops on the larger side, so the recursion depth stays at most log2(n). The C++ and Go versions use the plain two-call recursion.

## Step-by-Step Trace

Partition of `[10, 80, 30, 90, 40, 50, 70]` around the pivot 70:

| j | arr[j] | Action | Array |
|---|--------|--------|-------|
| 0 | 10 | `<=` 70: i = 0, swap with itself | 10 80 30 90 40 50 70 |
| 1 | 80 | `>` 70: leave | 10 80 30 90 40 50 70 |
| 2 | 30 | `<=` 70: i = 1, swap with arr[2] | 10 30 80 90 40 50 70 |
| 3 | 90 | `>` 70: leave | 10 30 80 90 40 50 70 |
| 4 | 40 | `<=` 70: i = 2, swap with arr[4] | 10 30 40 90 80 50 70 |
| 5 | 50 | `<=` 70: i = 3, swap with arr[5] | 10 30 40 50 80 90 70 |
| end | 70 | swap pivot into `arr[i + 1]` | 10 30 40 50 70 90 80 |

70 is final. Next, `[10, 30, 40, 50]` and `[90, 80]` are sorted the same way.

## Complexity

| Case | Time | Space | When |
|------|------|-------|------|
| Best | O(n log n) | O(log n) | every pivot lands in the middle |
| Average | O(n log n) | O(log n) | about 1.39 n log2(n) comparisons on random input |
| Worst | O(n^2) | O(log n) Python, O(n) C++ and Go | every pivot is the smallest or largest element |

One partition of `n` elements costs O(n). Balanced splits give T(n) = 2 T(n/2) + O(n) = O(n log n); a lopsided split gives T(n) = T(n - 1) + O(n) = O(n^2). With the last element as the pivot, the worst case happens on sorted, reverse-sorted and all-equal input (because of `<=`, all equal keys go to the left part).

Space is the recursion stack. Recursing into the smaller side only (Python) bounds it by log2(n); the plain two-call recursion (C++, Go) can nest n calls on a sorted array.

## When to Use

Use it to sort arrays in memory when average speed matters and stability does not. Avoid it when equal keys must keep their order (use Merge Sort), when a hard O(n log n) bound is required without a fallback (use Heap Sort or Merge Sort), and for linked lists.

## Quick Sort vs. Alternatives

| Algorithm | Average | Worst | Extra space | Stable |
|-----------|---------|-------|-------------|--------|
| Quick Sort | O(n log n) | O(n^2) | O(log n) | No |
| [Merge Sort](../Merge%20Sort/README.md) | O(n log n) | O(n log n) | O(n) | Yes |
| [Heap Sort](../Heap%20Sort/README.md) | O(n log n) | O(n log n) | O(log n) here | No |
| [Insertion Sort](../Insertion%20Sort/README.md) | O(n^2) | O(n^2) | O(1) | Yes |

## Common Pitfalls

- A fixed pivot (first or last element) gives O(n^2) on sorted input. This code uses the last element and does not randomize.
- All-equal input is a worst case for Lomuto with `<=`. Hoare's scheme splits it evenly.
- Hoare returns a split point, not the pivot's index: recurse on `(low, p)` and `(p + 1, high)`, not `(low, p - 1)` and `(p + 1, high)`.
- Unbounded recursion: recurse into the smaller side first, otherwise sorted input nests n calls (C++ and Go here).
- Not stable: equal keys can swap places.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `quick_sort.py` | `quick_sort` (Lomuto, last-element pivot, smaller side first), `partition`, `quick_sort_hoare` and `partition_hoare` (first-element pivot) |
| C++ | [C++](C++/) | `quick_sort.cpp` | templates `quickSort(arr)`, `quickSort(arr, low, high)` and `partition`; Lomuto only, plain recursion |
| Go | [Go](Go/) | `main.go` | `QuickSort([]int)`; Lomuto only, plain recursion |

Random and median-of-three pivots, and a three-way partition, are not implemented.

## Practice Problems

- [Sort an Array (LeetCode 912)](https://leetcode.com/problems/sort-an-array/)
- [Sort Colors (LeetCode 75)](https://leetcode.com/problems/sort-colors/)
- [Kth Largest Element in an Array (LeetCode 215)](https://leetcode.com/problems/kth-largest-element-in-an-array/)

## Related

- [Merge Sort](../Merge%20Sort/README.md)
- [Heap Sort](../Heap%20Sort/README.md)
- [Insertion Sort](../Insertion%20Sort/README.md)
- [Randomized Quickselect](../../Randomized_Algorithms/Randomized_Quickselect/README.md)
