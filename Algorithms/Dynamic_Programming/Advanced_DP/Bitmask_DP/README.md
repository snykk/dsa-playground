# Bitmask DP

Bitmask DP stores a subset of n items as the bits of one integer and uses that integer as a DP state. It replaces a search over n! orderings with a table of 2^n subsets, so the Traveling Salesman Problem (TSP) takes O(n^2 * 2^n) time and O(n * 2^n) space instead of O(n!).

## Intuition

If two partial solutions used the same set of items and stand in the same place, their futures are identical, so only the cheaper one matters. The order in which the items were used is forgotten. An integer with n bits encodes the set: bit `i` is 1 when item `i` is used. Because the integer is also an array index, the table of "best cost for each set" is a plain array of size 2^n.

For TSP the state is `dp[mask][last]`: the cheapest path that starts at city 0, visits exactly the cities in `mask` and currently stands at `last`.

## Visual

```text
mask 0101  = {A, C}  (bit 0 = A, bit 1 = B, bit 2 = C, bit 3 = D)

dp[0001][A] = 0
   |  + dist[A][B]
   v
dp[0011][B] = 10  --+ dist[B][C]-->  dp[0111][C]
   |                                   ...
   +-- + dist[B][D] --> dp[1011][D] --> ... --> dp[1111][*]  --> + dist[last][A]
```

Every transition turns one 0 bit into a 1 bit, so the new mask is larger than the old one.

## How It Works

1. State: `dp[mask][last]`, with bit `last` set in `mask`. All cells start at infinity.
2. Base case: `dp[1][0] = 0` (only city 0 visited, standing at city 0).
3. For each `mask` from 1 upward (skip masks without bit 0), each `last` in `mask` and each `j` not in `mask`: `dp[mask | (1 << j)][j] = min(itself, dp[mask][last] + dist[last][j])`.
4. Answer: `min over last of dp[full][last] + dist[last][0]` where `full = (1 << n) - 1`.
5. If the minimum is still infinity, no tour exists, and the function returns infinity.

Handy bit operations:

| Goal | Expression |
|------|------------|
| Item `i` in the set? | `mask & (1 << i)` |
| Add item `i` | `mask \| (1 << i)` |
| Remove item `i` | `mask & ~(1 << i)` |
| Full set of n items | `(1 << n) - 1` |

## Step-by-Step Trace

Distances for cities A, B, C, D:

```text
      A   B   C   D
 A [  0, 10, 15, 20]
 B [ 10,  0, 35, 25]
 C [ 15, 35,  0, 30]
 D [ 20, 25, 30,  0]
```

The table, restricted to masks that contain A (mask written with D on the left):

| mask | last = A | last = B | last = C | last = D |
|------|----------|----------|----------|----------|
| 0001 | 0 | inf | inf | inf |
| 0011 | inf | 10 | inf | inf |
| 0101 | inf | inf | 15 | inf |
| 0111 | inf | 50 | 45 | inf |
| 1001 | inf | inf | inf | 20 |
| 1011 | inf | 45 | inf | 35 |
| 1101 | inf | inf | 50 | 45 |
| 1111 | inf | 70 | 65 | 75 |

Closing the tour from `1111`: B gives 70 + 10 = 80, C gives 65 + 15 = 80, D gives 75 + 20 = 95. The answer is 80, for example A, B, D, C, A (10 + 25 + 30 + 15).

## Complexity

| | Time | Space |
|---|------|-------|
| TSP (`dp[mask][last]`) | O(n^2 * 2^n) | O(n * 2^n) |
| Subset DP (`dp[mask]` only) | O(n * 2^n) | O(2^n) |

There are 2^n masks and n values of `last`, and each cell tries up to n next cities. The table is n * 2^n cells: about 21 million for n = 20, which is hundreds of megabytes as Python floats. The practical limit is n of about 15 in Python and 20 to 25 in C++ or Go.

## When to Use

- The statement has a small bound (n <= 16 to 20) beside "every ordering", "assign each", or "cover all".
- The future depends only on which items are used, not on the order.
- Do not use it for large n: switch to heuristics or approximation, or look for a greedy or polynomial structure.

## Bitmask DP vs. Alternatives

| Approach | Time | Exact | Use when |
|----------|------|-------|----------|
| Brute force over permutations | O(n!) | Yes | n up to about 10 |
| Bitmask DP | O(n^2 * 2^n) | Yes | n up to about 20 |
| Meet in the middle | O(2^(n/2) * n) | Yes | subset-sum style, n up to about 40 |
| Heuristics | polynomial | No | n in the hundreds |

## Common Pitfalls

- Returning 0 when no tour exists. The final minimum stays infinity in that case, and this implementation returns `float('inf')`.
- Reading `dp[mask][last]` when bit `last` is not in `mask`.
- Missing parentheses: write `mask & (1 << i)`.
- 32-bit overflow of `1 << j` for j >= 31 in C++ and Go; use 64-bit masks.
- Forgetting the edge back to city 0, which turns the cycle into a path.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `bitmask_dp.py` | Complete `traveling_salesman_dp`; 4 tests |
| C++ | [C++](C++/) | `bitmask_dp.cpp` | Placeholder: comment-only stub, test only prints a message |
| Go | [Go](Go/) | `main.go` | Placeholder: package stub, test asserts nothing |

## Practice Problems

- [Traveling Salesman Problem (CSES Hamiltonian Flights counts routes with the same state)](https://cses.fi/problemset/task/1690)
- [Elevator Rides (CSES)](https://cses.fi/problemset/task/1653)
- [Matching (Educational DP Contest, problem O)](https://atcoder.jp/contests/dp/tasks/dp_o)
- [Shortest Path Visiting All Nodes (LeetCode 847)](https://leetcode.com/problems/shortest-path-visiting-all-nodes/)

## Related

- [Meet in the Middle](../../../../Problem_Patterns/Meet_in_the_Middle/)
- [DP on Graphs](../DP_on_Graphs/)
- [0-1 Knapsack](../../2D_DP/0_1_Knapsack/)
- [Bit Manipulation](../../../../Problem_Patterns/Bit_Manipulation/)
- [Bitmasking utilities](../../../../Utilities/Optimization_Techniques/Bitmasking/)
