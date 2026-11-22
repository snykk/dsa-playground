# Constructive Algorithms

A constructive problem asks you to build an object (permutation, array, string, graph) that satisfies a list of constraints, or to report that none exists. You do not search for it: you find a pattern that satisfies every constraint by design and prove it works. Most builders here run in O(n) to O(n log n).

## Intuition

Do the small cases by hand, spot the shape (sorted, alternating, zig-zag, powers of two), turn it into a loop, and write down the cheapest necessary condition for existence. A solution must be **sound** (what it returns satisfies the constraints) and **complete** (it only says "impossible" when no object exists). A short checker run over all small inputs tests both.

## Visual

```text
k distinct differences, n = 7, k = 3

zig-zag over 1..k+1 :  1  4  2  3          differences  3 2 1   (k distinct values)
then k+2..n         :  5  6  7             differences  2 1 1   (nothing new)

permutation = [1, 4, 2, 3, 5, 6, 7]
```

## How It Works

1. Build small examples by hand and look for the pattern.
2. Derive when it is impossible (sum range, odd degree sum, a letter that is too frequent) and return "impossible" first.
3. Write the pattern as a greedy loop.
4. Prove each constraint holds, and test with a checker over all small inputs.

| Function | Builds | Rule |
|----------|--------|------|
| `construct_permutation(n, k)` | permutation of 1..n with exactly k distinct adjacent differences (1 <= k <= n - 1; n = 1 needs k = 0) | zig-zag 1, k+1, 2, k, ... then k+2..n |
| `construct_array_with_sum(n, total, lo, hi)` | array in [lo, hi] with the given sum | start at `lo`, add the remainder left to right |
| `construct_graph(degrees)` | simple graph with the degree sequence | Havel-Hakimi: connect the largest degree to the next largest |
| `construct_string(n, a, b)` | string with `a` a-s and `b` b-s, no equal neighbors | more frequent letter at even positions; needs `n == a + b` |
| `greedy_construction(n, constraints)` | distinct values from 1..n | smallest unused value >= each constraint |
| `construct_matrix(row_sums, col_sums)` | non-negative matrix with given sums | north-west corner rule |
| `construct_by_decomposition(target)` | powers of two summing to `target` | one term per set bit |
| `construct_tree(n, parents)` (Python) | edge list of a tree | node i under its required parent, or under i - 1 |
| `construct_balanced_string(s)` (Python) | the characters of `s` sorted | only if every distinct character occurs equally often |

## Step-by-Step Trace

`construct_graph([3, 3, 2, 2, 2])`:

| Step | Node | Connects to | Remaining degrees afterwards |
|------|------|-------------|------------------------------|
| 1 | 0 (degree 3) | 1, 2, 3 | 1:2, 2:1, 3:1, 4:2 |
| 2 | 1 (degree 2) | 4, 2 | 3:1, 4:1 |
| 3 | 3 (degree 1) | 4 | none |

Edges: `(0,1) (0,2) (0,3) (1,4) (1,2) (3,4)`. `[3, 1, 1]` returns no graph: the degree-3 node would need three neighbors.

## Complexity

| Builder | Time |
|---------|------|
| permutation, array with sum, string, tree | O(n) |
| decomposition | O(log target) |
| graph (Havel-Hakimi) | O(E log n) |
| matrix | O(n * m) |
| greedy_construction | Python O(n^2), C++ O(n log n) |

Why: most builders make one pass; the graph builder does one heap pop and push per edge endpoint.

## When to Use

Use these patterns when the statement says "print any ... such that ..." or "print -1 if impossible", the output is large, and constraints are structural. They are not for problems that ask for the best value of something (use greedy or DP).

## Constructive Algorithms vs. Alternatives

| Approach | Output | Cost | Use when |
|----------|--------|------|----------|
| Constructive | any valid object | polynomial, usually linear | a pattern exists |
| Backtracking | any valid object | exponential | no pattern, small input |
| Greedy / DP | the best value | polynomial | an optimum is asked for |

## Common Pitfalls

- Skipping the feasibility check (`construct_string` used to accept `n != a + b`).
- Trusting a pattern after one example; check all small `n`.
- Hard-coded bit limits (scanning 30 bits drops bit 30 and above).
- Empty input and `n = 1` (divisions by zero, off-by-one).
- Mutating the caller's input.
- Impossible-result conventions differ: `None` in Python, empty vector or string in C++, `nil` in Go.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `constructive.py` | all 9 builders, `constructive_test.py` |
| C++ | [C++/](C++/) | `constructive.cpp` | 7 builders (no tree, no balanced string), `constructive_test.cpp` |
| Go | [Go/](Go/) | `main.go` | 3 builders (permutation, array with sum, graph), `main_test.go` |

## Practice Problems

- [Permutations (CSES 1070)](https://cses.fi/problemset/task/1070)
- [Beautiful Arrangement II (LeetCode 667)](https://leetcode.com/problems/beautiful-arrangement-ii/)
- [Reorganize String (LeetCode 767)](https://leetcode.com/problems/reorganize-string/)
- [Inverse Inversions (CSES 2214)](https://cses.fi/problemset/task/2214)
- [Monotone Subsequences (CSES 2215)](https://cses.fi/problemset/task/2215)
- [Distant Barcodes (LeetCode 1054)](https://leetcode.com/problems/distant-barcodes/)

## Related

- [Game Theory](../Game_Theory/)
- [Interactive Problems](../Interactive_Problems/)
- [Bit Manipulation](../../../Problem_Patterns/Bit_Manipulation/)
