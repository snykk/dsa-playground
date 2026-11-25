# Merge Sort

Merge Sort splits the array in half, sorts each half recursively, and merges the two sorted halves into one. It runs in O(n log n) time in every case, is stable, and needs O(n) extra memory.

## Intuition

To sort a huge pile, split it in two, hand each half to a helper, and take back two sorted piles. Combining two sorted piles is easy: compare the top cards, take the smaller, repeat. The whole work is the merging, and each merge is linear.

Invariant: after the recursive calls, each half is sorted, and the merge step produces a sorted sequence from two sorted ones. A range of 0 or 1 elements is sorted by definition, so the recursion ends correctly.

## Visual

```text
                [38 27 43 3 9 82 10]
               /                    \
        [38 27 43]              [3 9 82 10]          split
        /       \               /        \
     [38]    [27 43]        [3 9]      [82 10]
             /    \         /   \       /    \
           [27]  [43]     [3]  [9]    [82]  [10]

merge (bottom up):
  [27] + [43]            -> [27 43]
  [38] + [27 43]         -> [27 38 43]
  [3] + [9]              -> [3 9]
  [82] + [10]            -> [10 82]
  [3 9] + [10 82]        -> [3 9 10 82]
  [27 38 43] + [3 9 10 82] -> [3 9 10 27 38 43 82]
```

## How It Works

1. If the range has at most one element, return.
2. Split it at `mid = len // 2` (left = first `mid` elements).
3. Sort the left half and the right half recursively.
4. Merge: keep a pointer in each half; copy the smaller front element to the output (take the left one on a tie), advance, and when one half is empty copy the rest of the other.

The `<=` on the tie in step 4 is what makes the sort stable.

## Step-by-Step Trace

Input `[38, 27, 43, 3, 9, 82, 10]`:

| Merge | Left | Right | Result | Comparisons |
|-------|------|-------|--------|-------------|
| 1 | 27 | 43 | 27 43 | 1 |
| 2 | 38 | 27 43 | 27 38 43 | 2 |
| 3 | 3 | 9 | 3 9 | 1 |
| 4 | 82 | 10 | 10 82 | 1 |
| 5 | 3 9 | 10 82 | 3 9 10 82 | 2 |
| 6 | 27 38 43 | 3 9 10 82 | 3 9 10 27 38 43 82 | 6 |

13 comparisons in total.

## Complexity

| Case | Time | Space | When |
|------|------|-------|------|
| Best | O(n log n) | O(n) | no early exit: sorted input costs the same |
| Average | O(n log n) | O(n) | always log2(n) levels of linear merging |
| Worst | O(n log n) | O(n) | the split is always even |

Recurrence: T(n) = 2 T(n/2) + O(n), which gives O(n log n): there are log2(n) levels and every level merges n elements in total. Extra space is the temporary copies of the halves (about n elements live at once) plus O(log n) stack frames. The implementations here allocate new temporary buffers on every call instead of reusing one buffer.

## When to Use

Use it when you need a stable sort, a guaranteed O(n log n) bound, to sort linked lists, or to sort data that does not fit in memory (sort chunks, then merge). Avoid it when memory is tight or for small arrays where Insertion Sort is faster.

## Merge Sort vs. Alternatives

| Algorithm | Average | Worst | Extra space | Stable |
|-----------|---------|-------|-------------|--------|
| Merge Sort | O(n log n) | O(n log n) | O(n) | Yes |
| [Quick Sort](../Quick_Sort/README.md) | O(n log n) | O(n^2) | O(log n) | No |
| [Heap Sort](../Heap_Sort/README.md) | O(n log n) | O(n log n) | O(log n) here | No |
| [Insertion Sort](../Insertion_Sort/README.md) | O(n^2) | O(n^2) | O(1) | Yes |

## Common Pitfalls

- Comparing with `<` instead of `<=` on the fronts: equal keys swap order, so the sort is no longer stable.
- Forgetting to copy the leftover elements when one half runs out.
- Mixing inclusive (`[left, right]`, used by the C++ code) and half-open ranges: off-by-one errors.
- Merging into the array you are reading without temporary copies.
- Calling it in place: the temporary arrays are O(n).

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `merge_sort.py` | `merge_sort` (top-down), `merge`, and `merge_sort_iterative` (bottom-up, Python only); sorts in place and returns the list |
| C++ | [C++](C++/) | `merge_sort.cpp` | templates `merge`, `mergeSort(arr, left, right)` (inclusive range) and `mergeSort(arr)`; temporary vectors `L` and `R` per merge |
| Go | [Go](Go/) | `main.go` | `MergeSort([]int)` copies the halves and merges back; in place |

## Practice Problems

- [Merge Sorted Array (LeetCode 88)](https://leetcode.com/problems/merge-sorted-array/)
- [Sort List (LeetCode 148)](https://leetcode.com/problems/sort-list/)
- [Ultra-QuickSort (Kattis ultraquicksort)](https://open.kattis.com/problems/ultraquicksort)
- [Reverse Pairs (LeetCode 493)](https://leetcode.com/problems/reverse-pairs/)
- [Count of Smaller Numbers After Self (LeetCode 315)](https://leetcode.com/problems/count-of-smaller-numbers-after-self/)
- [Sort an Array (LeetCode 912)](https://leetcode.com/problems/sort-an-array/)

## Related

- [Quick Sort](../Quick_Sort/README.md)
- [Heap Sort](../Heap_Sort/README.md)
- [Insertion Sort](../Insertion_Sort/README.md)
- [Timsort](../Timsort/README.md) - a merge sort that starts from the runs already in the data
- [Divide and Conquer](../../Divide_and_Conquer/README.md)
