# Space Complexity

Space complexity describes how much memory an algorithm needs as the input grows. By convention you count the extra (auxiliary) memory, including the recursion stack, and leave out the input itself.

## Intuition

Memory is used in three places: scalar variables (O(1)), data you build (a list of `n` items is O(n), an `n` by `n` matrix is O(n^2)), and the **call stack**, where every active call keeps a frame. Recursion `d` levels deep holds `d` frames at once, so a recursive function with no arrays can still use O(n) space.

Three terms to keep apart:

- **Input space**: the memory that holds the input. Usually not counted.
- **Auxiliary space**: extra memory the algorithm allocates, including the stack. This is what "space complexity" normally means.
- **Total space**: input plus auxiliary.

Like the time bounds, space bounds are Big-O statements about a function, here the memory used as a function of `n`. They can be given for the best, average or worst case of the memory used.

## Visual

```text
logarithmic_space_example(16): the stack at its deepest point

  | f(1)  |   <- base case, 5 frames alive = log2(16) + 1
  | f(2)  |
  | f(4)  |
  | f(8)  |
  | f(16) |
  +-------+

Calls: 31 in total (time O(n)), but never more than 5 alive at once (space O(log n)).
```

## How It Works

To find the space complexity:

1. Name what you count (auxiliary or total, output included or not).
2. Find the **largest amount of memory alive at the same time**, not the sum of everything ever allocated.
3. For recursion, take the maximum depth of the call stack, times the memory each frame holds.
4. Drop constants and lower-order terms.

Examples from the code:

| Function | Time | Space | Why |
|----------|------|-------|-----|
| `constant_space_example(n)` | O(n) | O(1) | one running total |
| `in_place_reverse(arr)` | O(n) | O(1) | two indices and a swap |
| `linear_space_example(n)` | O(n) | O(n) | list of n items |
| `quadratic_space_example(n)` | O(n^2) | O(n^2) | n by n matrix |
| `logarithmic_space_example(n)` (Python only) | O(n) | O(log n) | two calls on halves, one after the other |
| `recursive_fibonacci_naive(n)` (Python only) | O(2^n) | O(n) | only one root-to-leaf path is on the stack |
| `merge_sort_space(arr)` (Python only) | O(n log n) | O(n) | merge buffers form a geometric series |

## Step-by-Step Trace

Why Merge Sort uses O(n) space and not O(n log n). There are log n levels and n elements of work per level, but the memory of a finished merge is freed before the next one starts. The live data is the array plus, at any time, a chain of halves:

```text
n + n/2 + n/4 + ... < 2n   ->   O(n)
```

And why naive Fibonacci has O(n) space although it makes exponentially many calls: `fib(n - 1)` returns before `fib(n - 2)` starts, so the stack holds one path of the call tree. Measured maximum depth of `recursive_fibonacci_naive`: 5, 10 and 20 for n = 5, 10 and 20.

## Complexity

| Bound | Example | Memory for n = 10 / 100 / 1,000 (cells) |
|-------|---------|------------------------------------------|
| O(1) | a few variables | 1 / 1 / 1 |
| O(log n) | balanced recursion depth | 4 / 7 / 10 |
| O(n) | a copy of the input | 10 / 100 / 1,000 |
| O(n^2) | n by n matrix | 100 / 10,000 / 1,000,000 |

| Algorithm | Time | Auxiliary space |
|-----------|------|-----------------|
| Binary search, iterative | O(log n) | O(1) |
| Binary search, recursive | O(log n) | O(log n) |
| Merge Sort (arrays) | O(n log n) | O(n) |
| Quick Sort | O(n log n) average | O(log n) if the smaller side is recursed first |
| Heap Sort | O(n log n) | O(1) |
| DFS / BFS on a graph | O(V + E) | O(V) |

## When to Use

- Before choosing between a recursive and an iterative version: depth `n` costs O(n) memory.
- When memory is limited (embedded systems, huge inputs), to decide whether an in-place algorithm is required.
- When trading space for time on purpose: hash tables and memoization spend O(n) memory to avoid recomputation; in-place algorithms and streaming do the opposite.

## Space Complexity vs. Time Complexity

| | Time | Space |
|---|------|-------|
| Measures | steps executed | memory alive at once |
| Accumulates over the run | yes (every step counts) | no (freed memory is reused) |
| Hidden cost | hidden loops in library calls | stack frames, slicing and copies |
| Typical trade-off | spend memory to save time | spend time to save memory |

## Common Pitfalls

- Believing recursion is free. Every active call has a frame, so depth `d` costs O(d).
- Counting all calls instead of the calls alive at once (naive Fibonacci is O(n) space, not O(2^n)).
- Summing allocations over time. Merge Sort's buffers are freed and reused.
- Slicing in Python: `arr[:mid]` copies. Pass indices to avoid the copies.
- Mixing input and auxiliary space, or forgetting whether the returned output counts. State your convention.
- Ignoring language limits: Python raises `RecursionError` after about 1,000 nested calls by default; C++ has a fixed-size stack; Go grows goroutine stacks on demand (starting at 2 KB in current versions).

## Implementations

- [Python](./Python/space_complexity.py): seven examples (constant, linear, quadratic, logarithmic, naive Fibonacci, in-place reverse, Merge Sort).
- [C++](./C++/space_complexity.cpp): four examples (constant, linear, quadratic, in-place reverse).
- [Go](./Go/main.go): the same four examples.

## Practice Problems

- [Reverse String (LeetCode 344)](https://leetcode.com/problems/reverse-string/): the in-place O(1) reverse.
- [Climbing Stairs (LeetCode 70)](https://leetcode.com/problems/climbing-stairs/): O(n) memo table, reducible to O(1) with two variables.
- [Fibonacci Number (LeetCode 509)](https://leetcode.com/problems/fibonacci-number/): compare recursive, memoized and iterative space.
- [Sort an Array (LeetCode 912)](https://leetcode.com/problems/sort-an-array/): compare the space of Merge Sort and Heap Sort.

## Related

- [Big-O Notation](../Time%20Complexity/Big-O%20Notation/)
- [Amortized Analysis](../Amortized%20Analysis/)
- [Merge Sort](../../Algorithms/Sorting/Merge%20Sort/)
- [Quick Sort](../../Algorithms/Sorting/Quick%20Sort/)
- [Heap Sort](../../Algorithms/Sorting/Heap%20Sort/)
