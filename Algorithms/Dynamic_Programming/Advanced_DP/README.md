# Advanced Dynamic Programming

Advanced DP keeps the same state, transition and order, but the state follows a structure instead of an index. It is a range of a row, a tree node, a node of a DAG, a subset stored in an integer or a digit position, and the cost depends on how many such states exist.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Interval DP](Interval_DP/) | Answer every range `i..j` from a split or a last action inside it, shortest ranges first: merging piles, bursting balloons and palindrome cuts in O(n^3). | Advanced |
| 2 | [DP on Trees](DP_on_Trees/) | Solve every subtree from the leaves up. Independent set and maximum path sum in one O(n) pass. | Advanced |
| 3 | [DP on Graphs](DP_on_Graphs/) | On a DAG each node depends on its successors only, so a memoized DFS gives longest paths in O(V + E) and detects cycles. | Advanced |
| 4 | [Bitmask DP](Bitmask_DP/) | Store a set of visited items as the bits of one integer. This turns the O(n!) tour search into 2^n * n states. | Advanced |
| 5 | [Digit DP](Digit_DP/) | Count numbers in a range by building them digit by digit, with a tight flag and a running value as the state. | Advanced |

All five topics are implemented in Python, C++ and Go, with the same results; Python is the reference.

## How They Compare

| Topic | State | Smaller states | Time | Space | Limit |
|-------|-------|----------------|------|-------|-------|
| Interval DP | a range `i..j`: `dp[i][j]`, the best for that range alone | the two ranges on each side of a split | O(n^3) | O(n^2) | a few hundred items in Python, about a thousand in C++ and Go |
| DP on Trees | a node, as a pair such as (include, exclude) | its children | O(n) | O(h) stack, up to O(n) | Python recursion depth on a long path |
| DP on Graphs | a node: nodes on the longest path that starts there | its successors | O(V + E) | O(V) | needs a DAG; no edge weights |
| Bitmask DP | `dp[mask][last]`: cheapest way to visit the cities in `mask`, ending at `last` | the mask without `last` | O(n^2 * 2^n) | O(n * 2^n) | about 20 items |
| Digit DP | `(pos, tight, current_sum)` | the next digit position | O(d*S*10) | O(d*S) | needs a small running state |

Digit DP is cheap in the size of the bound: `count_numbers_with_digit_sum(10**18, 9)` returns 3124550 after fewer than a thousand recursive calls.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| Best way to combine a row whose neighbours merge, or to split it | Interval DP | each range is answered from a split inside it, shortest ranges first |
| Best choice per node of a rooted tree | DP on Trees | each subtree is solved once from its children |
| Longest path or path count in a DAG | DP on Graphs | a memoized DFS visits each node and edge once |
| A graph may have cycles, or edges have weights | a shortest-path algorithm | the DAG code assumes no cycles and counts edges |
| Visit or cover a small set in the best order | Bitmask DP | the set of visited items is the state, up to about 20 items |
| Count numbers up to 10^18 by a digit property | Digit DP | the state does not depend on the size of the number |
| Count numbers in a range `[L, R]` | Digit DP, `count(R) - count(L - 1)` | the function returns 0 for a negative bound |

## Common Pitfalls

- Filling an interval table row by row from the top: a split reads `dp[k+1][j]` before it is computed. Fill by length.
- Recursing twice per child in tree DP makes the algorithm exponential: compute each child once and reuse the result.
- Running graph DP on a cycle: there is no order in which the successors are solved first, and the code raises `ValueError`.
- Using bitmask DP past about 20 items: the table has `n * 2^n` cells, and in Python the practical limit is lower.
- Forgetting the tight flag in digit DP: a number above the bound is then counted.
- Comparing sentinels across languages: no tour is infinity in all three, but the path sum of an empty tree is `-inf` in Python and the smallest 64-bit integer in C++ and Go.

## Related

- [Basic Dynamic Programming](../Basic_DP/): read first.
- [Matrix Chain Multiplication](../2D_DP/Matrix_Chain_Multiplication/): the classic interval DP, read before Interval DP.
- [Linear Dynamic Programming](../Linear_DP/): read first.
- [2D Dynamic Programming](../2D_DP/): read first.
- [DP Optimizations](../DP_Optimizations/): speed up a transition once the recurrence is right.
- [DP Problem Patterns](../../../Problem_Patterns/DP_Problem_Patterns/): recurring DP problem shapes.
- [Bit Manipulation](../../../Problem_Patterns/Bit_Manipulation/): the bit tricks behind bitmask states.
- [Graph Traversal Algorithms](../../Graph_Algorithms/Traversal/): the DFS that DP on Graphs memoizes.
