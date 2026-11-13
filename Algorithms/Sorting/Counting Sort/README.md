# Counting Sort

Counting Sort sorts integers without comparing them: it counts how often each value occurs, turns the counts into positions with prefix sums, and writes each element directly to its final slot. It runs in O(n + k) time and O(n + k) space, where k = max - min + 1 is the size of the value range, and it is stable.

## Intuition

Imagine sorting exam papers by a score from 0 to 100. Instead of comparing papers, make 101 labelled trays, drop each paper into its tray, and then collect the trays in order. Counting Sort does the same with counters instead of trays, plus a trick (prefix sums) that tells each element exactly which output slot to take.

Invariant: after the prefix-sum step, `count[v - min]` is the number of elements `<= v`, which is one past the last output slot for the value `v`. Placing the input from back to front, decrementing the counter each time, fills each value's block from its end, so equal values keep their input order.

## Visual

```text
input   : 4 2 2 8 3 3 1          min = 1, max = 8
value   :   1 2 3 4 5 6 7 8
count   :   1 2 2 1 0 0 0 1
prefix  :   1 3 5 6 6 6 6 7      (number of elements <= value)

place from the back:
  1 -> slot 0           [1 . . . . . .]
  3 -> slot 4           [1 . . . 3 . .]
  3 -> slot 3           [1 . . 3 3 . .]
  8 -> slot 6           [1 . . 3 3 . 8]
  2 -> slot 2           [1 . 2 3 3 . 8]
  2 -> slot 1           [1 2 2 3 3 . 8]
  4 -> slot 5           [1 2 2 3 3 4 8]
```

## How It Works

1. Find `min` and `max` (if you pass `max_val` / `maxVal`, it must be at least the real maximum, or the call fails).
2. Create a count array of `max - min + 1` zeros. Value `x` uses slot `x - min`, which makes negative numbers work.
3. Count: for each element `x`, `count[x - min] += 1`.
4. Prefix sums: `count[i] += count[i - 1]`.
5. For `i` from the last input index down to 0: `count[x - min] -= 1`, then `output[count[x - min]] = x` where `x = arr[i]`.

The result is a new array; the input is not modified.

## Step-by-Step Trace

Input `[4, 2, 2, 8, 3, 3, 1]`, backwards placement:

| Input index | Value | Slot | Output so far |
|-------------|-------|------|---------------|
| 6 | 1 | 0 | 1 . . . . . . |
| 5 | 3 | 4 | 1 . . . 3 . . |
| 4 | 3 | 3 | 1 . . 3 3 . . |
| 3 | 8 | 6 | 1 . . 3 3 . 8 |
| 2 | 2 | 2 | 1 . 2 3 3 . 8 |
| 1 | 2 | 1 | 1 2 2 3 3 . 8 |
| 0 | 4 | 5 | 1 2 2 3 3 4 8 |

The two 3s show the stability: the later 3 (index 5) takes the higher slot.

## Complexity

| Case | Time | Space |
|------|------|-------|
| Best | O(n + k) | O(n + k) |
| Average | O(n + k) | O(n + k) |
| Worst | O(n + k) | O(n + k) |

There is no early exit, so all cases are the same. The loops over the input cost O(n) each and the loops over the count array cost O(k) each; none are nested. Space is the count array (k) plus the output array (n). When k is far larger than n, for example `[1, 1000000000]`, both time and memory are dominated by k.

## When to Use

Use it for integers in a small range (ages, scores, letters, digits), when you need a stable linear-time sort, or as the digit sort inside [Radix Sort](../Radix%20Sort/README.md). Avoid it for floats, for huge value ranges and for tiny inputs.

## Counting Sort vs. Alternatives

| Algorithm | Time | Extra space | Stable | Works on |
|-----------|------|-------------|--------|----------|
| Counting Sort | O(n + k) | O(n + k) | Yes | integers in a small range |
| [Radix Sort](../Radix%20Sort/README.md) | O(d (n + b)) | O(n + b) | Yes | integers with bounded digits |
| [Bucket Sort](../Bucket%20Sort/README.md) | O(n + k) average | O(n + k) | depends | numbers spread evenly |
| [Quick Sort](../Quick%20Sort/README.md) | O(n log n) average | O(log n) | No | anything comparable |

## Common Pitfalls

- Negative values without the `- min` offset: wrong order in Python, out-of-bounds access in C++ and Go.
- A `max_val` / `maxVal` smaller than the real maximum is rejected (`ValueError`, `std::invalid_argument`, panic).
- Placing the input front to back breaks stability.
- A wide value range allocates a huge count array.
- C++: `x - minVal` can overflow `int`, so the code computes the slot with 64-bit arithmetic.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `counting_sort.py` | `counting_sort(arr, max_val=None)` finds the maximum itself; also `counting_sort_simple` (rebuilds from counts, only for bare ints) |
| C++ | [C++](C++/) | `counting_sort.cpp` | `countingSort(const std::vector<int>&, int maxVal)`, plain function, `maxVal` required |
| Go | [Go](Go/) | `main.go` | `CountingSort(arr []int, maxVal int) []int`, `maxVal` required |

All three return a new sorted array.

## Practice Problems

- [Sort Colors (LeetCode 75)](https://leetcode.com/problems/sort-colors/)
- [Relative Sort Array (LeetCode 1122)](https://leetcode.com/problems/relative-sort-array/)
- [Height Checker (LeetCode 1051)](https://leetcode.com/problems/height-checker/)
- [Sort an Array (LeetCode 912)](https://leetcode.com/problems/sort-an-array/)

## Related

- [Radix Sort](../Radix%20Sort/README.md)
- [Bucket Sort](../Bucket%20Sort/README.md)
- [Quick Sort](../Quick%20Sort/README.md)
- [Merge Sort](../Merge%20Sort/README.md)
