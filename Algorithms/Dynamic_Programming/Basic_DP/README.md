# Basic Dynamic Programming

Fibonacci Numbers and Climbing Stairs use the same recurrence: each value is the sum of the two before it. Fibonacci shows why a table beats recursion, and Climbing Stairs shows the same table counting paths, which extends to any set of step sizes.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Fibonacci Numbers](Fibonacci_Numbers/) | The standard first example. Five ways to compute F(n), from O(2^n) recursion to O(log n) matrix powers. | Beginner |
| 2 | [Climbing Stairs](Climbing_Stairs/) | Count the ways to climb n stairs. Steps 1 and 2 give Fibonacci again, and any step set gives a table in O(n*k). | Beginner |

Both define a value for each `n` in terms of smaller values. `F(n) = F(n-1) + F(n-2)` with `F(0) = 0` and `F(1) = 1`; `ways(n) = ways(n-1) + ways(n-2)` with `ways(0) = 1` and `ways(1) = 1`. The base cases differ, so the tables are shifted by one: `ways(n) = F(n + 1)`.

## How They Compare

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| Naive recursion | O(2^n) | O(n) | recomputes the same values; both topics have it |
| Memoization | O(n) | O(n) | each value computed once, recursion depth n |
| Tabulation | O(n) | O(n) | a loop over the table |
| Two variables | O(n) | O(1) | only the last two values are needed |
| Matrix power | O(log n) | O(log n) | Fibonacci only; counts arithmetic operations |

With a list of k step sizes, Climbing Stairs takes O(n*k) time and O(n) space.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| You want to see why DP exists | Fibonacci with a call counter | the naive version makes 177 calls for `F(10)` |
| One value for a large n | two variables | O(n) time and O(1) space |
| Only a very large n matters | matrix power | O(log n) operations instead of n |
| Counting ordered ways with a fixed set of steps | Climbing Stairs with a step list | one table entry per stair, k terms per entry |
| A single-index table with a choice per entry | [Linear DP](../Linear_DP/) | Coin Change and LIS build on this table |

## Common Pitfalls

- Leaving out the table: without it both problems take O(2^n) time.
- Mixing up the base cases: `F(0) = 0` but `ways(0) = 1`, one way to climb no stairs.
- Overflow in C++ and Go: `F(n)` is exact only up to `F(92)` and `ways(92)` overflows. Python integers do not overflow.
- Treating the count as a set of routes: `1 + 2` and `2 + 1` are two different ways.
- Passing a negative `n` to the Climbing Stairs functions raises `ValueError`.

## Related

- [Big-O Notation](../../../Complexity_Analysis/Time_Complexity/Big_O_Notation/): read first.
- [Linear Dynamic Programming](../Linear_DP/): an entry chooses among several earlier entries.
- [2D Dynamic Programming](../2D_DP/): states with two indices.
- [DP Problem Patterns](../../../Problem_Patterns/DP_Problem_Patterns/): recurring DP problem shapes.
