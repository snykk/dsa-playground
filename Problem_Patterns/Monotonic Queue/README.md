# Monotonic Queue

A monotonic queue is a deque whose values stay sorted from front to back, so the maximum (or minimum) of a sliding window is always at the front. It computes every window maximum in O(n) total instead of O(n * k).

## Intuition

Imagine a line of people ordered by height, newcomers joining at the back. When someone taller arrives, every shorter person at the back can leave: they entered earlier, so they also leave the window earlier, and the taller newcomer beats them for as long as they could matter. The front of the line is always the tallest person still in view. People also leave from the front when they slide out of the window.

Invariants: every index in the deque lies inside the current window, the values at those indices decrease from front to back, and the front is the window maximum. For the minimum, flip the comparison.

Signals: "maximum or minimum of every window of size k", DP with `dp[i] = best(dp[i-k..i-1]) + cost`, "longest subarray with max - min <= limit".

## Visual

```text
arr = [1, 3, -1, -3, 5, 3, 6, 7], k = 3     deque shows indices (values)

i=0  [0(1)]
i=1  [1(3)]               3 pops 1
i=2  [1(3), 2(-1)]                          window max 3
i=3  [1(3), 2(-1), 3(-3)]                   window max 3
i=4  [4(5)]               1 expires, 5 pops -3 and -1    window max 5
i=5  [4(5), 5(3)]                           window max 5
i=6  [6(6)]               6 pops 3 and 5    window max 6
i=7  [7(7)]               7 pops 6          window max 7

output: [3, 3, 5, 5, 6, 7]
```

## How It Works

For each index `i`:

1. Pop from the front while the front index is `<= i - k` (outside the window).
2. Pop from the back while `arr[back] <= arr[i]` (dominated).
3. Push `i`.
4. If `i >= k - 1`, record `arr[front]`.

```text
for i in range(n):
    while dq and dq[0] <= i - k: dq.popleft()
    while dq and arr[dq[-1]] <= arr[i]: dq.pop()
    dq.append(i)
    if i >= k - 1: result.append(arr[dq[0]])
```

## Step-by-Step Trace

`arr = [3, 1, -1, 2]`, `k = 2`:

| i | arr[i] | Evict front | Pop back | Deque (indices) | Output |
|---|--------|-------------|----------|-----------------|--------|
| 0 | 3 | none | none | [0] | none yet |
| 1 | 1 | none | none | [0, 1] | 3 |
| 2 | -1 | 0 (0 <= 0) | none | [1, 2] | 1 |
| 3 | 2 | 1 (1 <= 1) | 2 (-1 <= 2) | [3] | 2 |

Result: `[3, 1, 2]`.

## Complexity

| Quantity | Value | Why |
|----------|-------|-----|
| Time | O(n) | each index is pushed once and popped at most once |
| Per window | O(1) | the answer is the front |
| Space | O(k) | at most k indices in the deque |

## When to Use

Use it for sliding window maximum or minimum, DP transitions over a bounded window, and constrained subarray problems. Do not use it for static range queries (Sparse Table or Segment Tree) or for ranks such as the median or the k-th element (balanced tree or two heaps).

## Monotonic Queue vs. Alternatives

| Technique | Best for | Time |
|-----------|----------|------|
| Monotonic queue | sliding window min or max | O(n) total |
| Heap with lazy deletion | sliding window max, simple to write | O(n log n) |
| Balanced tree / multiset | any rank query in a window | O(n log k) |
| Sparse table | static range min or max | O(n log n) build, O(1) query |
| Segment tree | arbitrary range queries and updates | O(log n) per query |

## Common Pitfalls

- Storing values instead of indices: you cannot see when the front leaves the window, and equal values are evicted wrongly (`[5, 5, 1]` with `k = 2` must give `[5, 5]`).
- Evicting the front after reading the answer instead of before.
- Emitting output during the first `k - 1` steps.
- Using a decreasing deque for a minimum, or the reverse.
- Python `MonotonicDeque` evicts by index: call `pop_front_if` once for every value leaving the window, oldest first.
- `k <= 0`, an empty array or `k > len(arr)` return an empty result.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `monotonic_queue.py` | `collections.deque` of indices; also a reusable `MonotonicDeque` class |
| C++ | [C++/](C++/) | `monotonic_queue.h` | header-only, `std::deque<int>` of indices |
| Go | [Go/](Go/) | `main.go` | slice as deque; front pop reslices `dq[1:]` |

## Practice Problems

- [LeetCode 239. Sliding Window Maximum](https://leetcode.com/problems/sliding-window-maximum/)
- [LeetCode 862. Shortest Subarray with Sum at Least K](https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/)
- [LeetCode 1438. Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit](https://leetcode.com/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit/)
- [LeetCode 1499. Max Value of Equation](https://leetcode.com/problems/max-value-of-equation/)
- [Codeforces 372C. Watching Fireworks is Fun](https://codeforces.com/problemset/problem/372/C)

## Related

- [Monotonic Stack](../Monotonic%20Stack/)
- [Sliding Window](../Sliding%20Window/)
- [Two Pointers](../Two%20Pointers/)
- [Deque](../../Data%20Structures/Linear/Queue/Deque/)
