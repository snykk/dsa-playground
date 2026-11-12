# Sliding Window

A sliding window keeps a contiguous range of an array or string and moves its two ends forward, updating the answer incrementally instead of recomputing it. Many "best subarray or substring" problems drop from O(n^2) or worse to a single O(n) pass.

## Intuition

When the window moves one step, almost all of its content is unchanged: one element enters and, sometimes, others leave. Keep a running state (a sum or a frequency map) and adjust it by those few elements instead of rebuilding it.

For a variable window: expand `right` to take in the next element, then shrink `left` while the window is invalid. Both ends only move forward, so each moves at most n times in total, which is why the nested loops are still O(n). The method needs monotone validity: removing elements from a valid window must keep it valid.

Signals: "longest / shortest contiguous subarray or substring with a condition", "every window of size k", "at most k distinct", "no repeating characters", "smallest window containing".

## Visual

```text
s = "eceba", k = 2 (at most 2 distinct)

e c e b a
[e]            right=0  distinct 1   best 1
[e c]          right=1  distinct 2   best 2
[e c e]        right=2  distinct 2   best 3
[e c e b]      right=3  distinct 3 -> too many, shrink:
    [c e b]                           still 3
      [e b]                           2 -> valid, length 2
      [e b a]  right=4  distinct 3 -> shrink:
        [b a]                         length 2        best stays 3
```

## How It Works

1. Expand: move `right` and add `arr[right]` to the state.
2. Shrink while invalid: remove `arr[left]` from the state and advance `left`.
3. Record: the window `[left, right]` has `right - left + 1` elements; update the best answer.

A fixed window of size k skips the shrink loop: add `arr[i]` and subtract `arr[i - k]` in one step. For the shortest valid window (`min_window_substring`) the shrink loop runs while the window is valid, and the answer is recorded inside it.

```text
for right in range(n):
    add(arr[right])
    while invalid():
        remove(arr[left]); left += 1
    best = max(best, right - left + 1)
```

## Step-by-Step Trace

`max_sum_subarray([1, 4, 2, 10, 23, 3, 1, 0, 20], 4)`:

| Window | Elements | Sum |
|--------|----------|-----|
| 0..3 | 1, 4, 2, 10 | 17 |
| 1..4 | 4, 2, 10, 23 | 39 |
| 2..5 | 2, 10, 23, 3 | 38 |
| 3..6 | 10, 23, 3, 1 | 37 |
| 4..7 | 23, 3, 1, 0 | 27 |
| 5..8 | 3, 1, 0, 20 | 24 |

The maximum is 39.

## Complexity

| Variant | Time | Space |
|---------|------|-------|
| Fixed window | O(n) | O(1) |
| Variable window (count map) | O(n) | O(k) or O(alphabet) |
| Minimum window substring | O(\|s\| + \|t\|) | O(\|s\| + \|t\|) in the worst case |

Both pointers advance at most n steps, so the total is at most 2n pointer moves.

## When to Use

Use it for contiguous ranges whose validity is monotone: non-negative numbers, or strings with a count condition. Do not use it when negative numbers make the sum condition non-monotone (use prefix sums with a hash map) or when the subsequence need not be contiguous (use DP).

## Sliding Window vs. Alternatives

| Approach | Time | Use when |
|----------|------|----------|
| Sliding window | O(n) | contiguous range with monotone validity |
| Prefix sums plus hash map | O(n) | sums with negative numbers |
| Brute force over all ranges | O(n^2) or O(n^3) | tiny inputs |
| Monotonic queue | O(n) | the maximum or minimum of each window |

## Common Pitfalls

- Recording the shortest window outside the shrink loop.
- Leaving zero-count entries in the map, so `len(map)` over-counts distinct characters.
- Using it with negative numbers in a sum condition.
- Off-by-one: the window `[left, right]` has `right - left + 1` elements.
- Invalid `k`: `max_sum_subarray` returns 0 for `k <= 0` or `k > len(arr)` in all three languages.
- Strings are bytes in C++ and Go and code points in Python, so non-ASCII input can differ.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `sliding_window.py` | dict counters; code points |
| C++ | [C++/](C++/) | `sliding_window.cpp` | `unordered_map<char, int>`; `int` sums |
| Go | [Go/](Go/) | `main.go` | `map[byte]int`; unexported functions |

## Practice Problems

- [LeetCode 643. Maximum Average Subarray I](https://leetcode.com/problems/maximum-average-subarray-i/)
- [LeetCode 3. Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/)
- [LeetCode 340. Longest Substring with At Most K Distinct Characters](https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/)
- [LeetCode 76. Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/)
- [LeetCode 567. Permutation in String](https://leetcode.com/problems/permutation-in-string/)

## Related

- [Two Pointers](../Two_Pointers/)
- [Monotonic Queue](../Monotonic_Queue/)
- [Prefix Sum Difference Array](../Prefix_Sum_Difference_Array/)
- [Hash Map](../../Data_Structures/Hashing/Hash_Map/)
