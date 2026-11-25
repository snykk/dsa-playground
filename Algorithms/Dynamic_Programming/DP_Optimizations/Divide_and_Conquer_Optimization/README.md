# Divide and Conquer Optimization

Divide and Conquer Optimization speeds up a layered DP of the form `dp[g][i] = min over j < i of dp[g-1][j] + C(j, i)`, such as splitting an array into exactly `k` groups. When the best `j` never moves left as `i` grows, one layer is computed by solving its middle cell first and searching each half only on its side of that cell's best `j`: O(n log n) per layer and O(k n log n) in all, instead of O(k n^2).

## Intuition

Split `n` numbers into exactly `k` contiguous, non-empty groups so that the sum over the groups of `(sum of the group)^2` is as small as possible. The square punishes a heavy group, so the best split balances the sums, like sharing tasks of given lengths among `k` workers in order.

Let `dp[g][i]` be the best cost of the first `i` values in `g` groups. The last group is `values[j:i]` for some `j`, and the rest is the first `j` values in `g - 1` groups:

    dp[g][i] = min over j in [g-1, i-1] of dp[g-1][j] + C(j, i),    C(j, i) = (P[i] - P[j])^2

`P` holds the prefix sums, so each cost is O(1). Computed directly, every cell of a layer tries every `j`: O(n^2) per layer.

Call the best `j` of cell `i` `opt(g, i)`. For this cost it is **monotone**: `opt(g, i) <= opt(g, i + 1)`. A longer prefix never makes its last group start earlier. So once the middle cell `mid` of a layer is solved, every cell left of it needs only `j <= opt(mid)` and every cell right of it only `j >= opt(mid)`. Recursing on the two halves, each level of the recursion tries about `n` values of `j` in total, and there are about `log2(n)` levels.

**Why opt is monotone.** It is enough that `C` satisfies the **quadrangle inequality**

    C(a, c) + C(b, d) <= C(a, d) + C(b, c)    for all a <= b <= c <= d.

Suppose the smallest best `j` of cell `i` were larger than the best `j'` of a later cell `i'`. Then `j'` loses to `j` at `i`, and the inequality with `a = j'`, `b = j`, `c = i`, `d = i'` says that moving from `i` to `i'` adds no more to `j`'s cost than to `j'`'s, so `j'` still loses at `i'`: a contradiction. For the square of the sum,

    C(a, c) + C(b, d) - C(a, d) - C(b, c) = -2 (P[b] - P[a]) (P[d] - P[c])

which is at most 0 whenever `P` never decreases, that is when every value is 0 or more. That is why this cost was chosen: integers only (the squared deviation from a group's mean would need fractions), O(1) from prefix sums, a one-line proof, and with a single negative value the same formula shows what happens when the inequality fails.

## Visual

The example `values = [3, 1, 4, 1, 5, 9, 2, 6]` with `k = 3`. Row `dp[g]` is the best cost of the first `i` values in `g` groups, and `opt[g]` the smallest `j` that reaches it:

```text
 i          0    1    2    3    4    5    6    7    8
 values        3    1    4    1    5    9    2    6       (between the cuts)
 P          0    3    4    8    9   14   23   25   31
 dp[1]      0    9   16   64   81  196  529  625  961    one group: P[i]^2
 dp[2]      -    -   10   32   41  100  277  317  485
 opt[2]     -    -    1    2    2    3    4    5    5    never decreases
 dp[3]      -    -    -   26   33   66  181  221  341    <- answer
 opt[3]     -    -    -    2    3    4    5    5    6
```

Layer 2 as the recursion computes it: each call solves its middle cell over its allowed `j`, then hands the left half `j <= opt` and the right half `j >= opt`.

```text
                       i=5, j in 1..4 -> opt 3
                    /                          \
       i=3, j in 1..2 -> 2               i=7, j in 3..6 -> 5
         /           \                     /              \
 i=2, j in 1 -> 1  i=4, j in 2..3 -> 2  i=6, j in 3..5 -> 4  i=8, j in 5..7 -> 5
