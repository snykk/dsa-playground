# Heap Sort

Heap Sort turns the array into a max-heap, then repeatedly swaps the maximum to the end and repairs the heap. It guarantees O(n log n) time in every case, needs no extra array, and is not stable.

## Intuition

It is Selection Sort with a faster way to find the maximum. Selection Sort scans the whole unsorted part for its largest element in O(n); a max-heap keeps the largest element at the root, and restoring the heap after removing it costs only O(log n).

A binary heap fits in an array: the children of index `i` are `2i + 1` and `2i + 2`, and every parent is at least as large as its children (max-heap property).

Invariant of the extraction phase: `arr[0..size-1]` is a max-heap and `arr[size..n-1]` holds the largest elements in sorted order, in their final positions.

## Visual

```text
array: [10 5 8 4 1 3 7]         as a tree:        10
                                                 /  \
                                                5    8
                                               / \  / \
                                              4  1 3   7

extract: swap root with last      [7 5 8 4 1 3 | 10]    10 is final
         sift 7 down              [8 5 7 4 1 3 | 10]    heap is a max-heap again
```

## How It Works

1. Build a max-heap: for `i = n/2 - 1` down to 0, sift `arr[i]` down (swap with the larger child while that child is larger).
2. For `end = n - 1` down to 1: swap `arr[0]` and `arr[end]`, then sift `arr[0]` down inside `arr[0..end-1]`.

Sifting down is called `heapify` in the code and is recursive in all three languages.

## Step-by-Step Trace

Input `[4, 10, 3, 5, 1, 8, 7]`.

Build phase:

| Sift index | Array after |
|------------|-------------|
| 2 | 4 10 8 5 1 3 7 |
| 1 | 4 10 8 5 1 3 7 (no change) |
| 0 | 10 5 8 4 1 3 7 |

Extraction phase (array after each swap and sift-down; the part after `|` is sorted):

| Extract | Array |
|---------|-------|
| 1 | 8 5 7 4 1 3 \| 10 |
| 2 | 7 5 3 4 1 \| 8 10 |
| 3 | 5 4 3 1 \| 7 8 10 |
| 4 | 4 1 3 \| 5 7 8 10 |
| 5 | 3 1 \| 4 5 7 8 10 |
| 6 | 1 \| 3 4 5 7 8 10 (sorted) |

## Complexity

| Case | Time | Space | When |
|------|------|-------|------|
| Best | O(n log n) | O(log n) | all-equal input is the exception: O(n) |
| Average | O(n log n) | O(log n) | n - 1 sift-downs, each up to log n levels |
| Worst | O(n log n) | O(log n) | guaranteed: the heap height is log2(n) |

Building the heap is O(n), not O(n log n): a node at height `h` sifts at most `h` levels, and at most n / 2^(h+1) nodes have height `h`, so the total is a convergent sum. The extraction phase does n - 1 sift-downs of O(log n) each.

Space: the heap lives in the input array, so no buffer is needed. The recursive `heapify` adds up to log2(n) stack frames in Python, C++ and Go; a loop would make it O(1).

## When to Use

Use it when you need a hard O(n log n) bound without extra memory (this is why introsort falls back to it), or when you only need the largest `k` elements (stop the extraction after `k` steps). Avoid it when stability matters or when raw speed on arrays matters: Quick Sort is usually faster because Heap Sort jumps around memory and is not adaptive.

## Heap Sort vs. Alternatives

| Algorithm | Average | Worst | Extra space | Stable |
|-----------|---------|-------|-------------|--------|
| Heap Sort | O(n log n) | O(n log n) | O(log n) here | No |
| [Quick Sort](../Quick_Sort/README.md) | O(n log n) | O(n^2) | O(log n) | No |
| [Merge Sort](../Merge_Sort/README.md) | O(n log n) | O(n log n) | O(n) | Yes |
| [Selection Sort](../Selection_Sort/README.md) | O(n^2) | O(n^2) | O(1) | No |

## Common Pitfalls

- Starting the build at the wrong index: the last non-leaf is `n/2 - 1`.
- Sifting within the whole array: after each swap the heap size is `end`, not `n`.
- C++: `n - 1` wraps around for an empty vector (the code returns early when `n < 2`).
- Expecting stability: swaps across the array reorder equal keys.
- Believing it uses O(1) space: the recursive sift-down uses O(log n) stack.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `heap_sort.py` | `heap_sort(arr)` sorts in place and returns the list; `heapify` is public |
| C++ | [C++](C++/) | `heap_sort.cpp` | templates `heapSort` and `heapify` over `std::vector<T>`, instantiated for `int` and `double`; in place |
| Go | [Go](Go/) | `main.go` | `HeapSort([]int)` and `heapify`; in place |

## Practice Problems

- [Sort an Array (LeetCode 912)](https://leetcode.com/problems/sort-an-array/)
- [Kth Largest Element in an Array (LeetCode 215)](https://leetcode.com/problems/kth-largest-element-in-an-array/)
- [Top K Frequent Elements (LeetCode 347)](https://leetcode.com/problems/top-k-frequent-elements/)
- [Merge k Sorted Lists (LeetCode 23)](https://leetcode.com/problems/merge-k-sorted-lists/)

## Related

- [Max Heap](../../../Data_Structures/Non_Linear/Heaps/Max_Heap/README.md)
- [Selection Sort](../Selection_Sort/README.md)
- [Quick Sort](../Quick_Sort/README.md)
- [Merge Sort](../Merge_Sort/README.md)
