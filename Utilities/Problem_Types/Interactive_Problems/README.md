# Interactive Problems

In an interactive problem your program talks to a judge program while it runs: you send queries, read replies and must find a hidden value within a query budget. Flushing, exact formats and a good search strategy matter more than raw speed. The usual tool is binary search, which needs O(log n) queries.

## Intuition

Each reply removes part of the search space. A good strategy removes as much as possible per query, so you should know the worst-case number of queries before coding. The protocol adds one hard rule: standard output is buffered, so every query must be flushed or the judge never sees it and both programs wait forever.

## Visual

```text
solution                          judge
   | ---- "? 5"   (flush) ---->     |    secret = 7
   | <---- "higher" -------------   |
   | ---- "? 8"   (flush) ---->     |
   | <---- "lower" --------------   |
   | ---- "? 6"   (flush) ---->     |
   | <---- "higher" -------------   |
   | ---- "! 7"   (flush) ---->     |    interval [7, 7]: answer
```

## How It Works

1. Read the protocol: query format (`? x`), answer format (`! x`), reply format, error reply (often `-1`), query limit.
2. Count queries for your strategy in the worst case.
3. Loop: print the query, flush, read the reply, update what you know. On `-1`, exit at once.
4. Print the final answer once, in the required format, and flush it.

Flushing:

| Language | How |
|----------|-----|
| Python | `print(x, flush=True)` |
| C++ | `cout << x << endl;` or `cout << x << "\n"; cout.flush();` |
| Go | write to a `bufio.Writer` and call `Flush()` |

## Step-by-Step Trace

`guess_number(10)` with the secret 7 (replies `higher`, `lower` or `correct`):

| Query | Interval before | Reply | Interval after |
|-------|-----------------|-------|----------------|
| `? 5` | [1, 10] | higher | [6, 10] |
| `? 8` | [6, 10] | lower | [6, 7] |
| `? 6` | [6, 7] | higher | [7, 7] |

One value is left, so the program prints `! 7`: 3 queries. If the judge ever replies `correct`, the function returns without printing `! x`, because in this protocol the judge ends the game.

## Complexity

| Strategy | Queries |
|----------|---------|
| `guess_number` / `guessNumber` / `GuessNumber` | at most floor(log2 n) + 1 |
| `findMinimumInteractive` (rotated array) | at most ceil(log2 n) + 1 |
| `binary_subset_search` | bit length of n |
| `find_maximum`, `tournament` | n - 1 comparisons |
| `guess_subset` | n |
| `explore_graph` | one per reachable node |

The local running time is the number of queries plus bookkeeping; the judge's query limit is the constraint that matters.

## When to Use

Use these patterns when the input is hidden and reachable only through a limited query interface. Binary search needs a monotone oracle; comparison strategies need a comparison oracle; graph exploration needs a neighbor oracle.

## Interactive Strategies vs. Alternatives

| Strategy | Queries | Needs |
|----------|---------|-------|
| Linear scan | O(n) | any oracle |
| Binary search | O(log n) | monotone / sorted structure |
| Tournament | n - 1, in log n batchable rounds | comparisons |
| Bit-by-bit | log n | mask oracle |

## Common Pitfalls

- Forgetting to flush a query or the final answer.
- Debug output on stdout (the judge reads it as a query); use stderr.
- Reading a reply that was never sent, or ignoring `-1`.
- Wasting queries: re-asking a value you already know (the C++ `findMinimumInteractive` now asks `hi` once).
- Answering twice, or not at all.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `interactive.py` | query/answer helpers and 7 strategies |
| C++ | [C++/](C++/) | `interactive.cpp` | 9 functions; `queryWithEndl`, `queryWithFlush` show both flushing styles |
| Go | [Go/](Go/) | `main.go` | `Query`, `Answer`, `GuessNumber`, `BinarySearchAnswer` |

Each language is tested against an in-process fake judge.

## Practice Problems

- [LeetCode 374 - Guess Number Higher or Lower](https://leetcode.com/problems/guess-number-higher-or-lower/)
- [LeetCode 278 - First Bad Version](https://leetcode.com/problems/first-bad-version/)
- [LeetCode 702 - Search in a Sorted Array of Unknown Size](https://leetcode.com/problems/search-in-a-sorted-array-of-unknown-size/)
- [LeetCode 1095 - Find in Mountain Array](https://leetcode.com/problems/find-in-mountain-array/)

## Related

- [Binary Search](../../../Algorithms/Searching/Binary_Search/)
- [Constructive Algorithms](../Constructive_Algorithms/)
- [Game Theory](../Game_Theory/)