```

The three rows of the tree try 4, 2 + 4 = 6 and 1 + 2 + 3 + 3 = 9 values of `j`: 19 for the layer, against 28 when every cell tries every `j`.

## How It Works

1. Check the input: `1 <= k <= n` and every value at least 0. Build the prefix sums `P`.
2. Layer 1: `dp[1][i] = C(0, i)` for `i` from 1 to `n`, one group holding the first `i` values.
3. For each layer `g` from 2 to `k`, call `solve(lo = g, hi = n, opt_lo = g - 1, opt_hi = n - 1)`:
   - if `lo > hi`, return;
   - `mid = (lo + hi) // 2`;
   - try every `j` from `max(opt_lo, g - 1)` to `min(opt_hi, mid - 1)`, in increasing order, and keep the smallest `j` with the least `dp[g-1][j] + C(j, mid)`: that is `dp[g][mid]` and `opt(g, mid)`;
   - `solve(lo, mid - 1, opt_lo, opt(g, mid))`, then `solve(mid + 1, hi, opt(g, mid), opt_hi)`.
4. `dp[k][n]` is the answer.
5. Walk back to the groups: `bounds[k] = n`, then `bounds[g - 1] = opt(g, bounds[g])` for `g` from `k` down to 2, and `bounds[0] = 0`. Group `g` is `values[bounds[g]:bounds[g + 1]]`.

The two clamps keep every group non-empty: `j <= mid - 1` leaves at least one value for the last group, and `j >= g - 1` leaves at least one value for each of the first `g - 1` groups. The plain DP (`min_cost_partition_plain`) runs step 3 as a loop over every `i` with `j` from `g - 1` to `i - 1`, through the same `_best_split`, so the two return the same groups.

**The tie rule.** `opt(g, i)` is the **smallest** `j` that reaches the minimum: `j` is tried in increasing order and only a strictly smaller candidate replaces the best. So of several best splits the code returns the one whose last cut is smallest, then the cut before it, and so on. With `[1, 1, 1, 1, 1]` and `k = 2`, the splits 2 + 3 and 3 + 2 both cost 4 + 9 = 13, and the code returns `[0, 2, 5]`. Python, C++ and Go follow the same rule, and the tests check it against every split of small inputs.

**Edge cases.** Groups are never empty, so `k` must be between 1 and `n`: `k > n`, `k < 1` and any `k` for an empty list raise `ValueError` (C++ `std::invalid_argument`, Go `ErrInvalidInput`). `k = 1` costs `P[n]^2`, and `k = n` puts every value alone. A negative value is rejected, because the quadrangle inequality then no longer holds. To run the DP on any cost, use `partition_dp(n, k, cost, optimized)`.

## Step-by-Step Trace

Layer 2 of the example. A cell's candidates are `dp[1][j] + (P[i] - P[j])^2`:

| Call: cells, allowed j | mid | Candidates | dp[2][mid], opt |
|------------------------|-----|------------|-----------------|
| 2..8, j in 1..7 | 5 | j=1: 9 + 121 = 130; j=2: 16 + 100 = 116; j=3: 64 + 36 = 100; j=4: 81 + 25 = 106 | 100, opt 3 |
| 2..4, j in 1..3 | 3 | j=1: 9 + 25 = 34; j=2: 16 + 16 = 32 (j stops at mid - 1 = 2) | 32, opt 2 |
| 2..2, j in 1..2 | 2 | j=1: 9 + 1 = 10 | 10, opt 1 |
| 4..4, j in 2..3 | 4 | j=2: 16 + 25 = 41; j=3: 64 + 1 = 65 | 41, opt 2 |
| 6..8, j in 3..7 | 7 | j=3: 353; j=4: 337; j=5: 196 + 121 = 317; j=6: 533 | 317, opt 5 |
| 6..6, j in 3..5 | 6 | j=3: 289; j=4: 81 + 196 = 277; j=5: 196 + 81 = 277 (a tie: j=4 stays) | 277, opt 4 |
| 8..8, j in 5..7 | 8 | j=5: 196 + 289 = 485; j=6: 593; j=7: 661 | 485, opt 5 |

Layer 3 tries 3 + 1 + 2 + 3 + 2 + 3 = 14 values of `j` and ends with `dp[3][8] = 341` at `j = 6`. The walk back: `opt(3, 8) = 6`, `opt(2, 6) = 4`, so `bounds = [0, 4, 6, 8]` and the groups are `[3, 1, 4, 1]`, `[5, 9]`, `[2, 6]`, costing 81 + 196 + 64 = 341. `min_cost_partition(values, 3)` returns `(341, [0, 4, 6, 8])`: 8 + 19 + 14 = 41 cost evaluations, against 8 + 28 + 21 = 57 for `min_cost_partition_plain`.

