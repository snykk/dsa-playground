# DP Optimizations

A DP optimization keeps the recurrence and speeds up the transition by using structure in its cost. The one topic here, the Convex Hull Trick with its Li Chao tree variant, answers a minimum over lines in amortized O(1) or in O(log V) per query.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Convex Hull Trick and Li Chao Tree](Convex_Hull_Trick/) | Turn `dp[i] = min over j of m_j*x_i + b_j` from O(n) per step into amortized O(1), or O(log V) in any order. | Advanced |

Some recurrences have the form `dp[i] = min over j < i of (m_j * x_i + b_j)`. Each earlier state is a line `y = m*x + b`, and the minimum at one `x` is the lower envelope of those lines. The Convex Hull Trick keeps only the lines that appear on it. This folder currently implements only that technique.

## How They Compare

| Structure | Requires | Insert | Query | Notes |
|-----------|----------|--------|-------|-------|
| `MonotonicCHT` | slopes in non-increasing order, queries in non-decreasing order | O(1) amortized | O(1) amortized | a line is pushed once and popped at most once |
| `LiChaoTree` | a fixed range of `x` | O(log V) | O(log V) | V is the size of that range; any order |
| Scan every line | nothing | O(1) | O(n) | the baseline that these replace |

Used in a DP, the monotonic version turns O(n^2) into O(n) when slopes and queries are already sorted, and the Li Chao tree gives O(n log V) otherwise. Space is O(n) for both.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| Slopes and query points both arrive sorted | Monotonic CHT | amortized O(1), simplest code |
| Lines or queries in any order, over a bounded range of x | Li Chao tree | no sorting assumption, O(log V) |
| Few lines | a plain scan | the setup is not worth it |
| The transition is not a minimum of lines | another technique | CHT only applies to a cost that is linear in `x` |

## Common Pitfalls

- Breaking the order: `MonotonicCHT` gives wrong answers unless slopes are non-increasing and queries non-decreasing.
- Querying outside the range: `LiChaoTree.query` raises `ValueError` when `x` is outside the constructor's range.
- Overflow: the values `m*x + b` must fit the integer type. C++ and Go use wide arithmetic in the line comparison, but not in the values.
- Querying an empty `MonotonicCHT`: Python raises `ValueError`, C++ has undefined behavior and Go panics.
- Both structures answer minimum queries, not maximum.

## Related

- [Linear Dynamic Programming](../Linear_DP/): read first.
- [2D Dynamic Programming](../2D_DP/): read first.
- [Advanced Dynamic Programming](../Advanced_DP/): states that follow a structure.
- [Monotonic Queue](../../../Problem_Patterns/Monotonic_Queue/): the deque idea behind the monotonic version.
- [DP Problem Patterns](../../../Problem_Patterns/DP_Problem_Patterns/): recurring DP problem shapes.
