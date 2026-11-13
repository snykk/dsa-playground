# Radix Sort

Radix Sort sorts integers one digit at a time, from the least significant digit to the most significant, using a stable counting sort for each digit. It never compares two numbers. With `d` decimal digits it runs in O(d (n + 10)) time and O(n + 10) extra space.

## Intuition

Sorting a stack of numbered cards by hand: first deal them into ten piles by the last digit and collect the piles in order; then deal by the tens digit, and collect; then by the hundreds. After the last round the stack is sorted.

Invariant: after the pass for digit `d`, the array is sorted by its last `d` digits. This only holds if each pass is **stable**: numbers with an equal current digit must keep the order given by the earlier passes.

## Visual

```text
input     : 170  45  75  90 802  24   2  66

by units  : 170  90 802   2  24  45  75  66     (last digit 0 0 2 2 4 5 5 6)
by tens   : 802   2  24  45  66 170  75  90     (tens digit 0 0 2 4 6 7 7 9)
by hundred:   2  24  45  66  75  90 170 802     (hundreds 0 0 0 0 0 0 1 8)
```

## How It Works

1. Let `offset = min(min(arr), 0)`. Each pass uses the key `value - offset`, which is never negative and keeps the order, so negative numbers work.
2. Let `maxKey = max(arr) - offset`. The number of passes is the number of decimal digits of `maxKey`.
3. For `exp = 1, 10, 100, ...` while `maxKey / exp > 0`: run a stable counting sort on the digit `((value - offset) / exp) % 10`.

The digit sort counts the 10 digits, turns the counts into positions with prefix sums and places elements from back to front, which keeps equal digits in their previous order.

## Step-by-Step Trace

Input `[170, 45, 75, 90, 802, 24, 2, 66]` (the largest value has 3 digits, so there are 3 passes):

| Pass | Digit | Array after the pass |
|------|-------|----------------------|
| 1 | units | 170 90 802 2 24 45 75 66 |
| 2 | tens | 802 2 24 45 66 170 75 90 |
| 3 | hundreds | 2 24 45 66 75 90 170 802 |

In pass 2, 170 and 75 share the tens digit 7 and keep the order of pass 1 (170 first). Passes never need to look at the other digits.

## Complexity

| Case | Time | Space | When |
|------|------|-------|------|
| Best | O(d (n + b)) | O(n + b) | the cost does not depend on the order of the input |
| Average | O(d (n + b)) | O(n + b) | same |
| Worst | O(d (n + b)) | O(n + b) | many digits |

`d` is the number of digits of the largest key and `b = 10` is the base. Each pass is a counting sort over `n` elements with `b` counters. With negative values the number of digits is that of `max - min`. If all values are 0 there are no passes. A fixed `d` makes it linear in `n`, but for `n` distinct integers `d` is at least log10(n), so the bound is `n log n` in general.

## When to Use

Use it for large arrays of integers with a limited number of digits, fixed-width keys (IDs, codes, dates as numbers), and stable multi-key sorting. Avoid it for floats, for strings of different lengths (use MSD radix sort or a comparison sort), for small arrays and when memory is tight.

## Radix Sort vs. Alternatives

| Algorithm | Time | Extra space | Stable | Works on |
|-----------|------|-------------|--------|----------|
| Radix Sort | O(d (n + b)) | O(n + b) | Yes | integers with limited digits |
| [Counting Sort](../Counting%20Sort/README.md) | O(n + k) | O(n + k) | Yes | integers in a small range |
| [Bucket Sort](../Bucket%20Sort/README.md) | O(n + k) average | O(n + k) | depends | numbers spread evenly |
| [Quick Sort](../Quick%20Sort/README.md) | O(n log n) average | O(log n) | No | anything comparable |

## Common Pitfalls

- An unstable digit sort scrambles the earlier passes and gives a wrong order. Place elements back to front.
- Negative numbers: a negative value has no valid digit. The code shifts every value by the minimum first.
- `exp * 10` overflows a 32-bit integer once the maximum reaches 10^9. The C++ version uses `long long` and the Go version `uint64`.
- Stopping one pass early: the loop must continue while `maxKey / exp > 0`.
- LSD works only from the least significant digit; most-significant-first needs recursion into groups (not implemented here).

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `radix_sort.py` | `radix_sort(arr)` (in place, returns the list) and `counting_sort_by_digit(arr, exp, offset=0)` |
| C++ | [C++](C++/) | `radix_sort.cpp` | `radixSort(std::vector<int>&)` and `countingSortByDigit`; `long long` keys, the whole `int` range works |
| Go | [Go](Go/) | `main.go` | `RadixSort([]int)`; `uint64` keys, the whole `int` range works |

All three are LSD with base 10; other bases are not implemented.

## Practice Problems

- [Maximum Gap (LeetCode 164)](https://leetcode.com/problems/maximum-gap/)
- [Sort an Array (LeetCode 912)](https://leetcode.com/problems/sort-an-array/)
- [Sort Colors (LeetCode 75)](https://leetcode.com/problems/sort-colors/)

## Related

- [Counting Sort](../Counting%20Sort/README.md)
- [Bucket Sort](../Bucket%20Sort/README.md)
- [Quick Sort](../Quick%20Sort/README.md)
- [Merge Sort](../Merge%20Sort/README.md)
