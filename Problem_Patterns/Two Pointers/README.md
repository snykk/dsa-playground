# Two Pointers

Two pointers scan a sequence with two indices instead of a nested loop. When each step can prove that one end cannot be part of the best answer, that pointer moves and never comes back, so pair search, partitioning and palindrome checks run in O(n) time and O(1) extra space.

## Intuition

Two shapes cover most problems:

- Opposite ends: `left` starts at the front, `right` at the back, and they move towards each other. This needs an order to prune with, usually a sorted array.
- Same direction: a `read` pointer runs ahead of a `write` pointer to filter or partition in place.

Why it is correct, for two sum on a sorted array: if `arr[left] + arr[right]` is smaller than the target, then every pair `(left, j)` with `j < right` is smaller still, so `arr[left]` has no partner and moves up. If the sum is larger, `arr[right]` has no partner and moves down. Nothing that could be the answer is skipped.

Signals: a sorted array and "find a pair or triplet", "palindrome", "remove duplicates in place", "maximize the area between two positions".

## Visual

```text
arr = [1, 3, 4, 6, 8, 10, 13]   target = 17

 L                    R         1 + 13 = 14 < 17   move L
    L                 R         3 + 13 = 16 < 17   move L
       L              R         4 + 13 = 17        found: [2, 6]
```

## How It Works

1. Place the pointers (both ends, or read and write indices).
2. Compare the current pair and decide which pointer to move, using the order of the data.
3. Stop when `left < right` fails (or `read` reaches the end).

```text
left = 0; right = n - 1
while left < right:
    s = arr[left] + arr[right]
    if s == target: return [left, right]
    if s < target:  left += 1
    else:           right -= 1
```

`three_sum` sorts, fixes index `i`, scans `i + 1 .. n - 1` for `target - arr[i]`, and skips equal values to avoid duplicate triplets. `container_with_most_water` always moves the shorter wall, because moving the taller one can only shrink the width without raising the height limit.

## Step-by-Step Trace

`container_with_most_water([1, 8, 6, 2, 5, 4, 8, 3, 7])`:

| left | right | Heights | Area | Best | Move |
|------|-------|---------|------|------|------|
| 0 | 8 | 1, 7 | 8 | 8 | left |
| 1 | 8 | 8, 7 | 49 | 49 | right |
| 1 | 7 | 8, 3 | 18 | 49 | right |
| 1 | 6 | 8, 8 | 40 | 49 | right |
| 1 | 5 | 8, 4 | 16 | 49 | right |
| 1 | 4 | 8, 5 | 15 | 49 | right |
| 1 | 3 | 8, 2 | 4 | 49 | right |
| 1 | 2 | 8, 6 | 6 | 49 | right, then they meet |

The answer is 49.

## Complexity

| Algorithm | Time | Space |
|-----------|------|-------|
| Opposite-end scan | O(n) | O(1) |
| Three sum | O(n^2) after an O(n log n) sort | O(1) beyond the output (Go also copies the array) |
| Read/write filter | O(n) | O(1) |

## When to Use

Use it on sorted data, for palindromes, and for in-place filtering. Do not use the opposite-end form on unsorted data (sort first, or use a hash map), and do not expect it to find a subset that is not contiguous or pairwise.

## Two Pointers vs. Alternatives

| Approach | Time | Extra space | Needs |
|----------|------|-------------|-------|
| Two pointers | O(n) | O(1) | sorted input for pair search |
| Hash map two sum | O(n) | O(n) | nothing |
| Nested loops | O(n^2) | O(1) | nothing |
| Binary search per element | O(n log n) | O(1) | sorted input |

## Common Pitfalls

- Using the opposite-end scan on an unsorted array.
- Not skipping duplicates in `three_sum`, which repeats triplets.
- `left <= right` instead of `left < right`: a pair needs two different elements.
- C++ `arr.size() - 2` wraps around for short arrays; the code uses `i + 2 < size`.
- `three_sum` sorts the caller's array in Python and C++; Go sorts a copy.
- `remove_duplicates` returns the new length but leaves old values after it; only `arr[:length]` is meaningful.
- `two_sum_sorted` returns `None` in Python, an empty vector in C++ and `nil` in Go when no pair exists.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `two_pointers.py` | `three_sum` sorts in place |
| C++ | [C++/](C++/) | `two_pointers.cpp` | `three_sum` takes a non-const reference and sorts it |
| Go | [Go/](Go/) | `main.go` | `three_sum` copies first; unexported functions |

## Practice Problems

- [LeetCode 167. Two Sum II - Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)
- [LeetCode 15. 3Sum](https://leetcode.com/problems/3sum/)
- [LeetCode 125. Valid Palindrome](https://leetcode.com/problems/valid-palindrome/)
- [LeetCode 26. Remove Duplicates from Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array/)
- [LeetCode 11. Container With Most Water](https://leetcode.com/problems/container-with-most-water/)

## Related

- [Sliding Window](../Sliding%20Window/)
- [Binary Search on Answer](../Binary%20Search%20on%20Answer/)
- [Binary Search](../../Algorithms/Searching/Binary%20Search/)
- [Monotonic Stack](../Monotonic%20Stack/)
