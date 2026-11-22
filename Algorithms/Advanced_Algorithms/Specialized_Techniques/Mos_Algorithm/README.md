# Mo's Algorithm

Mo's algorithm answers many offline range queries by sorting them so that a sliding window [L, R] moves as little as possible from one query to the next. If adding or removing one element is O(1), Q queries on N elements cost O((N + Q) sqrt N) in total.

In this repository the maintained answer is fixed to one problem: the number of distinct values in a range.

## Intuition

Keep a window and its answer. Moving a window edge by one element is cheap (`add` / `remove`), so the cost of a query is the distance the window edges travel. Sorting the queries by the block of `l` and then by `r` bounds the total travel: inside one block `r` sweeps right once and `l` moves at most one block width per query.

## Visual

```text
arr   = [1, 1, 2, 1, 3, 4, 3, 3, 4]      block size = 3 (blocks of l: 0-2, 3-5, 6-8)
query (2, 6):
index   0  1  2  3  4  5  6  7  8
value   1  1  2  1  3  4  3  3  4
              L-----------R            window [2, 6] -> {2, 1, 3, 4} = 4 distinct
```

## How It Works

1. Block size `B = max(1, floor(sqrt(N)))`.
2. Sort queries by `(l // B, r)` ascending (no odd-even trick).
3. Start with an empty window (`cur_l = 0`, `cur_r = -1`).
4. For each query: expand left, expand right, shrink left, shrink right, calling `add` or `remove` per element.
5. Store the answer at the query's original index.

Expanding before shrinking keeps the window valid for every valid query (`l <= r`).

## Step-by-Step Trace

`arr = [1, 1, 2, 1, 3, 4, 3, 3, 4]`, `B = 3`, queries `(0,4) (6,8) (1,3) (5,7) (2,6)`. Sorted order and pointer moves:

| Order | Query | Moves | Running total |
|-------|-------|-------|---------------|
| 1 | (1, 3) | 5 | 5 |
| 2 | (0, 4) | 2 | 7 |
| 3 | (2, 6) | 4 | 11 |
| 4 | (5, 7) | 4 | 15 |
| 5 | (6, 8) | 2 | 17 |

In input order the same queries would need 37 moves. Answers in input order: `[3, 2, 2, 2, 4]`.

## Complexity

| Part | Time | Space |
|------|------|-------|
| Sorting | O(Q log Q) | O(Q) |
| Pointer movement | O((N + Q) sqrt N) | O(N) for the frequency map |

Why: one block's queries have increasing `r`, so `r` moves at most N per block and N * N / B overall; `l` moves at most about B per query, so Q * B overall. With `B = sqrt(N)` this is O((N + Q) sqrt N).

## When to Use

Use it for offline range queries where the window answer can be updated by adding or removing one element (distinct count, frequency-based statistics). Do not use it when a prefix sum or segment tree answers the query, when queries must be answered online, or when the array changes between queries.

## Mo's Algorithm vs. Alternatives

| Approach | Query time | Needs | Online |
|----------|-----------|-------|--------|
| Mo's algorithm | O(sqrt N) amortized when Q >= N | O(1) add and remove | No |
| Segment tree | O(log N) | an associative merge | Yes |
| Prefix sums | O(1) | an invertible operation | Yes |
| Brute force | O(N) | nothing | Yes |

## Common Pitfalls

- Shrinking before expanding: counts can go negative.
- Not restoring the input order of the answers.
- Block size 0 on an empty array; the code uses a minimum of 1.
- Slow `add` / `remove` multiplies the total by their cost.
- Invalid queries (`l > r`) are not rejected; do not rely on their result.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `mos_algorithm.py` | `MoSAlgorithm.process_queries`, `count_distinct_in_ranges` |
| C++ | [C++/](C++/) | `mos_algorithm.cpp` | `countDistinctInRanges`, `unordered_map` frequencies |
| Go | [Go/](Go/) | `main.go` | `countDistinctInRanges` (unexported), `[][]int` queries |

## Practice Problems

- [D-query (SPOJ DQUERY)](https://www.spoj.com/problems/DQUERY/)
- [Distinct Values Queries (CSES 1734)](https://cses.fi/problemset/task/1734)
- [Little Elephant and Array (Codeforces 220B)](https://codeforces.com/problemset/problem/220/B)
- [Powerful array (Codeforces 86D)](https://codeforces.com/problemset/problem/86/D)
- [XOR and Favorite Number (Codeforces 617E)](https://codeforces.com/problemset/problem/617/E)

## Related

- [Square Root Decomposition](../Square_Root_Decomposition/)
- [Heavy-Light Decomposition](../Heavy_Light_Decomposition/)
- [Specialized Techniques overview](../)
