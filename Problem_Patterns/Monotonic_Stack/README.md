# Monotonic Stack

A monotonic stack keeps its elements in sorted order, popping everything that breaks the order before each push. Every pop gives the popped element its answer, so "next greater element", "days until warmer" and "largest rectangle in a histogram" run in O(n) instead of O(n^2).

## Intuition

Scan left to right and keep only the elements that are still waiting for an answer. For the next greater element those waiting elements are in decreasing order, because a bigger newcomer immediately answers every smaller element above it. When the newcomer arrives it pops everything it beats, hands each popped element its answer, and then waits itself.

Invariant: the stack holds exactly the indices whose answer has not been found yet, and their values are monotone from bottom to top. Each index is pushed once and popped at most once.

Signals: "next / previous greater / smaller", "days until", "span", "nearest shorter bar", "largest rectangle".

## Visual

```text
arr = [4, 5, 2, 10, 8]        stack holds indices; values shown

i=0  push 4                    stack: [4]
i=1  5 beats 4 -> NGE(4)=5     stack: [5]
i=2  2 < 5, push               stack: [5, 2]
i=3  10 beats 2 and 5          stack: [10]      NGE(2)=10, NGE(5)=10
i=4  8 < 10, push              stack: [10, 8]
end  10 and 8 have no answer   NGE = -1

result: [5, 10, 10, -1, -1]
```

## How It Works

1. For each index `i`, while the stack is not empty and the top breaks the order (for next greater: `arr[top] < arr[i]`), pop it and record `arr[i]` as its answer.
2. Push `i`.
3. Whatever remains on the stack at the end has no answer.

| Question | Stack (bottom to top) | Pop while | Answer found |
|----------|-----------------------|-----------|--------------|
| Next greater | decreasing | top < new | when popped |
| Next smaller | increasing | top > new | when popped |
| Previous greater | decreasing | top <= new | top after popping |
| Previous smaller | increasing | top >= new | top after popping |
| Largest rectangle | increasing | top >= new | width from new top to i |

Duplicates: next-greater pops on `<` and previous-greater pops on `<=`, so both answer with a strictly greater value. For `[3, 3, 3, 5]` the next greater is `[5, 5, 5, -1]` and the previous greater is `[-1, -1, -1, -1]`. The histogram pops on `>=`; the last of several equal bars covers the full width.

## Step-by-Step Trace

Largest rectangle for `heights = [2, 1, 5, 6, 2, 3]` (stack of indices, increasing heights):

| i | Action | Area candidate | Stack after |
|---|--------|----------------|-------------|
| 0 | push 0 | | [0] |
| 1 | height 1 pops 2 (width 1) | 2 | [1] |
| 2, 3 | push | | [1, 2, 3] |
| 4 | height 2 pops 6 (width 1), then 5 (width 2) | 6, 10 | [1, 4] |
| 5 | push | | [1, 4, 5] |
| end | pop 3 (width 1), 2 (width 4), 1 (width 6) | 3, 8, 6 | [] |

The answer is 10 (bars 2 and 3, height 5).

## Complexity

| Quantity | Value | Why |
|----------|-------|-----|
| Time | O(n) | at most n pushes and n pops |
| Space | O(n) | a strictly decreasing array never pops |

## When to Use

Use it when each element needs its nearest greater or smaller neighbour, or a width bounded by the nearest shorter bar. Do not use it when the window slides and elements must expire from the front (use a monotonic queue), or for arbitrary range queries (use a segment tree or sparse table).

## Monotonic Stack vs. Alternatives

| Approach | Time | Notes |
|----------|------|-------|
| Monotonic stack | O(n) | one pass, answers by popping |
| Brute force scan | O(n^2) | rescans from each index |
| Monotonic queue | O(n) | adds expiry from the front for sliding windows |
| Segment tree / sparse table | O(n log n) build | arbitrary range min or max |

## Common Pitfalls

- Storing values instead of indices: distances and widths need indices.
- Mixing strict and non-strict comparisons: decide whether equal values count and keep it consistent.
- Forgetting the leftovers: the histogram must also pop the remaining stack with width n.
- `-1` means "no answer", which is ambiguous when the array contains -1 (all three languages); return indices if that matters.
- `largestRectangleHistogram` uses `int` in C++ and Go; `height * width` can overflow for very large inputs.
- Using a stack for a sliding window.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `monotonic_stack.py` | list as stack of indices |
| C++ | [C++/](C++/) | `monotonic_stack.cpp` | `std::stack<int>` of indices; `int` area |
| Go | [Go/](Go/) | `main.go` | slice as stack; exported names |

## Practice Problems

- [LeetCode 496. Next Greater Element I](https://leetcode.com/problems/next-greater-element-i/)
- [LeetCode 739. Daily Temperatures](https://leetcode.com/problems/daily-temperatures/)
- [LeetCode 901. Online Stock Span](https://leetcode.com/problems/online-stock-span/)
- [LeetCode 84. Largest Rectangle in Histogram](https://leetcode.com/problems/largest-rectangle-in-histogram/)
- [LeetCode 42. Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/)

## Related

- [Monotonic Queue](../Monotonic_Queue/)
- [Sliding Window](../Sliding_Window/)
- [Two Pointers](../Two_Pointers/)
- [Stack](../../Data_Structures/Linear/Stack/)
