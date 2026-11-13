# Dynamic Programming Algorithms

Dynamic programming solves a problem by writing its answer in terms of smaller subproblems and computing each one once. The five areas here differ in the shape of the state, from one number to a table, a subset of items, a tree node or a set of lines.

## Topics

Read them in this order.

| # | Section | What it adds | Level |
|---|---------|--------------|-------|
| 1 | [Basic Dynamic Programming](Basic_DP/) | Start here. Fibonacci and Climbing Stairs show the whole idea on a table of one number per step. | 2 topics |
| 2 | [Linear Dynamic Programming](Linear_DP/) | One-dimensional tables over an index or an amount, where the answer comes from earlier entries of the same row. | 3 topics |
| 3 | [2D Dynamic Programming](2D_DP/) | Two-index states, such as two strings, items and capacity, or an interval of a chain. The table is the answer. | 4 topics |
| 4 | [Advanced Dynamic Programming](Advanced_DP/) | States that are a subset, a digit position, a tree node or a graph node, so the table follows the structure. | 4 topics |
| 5 | [DP Optimizations](DP_Optimizations/) | Keep the recurrence and speed up the transition, here with the Convex Hull Trick. | 1 topic |

A DP solution has four parts: a state that names a subproblem, a transition that builds its answer from smaller states, an order that computes the smaller ones first, and base cases. The method pays off with overlapping subproblems (without a table, `fibonacci_naive(30)` makes 2,692,537 calls for 31 distinct values) and optimal substructure. Memoization (top-down) and tabulation (bottom-up) store the answers and give the same result.

## How the Areas Compare

| Area | State | Topics | Typical time |
|------|-------|--------|--------------|
| Basic DP | one number per step | Fibonacci, Climbing Stairs | O(n) |
| Linear DP | an index into one sequence, or an amount | Coin Change, LIS, Kadane | O(n), O(n*A), O(n^2) |
| 2D DP | two indices: prefixes, items and capacity, or an interval | LCS, Edit Distance, 0/1 Knapsack, Matrix Chain | O(m*n), O(n*W), O(n^3) |
| Advanced DP | a subset, a digit position, a tree node or a graph node | Bitmask, Digit, Tree and Graph DP | O(n^2 * 2^n), O(d*S*10), O(n), O(V + E) |
| DP optimizations | the same state as before, a faster transition | Convex Hull Trick | O(n) or O(n log V) |

Naive recursion for Fibonacci is O(2^n), which is what the table removes.

## Where to Start

1. **Basic DP.** Read Fibonacci first: it shows why the table exists, because naive recursion repeats work exponentially often. Climbing Stairs applies the same recurrence to counting.
2. **Linear DP.** The state is still one index, but the transition now chooses among several earlier states. Coin Change is the first problem where greedy fails.
3. **2D DP.** Two indices describe a state. LCS and Edit Distance share one table shape, 0/1 Knapsack uses it for items and capacity, and Matrix Chain fills intervals by length.
4. **Advanced DP.** The state is no longer a pair of numbers. It is a subset stored in an integer, a digit position, a tree node or a node of a DAG.
5. **DP optimizations.** Once a recurrence is right but too slow, exploit its structure. The Convex Hull Trick turns a minimum over all earlier lines into an amortized O(1) step.

## Common Pitfalls

- Using greedy because it looks natural: for coins `1, 3, 4` and amount 6, largest-first uses three coins, while `coin_change_min_coins` returns 2.
- Reading O(n*W) or O(n*A) as polynomial: the bound depends on the value of the capacity or amount, not on its number of digits.
- Filling the table in the wrong order: a one-row knapsack loops capacity downward so each item is taken once, and a one-row Coin Change loops upward so a coin can repeat.
- Hitting host-language limits: C++ and Go Fibonacci are exact only up to `F(92)`, and tree and graph DP recurse once per level, so a path of about 1,000 nodes reaches Python's recursion limit.
- Applying DP on Graphs to a cyclic graph: it needs a DAG and raises `ValueError` when a cycle is reachable.

## Related

- [Big-O Notation](../../Complexity_Analysis/Time_Complexity/Big_O_Notation/): read first.
- [DP Problem Patterns](../../Problem_Patterns/DP_Problem_Patterns/): recurring DP problem shapes and how to spot them.
- [Greedy Algorithms](../Greedy/): the simpler alternative when a local choice can be proved safe.
- [Divide and Conquer Algorithms](../Divide_and_Conquer/): the same splitting idea, but the subproblems do not overlap.