**When the inequality fails.** With `values = [1, 2, 4, -5]` and the same cost, `P = [0, 1, 3, 7, 2]` decreases at the end, and `C(1, 3) + C(2, 4) = 36 + 1 = 37 > C(1, 4) + C(2, 3) = 1 + 16 = 17`. For `k = 2` the recursion solves `i = 3` first and finds `opt = 2` (25 against 37 for `j = 1`), then searches `i = 4` only over `j` in 2..3 and returns 10 with groups `[1, 2]`, `[4, -5]`. The best split is `[1]`, `[2, 4, -5]`, cost 1 + 1 = 2, at `j = 1`, which the right half never tries: `partition_dp(4, 2, cost, optimized=True)` returns `(10, [0, 2, 4])` and `optimized=False` returns `(2, [0, 1, 4])`. On 3000 random inputs with negative values (seeded, in the tests), the two differ on 219 and the cost is too high on 172 of them.

## Complexity

| Function | Time | Space | Why |
|----------|------|-------|-----|
| `min_cost_partition`, `partition_dp(..., optimized=True)` | O(k n log n) | O(k n) | at most m (log2(m) + 2) cost evaluations for a layer of m cells |
| `min_cost_partition_plain`, `partition_dp(..., optimized=False)` | O(k n^2) | O(k n) | m (m + 1) / 2 evaluations for a layer of m cells |

**Why m log m.** The calls at one depth of the recursion cover disjoint ranges of cells, and their ranges of `j` follow each other, overlapping only where one ends and the next begins. So the calls at one depth try at most `m + (number of calls)` values of `j`. There are `floor(log2(m)) + 1` depths and `m` calls in all, which gives the bound. The space is the table of best `j`, `(k + 1)(n + 1)` integers, needed to rebuild the groups; the costs themselves need only two rows.

Counted on the Python code, with `k = 4` and `values[t] = (37 t + 11) mod 101`:

| n | Recursion | Bound | Plain DP | Ratio |
|---|-----------|-------|----------|-------|
| 64 | 1,140 | 1,366 | 5,924 | 5.2 |
| 256 | 6,225 | 7,114 | 97,412 | 15.6 |
| 1,024 | 31,234 | 34,750 | 1,569,284 | 50.2 |
| 4,096 | 149,749 | 163,762 | 25,151,492 | 168.0 |

The bound is `n` for layer 1 plus `m (floor(log2(m)) + 2)` for each later layer. At `n = 4096` the three layers after the first cost 49,134, 48,433 and 48,086 evaluations, close to `n log2(n) = 49,152`; the plain DP costs 8,386,560 for the first of them, about `n^2 / 2`.

**Overflow.** Python's integers do not overflow. C++ and Go work in signed 64-bit integers. Every number the DP forms is the cost of splitting a prefix into groups, which is at most `P[n]^2` because squares of numbers that are 0 or more add up to at most the square of their sum, and the DP forms `P[n]^2` itself (`dp[1][n]`). So before the DP they check that the total is at most 3,037,000,499, the largest number whose square fits, and report an overflow otherwise: `std::overflow_error` in C++, an error wrapping `ErrOverflow` in Go. `[3037000499]` with `k = 1` costs 9,223,372,030,926,249,001 in all three languages; `[3037000499, 1]` with `k = 2` costs 9,223,372,030,926,249,002 in Python, which fits, but its total does not square into 64 bits, so C++ and Go report it. `partition_dp` checks every sum it forms instead.

## When to Use

Use it when:
- the DP has layers, `dp[g][i] = min over j < i of dp[g-1][j] + C(j, i)`: split a sequence into `k` contiguous groups, place `k` facilities along a line, schedule `n` jobs in order on `k` days;
- the best `j` is monotone in `i`, which the quadrangle inequality on `C` guarantees;
- `C(j, i)` costs O(1), or can be computed while the recursion moves a window (as in Codeforces 868F, where it counts equal pairs).

Do not use it when:
- the cost breaks the quadrangle inequality (a sum that can decrease, as above): the answers are silently wrong;
- `n` is a few hundred and `k` small: the plain DP is simpler;
- the cost is linear in a value of `i` once expanded: the Convex Hull Trick can be faster.

