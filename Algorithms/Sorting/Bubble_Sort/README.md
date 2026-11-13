# Bubble Sort

Bubble Sort repeatedly walks through the array and swaps adjacent elements that are out of order. After each pass the largest remaining element has sunk to the end. It runs in O(n^2) time and O(1) extra space, is stable, and finishes in O(n) on sorted input when it stops early.

## Intuition

Think of bubbles in a glass: the biggest one reaches the top first. Here each pass carries the largest unsettled value to the right end by swapping it past every smaller neighbour.

Invariant: after `i` passes, the last `i` elements are the `i` largest values, in sorted order and in their final positions. Each pass therefore settles one more element, and a pass with no swap proves that the whole array is in order.

## Visual

```text
pass 1:  [64 34 25 12 22 11 90]
          ^^                       64 > 34  swap
          [34 64 25 12 22 11 90]
             ^^                    64 > 25  swap
          ...                      64 keeps moving right
          [34 25 12 22 11 64 90]   64 < 90, stop: 90 is final
                              ^^
settled suffix grows by one each pass:  | 90 |  | 64 90 |  | 34 64 90 | ...
```

## How It Works

1. For `j = 0 .. n - i - 2`, compare `arr[j]` and `arr[j + 1]`.
2. If `arr[j] > arr[j + 1]`, swap them and set `swapped = true`.
3. After the inner loop, position `n - i - 1` is final; increase `i`.
4. If `swapped` is still false, stop: the array is sorted.

The comparison is a strict `>`, so equal elements are never swapped and the sort is stable.

## Step-by-Step Trace

Input `[64, 34, 25, 12, 22, 11, 90]`:

| Pass | Array after the pass | Swaps |
|------|----------------------|-------|
| 1 | 34 25 12 22 11 64 90 | 5 |
| 2 | 25 12 22 11 34 64 90 | 4 |
| 3 | 12 22 11 25 34 64 90 | 3 |
| 4 | 12 11 22 25 34 64 90 | 1 |
| 5 | 11 12 22 25 34 64 90 | 1 |
| 6 | 11 12 22 25 34 64 90 | 0 (early exit) |

21 comparisons and 14 swaps. The input has exactly 14 inversions (pairs in the wrong order): every adjacent swap removes one inversion, so the swap count equals the inversion count.

## Complexity

| Case | Time | Space | When |
|------|------|-------|------|
| Best | O(n) | O(1) | already sorted: one pass, no swap, early exit |
| Average | O(n^2) | O(1) | about n(n - 1)/4 swaps on a random permutation |
| Worst | O(n^2) | O(1) | reverse-sorted: every comparison swaps |

Pass `i` makes `n - i - 1` comparisons, so a full run costs (n - 1) + (n - 2) + ... + 1 = n(n - 1)/2 comparisons. The recursive Python variant adds O(n) stack space.

Small values near the end move left only one place per pass, so an almost-sorted array such as `[2, 3, 4, 5, 1]` still needs a full set of passes.

## When to Use

Use it to learn sorting, for tiny inputs, or when simplicity matters more than speed. Avoid it for anything large: every O(n log n) sort is far faster, and Insertion Sort is faster on the same kind of small or nearly sorted data.

## Bubble Sort vs. Alternatives

| Algorithm | Best | Worst | Stable | Notes |
|-----------|------|-------|--------|-------|
| Bubble Sort | O(n) | O(n^2) | Yes | many swaps, simplest code |
| [Insertion Sort](../Insertion_Sort/README.md) | O(n) | O(n^2) | Yes | same moves, fewer comparisons, faster in practice |
| [Selection Sort](../Selection_Sort/README.md) | O(n^2) | O(n^2) | No | at most n - 1 swaps, never adapts |
| [Merge Sort](../Merge_Sort/README.md) | O(n log n) | O(n log n) | Yes | use for large inputs |

## Common Pitfalls

- Inner loop bound: it must stop at `n - i - 2`, so that `arr[j + 1]` exists.
- Resetting `swapped` once instead of at the start of every pass.
- Using `>=`, which swaps equal elements and breaks stability.
- Python `bubble_sort_recursive` uses one stack frame per pass and raises `RecursionError` for lists of a few thousand elements. It exists for teaching.
- `bubble_sort_optimized` is the same code as `bubble_sort` (the early exit is already built in).

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `bubble_sort.py` | `bubble_sort`, `bubble_sort_optimized`, `bubble_sort_recursive`; sorts in place and returns the list |
| C++ | [C++](C++/) | `bubble_sort.cpp` | template over `std::vector<T>`; in place, returns nothing |
| Go | [Go](Go/) | `main.go` | `BubbleSort([]int)` and a generic `BubbleSortGeneric` with a `less` function; in place |

The cocktail shaker variant (alternating directions) is not implemented.

## Practice Problems

- [Sort an Array (LeetCode 912)](https://leetcode.com/problems/sort-an-array/)
- [Sort Colors (LeetCode 75)](https://leetcode.com/problems/sort-colors/)
- [Global and Local Inversions (LeetCode 775)](https://leetcode.com/problems/global-and-local-inversions/)
- [Squares of a Sorted Array (LeetCode 977)](https://leetcode.com/problems/squares-of-a-sorted-array/)

## Related

- [Insertion Sort](../Insertion_Sort/README.md)
- [Selection Sort](../Selection_Sort/README.md)
- [Merge Sort](../Merge_Sort/README.md)
- [Quick Sort](../Quick_Sort/README.md)
