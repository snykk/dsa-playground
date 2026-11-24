# DP Optimizations

A DP optimization keeps the recurrence and speeds up the transition by using structure in its cost. The Convex Hull Trick, with its Li Chao tree variant, answers a minimum over lines in amortized O(1) or in O(log V) per query. Divide and Conquer Optimization computes a layer of `dp[g][i] = min over j < i of dp[g-1][j] + C(j, i)` in O(n log n) when the best `j` never moves left as `i` grows.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Convex Hull Trick and Li Chao Tree](Convex_Hull_Trick/) | Turn `dp[i] = min over j of m_j*x_i + b_j` from O(n) per step into amortized O(1), or O(log V) in any order. | Advanced |
| 2 | [Divide and Conquer Optimization](Divide_and_Conquer_Optimization/) | Solve the middle cell of a layer first, then each half only on its side of that cell's best `j`: O(n log n) per layer when the cost satisfies the quadrangle inequality. | Advanced |

Both topics speed up a minimum over earlier states `j`, and they use different structure. The Convex Hull Trick needs the cost to be a line: `dp[i] = min over j < i of (m_j * x_i + b_j)`, where each earlier state is a line `y = m*x + b` and only the lines on the lower envelope can win. Divide and Conquer Optimization needs no formula, only that the best `j` is monotone in `i`, which the quadrangle inequality `C(a, c) + C(b, d) <= C(a, d) + C(b, c)` guarantees. Knuth's optimization, for interval DPs, rests on the same inequality.

## How They Compare

| Structure | Requires | Insert | Query | Notes |
|-----------|----------|--------|-------|-------|
| `MonotonicCHT` | slopes in non-increasing order, queries in non-decreasing order | O(1) amortized | O(1) amortized | a line is pushed once and popped at most once |
| `LiChaoTree` | a fixed range of `x` | O(log V) | O(log V) | V is the size of that range; any order |
| Scan every line | nothing | O(1) | O(n) | the baseline that these replace |

Used in a DP, the monotonic version turns O(n^2) into O(n) when slopes and queries are already sorted, and the Li Chao tree gives O(n log V) otherwise. Space is O(n) for both.

| Technique | Requires | One layer of n cells | Notes |
|-----------|----------|----------------------|-------|
| Convex Hull Trick | the cost is a line in a value of `i` | O(n) sorted, O(n log V) with a Li Chao tree | a structure of lines, queried once per cell |
| Divide and Conquer Optimization | the best `j` is monotone in `i` (the quadrangle inequality) | O(n log n) | no structure: the cost is evaluated directly, O(1) each |
| Try every `j` | nothing | O(n^2) | the baseline that both replace |

The two can meet: splitting an array into `k` groups with cost `(sum of the group)^2` expands into a line in the prefix sum, so both apply there. A cost that is not a line, such as the number of equal pairs in a group, leaves only divide and conquer.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| Slopes and query points both arrive sorted | Monotonic CHT | amortized O(1), simplest code |
| Lines or queries in any order, over a bounded range of x | Li Chao tree | no sorting assumption, O(log V) |
| Few lines | a plain scan | the setup is not worth it |
| The transition is not a minimum of lines, but the best `j` is monotone | Divide and Conquer Optimization | O(n log n) per layer from the order of the best `j` alone |
| Split a sequence into exactly `k` groups | Divide and Conquer Optimization | one layer per group, O(k n log n) in all |
| Neither structure holds | the plain DP | both techniques give wrong answers without their requirement |

## Common Pitfalls

- Breaking the order: `MonotonicCHT` gives wrong answers unless slopes are non-increasing and queries non-decreasing.
- Querying outside the range: `LiChaoTree.query` raises `ValueError` when `x` is outside the constructor's range.
- Overflow: the values `m*x + b` must fit the integer type. C++ and Go use wide arithmetic in the line comparison, but not in the values.
- Querying an empty `MonotonicCHT`: Python raises `ValueError`, C++ has undefined behavior and Go panics.
- Both structures answer minimum queries, not maximum.
- Trusting divide and conquer without the quadrangle inequality: with a negative value, `(sum of the group)^2` breaks it, and the recursion returns 10 instead of 2 for `[1, 2, 4, -5]` in two groups, with no error. Compare with the plain DP on small inputs.

## Related

- [Linear Dynamic Programming](../Linear_DP/): read first.
- [2D Dynamic Programming](../2D_DP/): read first.
- [Advanced Dynamic Programming](../Advanced_DP/): states that follow a structure.
- [Monotonic Queue](../../../Problem_Patterns/Monotonic_Queue/): the deque idea behind the monotonic version.
- [DP Problem Patterns](../../../Problem_Patterns/DP_Problem_Patterns/): recurring DP problem shapes.
- [Prefix Sum and Difference Array](../../../Problem_Patterns/Prefix_Sum_Difference_Array/): the O(1) group costs that divide and conquer evaluates.
