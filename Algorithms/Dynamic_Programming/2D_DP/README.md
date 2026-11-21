# 2D Dynamic Programming

In 2D DP a state has two indices and the answer is read from a table. LCS and Edit Distance compare prefixes of two strings, 0/1 Knapsack pairs items with a capacity, and Matrix Chain Multiplication fills the intervals of one chain by length.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Longest Common Subsequence](Longest_Common_Subsequence/) | The base table. `dp[i][j]` is the LCS of two prefixes. Match and take the diagonal, else take the better neighbor. | Intermediate |
| 2 | [Edit Distance](Edit_Distance/) | The same table shape over prefixes, with a minimum over replace, delete and insert, and a first row of 0..n and a first column of 0..m. | Intermediate |
| 3 | [0/1 Knapsack](0_1_Knapsack/) | Items against a capacity. Each cell chooses to skip an item or take it, and the table needs O(n*W) cells. | Intermediate |
| 4 | [Matrix Chain Multiplication](Matrix_Chain_Multiplication/) | Interval DP. Fill the table by chain length and try every split point. The hardest of the four, at O(n^3). | Advanced |

The first three fill row by row, and each cell reads only cells above and to the left. Matrix Chain fills by chain length, because a cell reads shorter intervals of its own chain.

## How They Compare

| Topic | Cell `dp[i][j]` | Time | Space |
|-------|-----------------|------|-------|
| LCS | LCS length of the first `i` characters of `s1` and the first `j` of `s2` | O(m*n) | O(m*n), or O(min(m, n)) for the length only |
| Edit Distance | fewest edits that turn the first `i` characters of `s1` into the first `j` of `s2` | O(m*n) | O(m*n), or O(min(m, n)) for the distance only |
| 0/1 Knapsack | best value using the first `i` items with capacity `j` | O(n*W) | O(n*W), or O(W) with one row |
| Matrix Chain | fewest scalar multiplications for matrices `i` to `j` | O(n^3) | O(n^2) |

All four have the same best, average and worst time, because the loops do not depend on the data. `m` and `n` are string lengths (for Knapsack, `n` is the number of items; for Matrix Chain, the number of matrices) and `W` is the capacity.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| The longest shared sequence of two strings or arrays | LCS | the table also recovers the sequence |
| How far apart two strings are, in single edits | Edit Distance | insert, delete and replace each cost 1 |
| Choose items under a budget, each at most once | 0/1 Knapsack | greedy by value or ratio can fail |
| Items can be split into fractions | [Fractional Knapsack](../../Greedy/Fractional_Knapsack/) | sorting by value per weight is optimal |
| The best way to bracket a product of matrices | Matrix Chain | the order changes the cost, not the result |
| A contiguous common run, not a subsequence | Longest Common Substring in [Advanced String Algorithms](../../String_Algorithms/Advanced_String/) | a subsequence may skip characters |

## Common Pitfalls

- Confusing subsequence and substring: LCS may skip characters, while a common substring may not.
- Counting a swap as one edit: Edit Distance here has only insert, delete and replace, so swapping two letters costs 2.
- Looping capacity upward in a one-row knapsack lets an item be taken twice; `knapsack_01_optimized` loops downward.
- Expecting items back from the space-saving versions: a single row or two rows drop the table that the traceback needs.
- Treating O(n*W) as polynomial: a capacity of 10^9 makes the table unusable, even with few items.

## Related

- [Basic Dynamic Programming](../Basic_DP/): read first.
- [Linear Dynamic Programming](../Linear_DP/): read first.
- [Advanced Dynamic Programming](../Advanced_DP/): states that follow a structure instead of two indices.
- [String Algorithms](../../String_Algorithms/): more on comparing and searching strings.
- [Fractional Knapsack](../../Greedy/Fractional_Knapsack/): the greedy version when items can be split.
- [DP Problem Patterns](../../../Problem_Patterns/DP_Problem_Patterns/): recurring DP problem shapes.