## Divide and Conquer Optimization vs. Alternatives

| Technique | Time for k layers of n cells | Needs |
|-----------|-------------------------------|-------|
| Plain DP | O(k n^2) | nothing |
| Divide and Conquer Optimization | O(k n log n) | opt monotone in `i` (the quadrangle inequality on C) |
| [Convex Hull Trick](../Convex_Hull_Trick/) | O(k n) with sorted slopes and queries | `C(j, i)` splits into lines: a slope from `j` times a value of `i`, plus terms of one index each |
| [Knuth Optimization](../Knuth_Optimization/) | O(n^2) for an interval DP instead of O(n^3) | the quadrangle inequality, and C monotone on nested intervals |

For this particular cost the Convex Hull Trick applies too: `(P[i] - P[j])^2 = P[i]^2 - 2 P[j] P[i] + P[j]^2`, a line in `P[i]` for each `j`. Divide and conquer needs only the monotone `opt`, so it also covers costs that are not lines in anything.

## Common Pitfalls

1. **No check of the inequality.** The recursion returns a split and its true cost, but not the best one, and nothing fails. With `[1, 2, 4, -5]` it returns 10 instead of 2. Prove the inequality, or compare with the plain DP on small random inputs.
2. **Forgetting to narrow.** Passing the whole range `[g - 1, n - 1]` to both halves still gives the right answers, at the plain DP's price. The tests count the evaluations and catch it.
3. **The clamps.** `j` must stay below `mid` (the last group is not empty) and at least `g - 1` (the earlier groups are not empty).
4. **Ties.** Use a strict `<` and try `j` upward. With `<=` the code keeps the largest best `j`: the cost is still right, but the groups change on inputs with ties, and the C++ and Go outputs no longer match the documented ones.
5. **`k` out of range.** Empty groups are not allowed, so `k > n` is an error, not the same as `k = n`.
6. **Overflow in C++ and Go.** A sum of squares grows fast; the total must stay at most 3,037,000,499.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `divide_and_conquer_optimization.py` | `min_cost_partition`, `min_cost_partition_plain`, `partition_dp`; `ValueError` on bad input |
| C++ | [C++/](C++/) | `divide_and_conquer_optimization.cpp` | `minCostPartition`, `minCostPartitionPlain`, `partitionDp` (a template over the cost); a `Partition` struct; `long long`; `std::invalid_argument`, `std::overflow_error` |
| Go | [Go/](Go/) | `main.go` | `MinCostPartition`, `MinCostPartitionPlain`, `PartitionDP`; a `Partition` struct; `int64`; errors wrapping `ErrInvalidInput` or `ErrOverflow` |

All three try `j` in the same order and return the same costs and bounds: the C++ and Go tests check 44 inputs, 12 inputs where the recursion fails, and the cost evaluations on 8 more against outputs of the Python code.

## Practice Problems

- [Subarray Squares (CSES 2086)](https://cses.fi/problemset/task/2086): exactly this problem, with `n` up to 3000; its example `[2, 3, 1, 2, 2, 3, 4, 1]` in 3 groups costs 110.
- [Famous Pagoda (Kattis famouspagoda)](https://open.kattis.com/problems/famouspagoda): sorted heights in `G` contiguous groups, each group's cost read from prefix sums.
- [Branch Assignment (Kattis branch)](https://open.kattis.com/problems/branch): after shortest paths to and from headquarters and a sort, the groups are contiguous, and a group of `m` branches costs `m - 1` times the sum of their two distances.
- [Yet Another Minimization Problem (Codeforces 868F)](https://codeforces.com/problemset/problem/868/F): the cost of a segment counts its pairs of equal values, kept by a window that the recursion moves.

## Related

- [Convex Hull Trick](../Convex_Hull_Trick/): the other speed-up for `min over j`, when the cost is a line in a value of `i`
- [DP Optimizations overview](../README.md)
- [Divide and Conquer](../../../Divide_and_Conquer/): the general technique of solving halves
- [Prefix Sum and Difference Array](../../../../Problem_Patterns/Prefix_Sum_Difference_Array/): the O(1) cost of a group
- [DP Problem Patterns](../../../../Problem_Patterns/DP_Problem_Patterns/)
