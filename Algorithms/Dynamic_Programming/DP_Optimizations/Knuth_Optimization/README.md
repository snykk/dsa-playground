# Knuth Optimization

Knuth's optimization speeds up the interval DP `dp[i][j] = min over i <= k < j of dp[i][k] + dp[k+1][j] + C(i, j)` from O(n^3) to O(n^2). When the best split follows a range as it grows (never left when the range gains an item on the right, never right when it gains one on the left: `opt(i, j-1) <= opt(i, j) <= opt(i+1, j)`), each cell only tries the splits between the best splits of its two neighbours on the previous diagonal, and along a diagonal those windows telescope. This topic applies it to [Interval DP](../../Advanced_DP/Interval_DP/)'s pile merging, with the same input, tie rule and merges, and to the optimal binary search tree, and shows a cost on which it returns a wrong answer.

## Intuition

Piles of stones lie in a row; merging two neighbouring piles costs the size of the pile it makes. Interval DP finds the cheapest way to end with one pile from the last merge of each range: `dp[i][j] = min over k of dp[i][k] + dp[k+1][j] + sum(i..j)`, where the last merge joins piles `i..k` with piles `k+1..j`. It tries every `k` for every range, `(n^3 - n) / 6` candidates in all.

Let `split[i][j]` be the smallest best `k`. Add a pile on the right end of a range, or take away the pile on its left end, and the best last merge never moves left. So

    split[i][j-1] <= split[i][j] <= split[i+1][j]

and `split[i][j]` only needs the splits between two cells that are already known: `split[i][j-1]` (the cell to its left) and `split[i+1][j]` (the cell below it), both one diagonal back.

Why that saves a factor of `n`: on one diagonal, the window of cell `(i, j)` ends at `split[i+1][j]`, and the window of the next cell `(i+1, j+1)` starts at `split[i+1][j]`. The windows of a whole diagonal overlap only at their ends and together cover at most the `n` positions once, plus one shared end per cell: O(n) per diagonal, O(n^2) for the `n - 1` diagonals.

## Visual

The `split` table for the piles 3, 2, 4, 1, which `_fill_merge` fills by length, with the window each cell tries:

```text
 split[i][j]   j=0   j=1   j=2   j=3
 i=0 (3)        .     0     1     1     (0,3): window split[0][2] .. split[1][3] = 1 .. 1
 i=1 (2)              .     1     1     (1,3): window split[1][2] .. split[2][3] = 1 .. 2
 i=2 (4)                    .     2     (0,2): window split[0][1] .. split[1][2] = 0 .. 1
 i=3 (1)                          .     length 2: k = i, the only split
```

The top cell reads only `k = 1`: it skips `k = 0` and `k = 2`, which the plain DP tries. Eight candidates instead of ten here; on the eight piles 5, 1, 4, 2, 8, 3, 7, 6, 48 instead of 84. The tables are cell for cell the ones Interval DP fills: the same `dp`, the same `split`, the same merges.

## How It Works

**The condition.** For every `a <= b <= c <= d`, the cost `C` must satisfy

- the **quadrangle inequality**: `C(a, c) + C(b, d) <= C(a, d) + C(b, c)` (two overlapping ranges cost at most what their union and their intersection cost);
- **monotonicity on intervals**: `C(b, c) <= C(a, d)` (a range costs at most a range that contains it).

Together they make `dp` satisfy the quadrangle inequality too, and the smallest best split monotone: `split[i][j-1] <= split[i][j] <= split[i+1][j]` (Knuth, 1971; the general form by Yao, 1980). A range sum, `C(i, j) = P[j+1] - P[i]`, meets both: the inequality with equality (each side counts every pile of `a..d` once and every pile of `b..c` twice) and monotonicity because no pile is below 0. The tests check both on 400 random rows, and the monotone `split` table on 800.

**Merging piles** (`merge_piles`, `merge_piles_plan`):

1. Check that every pile is 0 or more, and compute the prefix sums `P`, so that `C(i, j) = P[j+1] - P[i]`.
2. For each `length` from 2 to `n`, each `i`, and `j = i + length - 1`: the window is `k = i` alone for two piles (the only split), otherwise `split[i][j-1]` to `split[i+1][j]`, both ends included. Both cells have length `length - 1`, so filling by length has them ready.
3. Start `dp[i][j]` at infinity and try the window's `k` in increasing order: `dp[i][k] + dp[k+1][j] + C(i, j)`. A **strictly** smaller cost is kept, with `split[i][j] = k`.
4. Read the merges back from `split` with the stack of Interval DP: post-order, left part, right part, then the merge that joins them.

**The tie rule.** The window holds the smallest best `k` of the plain DP (the tests check it on 500 random rows), and the strict `<` with `k` going up keeps the smallest best `k` inside it. So `split` is the plain DP's table, and `merge_piles_plan` returns Interval DP's merges exactly: on 1, 1, 1 the merges are `(1, 1, 2)` and then `(0, 0, 2)`.

**Any cost** (`split_dp(n, cost, knuth=True)`). The same loops for a cost function of your own over `n` points; `knuth=False` tries every `k`, which is the plain interval DP. `cost(i, j)` is called once per range of two points or more, by increasing length.

**The optimal binary search tree** (`optimal_bst`). Keys `0..n-1` in order are searched for `freq[t]` times each; a search costs the depth of its key, the root at depth 1. The least total `sum(freq[t] * depth(t))` is the problem Knuth's paper solved. Number the `n + 1` gaps around the keys `0..n`, and let `dp[i][j]` be the best tree of the keys between gaps `i` and `j`, keys `i..j-1`. Its root `k` leaves the keys `i..k-1` (gaps `i..k`) on the left and `k+1..j-1` (gaps `k+1..j`) on the right, and every key in the range goes one level deeper under the root, which adds `freq[i] + ... + freq[j-1]` once:

    dp[i][j] = min over i <= k < j of dp[i][k] + dp[k+1][j] + (F[j] - F[i])

That is `split_dp` over the `n + 1` gaps, with a range sum as the cost again, so both conditions hold and `split[0][n]` is the root.

**When the condition fails** the window can miss the best split, and nothing reports it. A merge that costs the square root of its size, rounded down, `C(i, j) = isqrt(sum(i..j))`, is monotone but not convex: on the piles 1, 1, 2, 1, 6 it breaks the inequality at `(a, b, c, d) = (0, 1, 2, 3)`, where `C(0, 2) + C(1, 3) = 2 + 2` is more than `C(0, 3) + C(1, 2) = 2 + 1`. The plain DP's best last merge of the whole row is after pile 3 (cost 7), but `split[1][4] = 2`, so the window of the top cell is `1 .. 2` and the narrowed DP returns 8. On 2000 random rows of up to 10 piles it misses 55 times, always with a larger answer.

**Bad input.** A pile, a frequency or a cost below 0, or `n` below 0, is rejected: `ValueError` in Python, `std::invalid_argument` in C++, an error wrapping `ErrInvalidInput` in Go.

## Step-by-Step Trace

The eight candidates `merge_piles([3, 2, 4, 1])` tries, in order, as `_try_split` sees them (prefix sums 0, 3, 5, 9, 10):

| Length | Cell | Window | k | dp[i][k] + dp[k+1][j] + C | Cost | dp[i][j] after |
|--------|------|--------|---|---------------------------|------|----------------|
| 2 | `dp[0][1]` | 0 .. 0 | 0 | 0 + 0 + 5 | 5 | 5, `split = 0` |
| 2 | `dp[1][2]` | 1 .. 1 | 1 | 0 + 0 + 6 | 6 | 6, `split = 1` |
| 2 | `dp[2][3]` | 2 .. 2 | 2 | 0 + 0 + 5 | 5 | 5, `split = 2` |
| 3 | `dp[0][2]` | 0 .. 1 | 0 | 0 + 6 + 9 | 15 | 15, `split = 0` |
| 3 | `dp[0][2]` | 0 .. 1 | 1 | 5 + 0 + 9 | 14 | 14, `split = 1` |
| 3 | `dp[1][3]` | 1 .. 2 | 1 | 0 + 5 + 7 | 12 | 12, `split = 1` |
| 3 | `dp[1][3]` | 1 .. 2 | 2 | 6 + 0 + 7 | 13 | 12 (no change) |
| 4 | `dp[0][3]` | 1 .. 1 | 1 | 5 + 5 + 10 | 20 | 20, `split = 1` |

Interval DP tries `k = 0` (cost 22) and `k = 2` (cost 24) for `dp[0][3]` as well; neither wins. `merge_piles_plan` returns `(20, [(0, 0, 1), (2, 2, 3), (0, 1, 3)])`, as Interval DP's does: 5 + 5 + 10.

`optimal_bst([34, 8, 50])` returns 142: key 2 at the root (50 x 1), key 0 under it (34 x 2) and key 1 under key 0 (8 x 3). Its tables are over the four gaps 0..3, and `split[0][3] = 2`.

## Complexity

| Function | Time | Space | Why |
|----------|------|-------|-----|
| `merge_piles`, `merge_piles_plan` | O(n^2) | O(n^2) | the windows of one diagonal telescope to at most `2n` splits |
| `optimal_bst` | O(n^2) | O(n^2) | the same fill over `n + 1` gaps |
| `split_dp(n, cost)` | O(n^2) calls of `_try_split` and `n(n - 1) / 2` calls of `cost` | O(n^2) | `knuth=False`: O(n^3), exactly `(n^3 - n) / 6` splits |

**The exact count.** For length 2 every cell tries its one split: `n - 1`. For a length `L >= 3`, the cells `(i, i+L-1)` try `split[i+1][j] - split[i][j-1] + 1` splits each, and summed over the diagonal the inner terms cancel:

    (n - L + 1) + split[n-L+1][n-1] - split[0][L-2]

Since `split[n-L+1][n-1] <= n - 2` and `split[0][L-2] >= 0`, a diagonal tries at most `(n - L + 1) + (n - 2)`, and a whole fill at most `(3n^2 - 9n + 8) / 2`. The tests count the calls of `_try_split` and check that they equal this telescoped sum on 400 random rows. A fill that does not narrow tries `(n^3 - n) / 6`, more than the bound once `n >= 5`, so the test fails (for `n = 4` the two are both 10, and for `n = 3` the only window of length 3 is the whole range).

Counted on the Python code:

| n | Equal piles | Random piles | Two heavy ends | Bound | Plain DP |
|---|-------------|--------------|----------------|-------|----------|
| 10 | 81 | 85 | 109 | 109 | 165 |
| 20 | 361 | 340 | 514 | 514 | 1,330 |
| 40 | 1,521 | 1,580 | 2,224 | 2,224 | 10,660 |
| 80 | 6,241 | 6,187 | 9,244 | 9,244 | 85,320 |
| 160 | 25,281 | 24,864 | 37,684 | 37,684 | 682,640 |

Equal piles try exactly `(n - 1)^2`. With two heavy end piles (1000, then 1s, then 1000) every prefix is best split after its first pile and every suffix before its last, so each window is as wide as it can be and the bound is reached. Doubling `n` multiplies the work by about 4, against 8 for the plain DP. In Python, 1000 piles take about 0.6 s and 2000 piles about 2.5 s; in C++ and Go, 5000 piles take under half a second.

**Overflow.** Python's integers do not overflow. C++ and Go keep costs in signed 64-bit integers, as Interval DP does, and report a result above 2^63 - 1 instead of wrapping: `std::overflow_error` in C++, an error wrapping `ErrOverflow` in Go.

- Piles 2^62 and 2^62 cost 2^63 and overflow (Python returns 2^63); piles 2^62 and 2^62 - 1 cost exactly 2^63 - 1, which fits.
- A split whose cost does not fit simply loses: on piles 2^62, 0, 1 the minimum, 2^62 + 2, fits and is returned.
- A cell that does not fit keeps its window's first `k` as its split, so the windows that read it stay in range; the answer contains that cell's range, costs at least as much, and is reported. Piles 2^61, 2^61, 2^61, 0 have a total that fits, but `dp[0][2] = 5 * 2^61` does not.
- One pile costs 0 whatever its size; one key costs its frequency, 2^63 - 1 included.

## When to Use

Use it when:
- the recurrence is `dp[i][j] = min over i <= k < j of dp[i][k] + dp[k+1][j] + C(i, j)`, or the same with a shared point, `dp[i][k] + dp[k][j]`;
- `C` satisfies the quadrangle inequality and is monotone on intervals: a range sum of values that are 0 or more, a length, a convex function of such a sum (the square of the sum, for example);
- `n` is in the thousands: O(n^2) time and memory.

Do not use it when:
- the cost breaks the inequality, as the square root of the size does: the answer is silently too large. Check the inequality, or compare with the plain DP on small random inputs;
- the cost depends on the split `k` itself, as in burst balloons or Matrix Chain Multiplication (`dims[i-1] * dims[k] * dims[j]`): the recurrence does not have the form above;
- the DP has layers instead of ranges, `dp[g][i] = min over j of dp[g-1][j] + C(j, i)`: that is Divide and Conquer Optimization.

## Knuth Optimization vs. Alternatives

| Technique | Time | Needs |
|-----------|------|-------|
| Plain interval DP | O(n^3) | nothing |
| Knuth's optimization (this code) | O(n^2) | the quadrangle inequality, and C monotone on intervals |
| [Divide and Conquer Optimization](../Divide_and_Conquer_Optimization/) | O(k n log n) for `k` layers of `n` cells | a layered DP whose best `j` is monotone in `i` (the quadrangle inequality on C) |
| [Convex Hull Trick](../Convex_Hull_Trick/) | O(n) or O(n log V) for a one-index DP | `C(j, i)` splits into lines |
| Huffman coding (any two piles may merge) | O(n log n) | a different problem: the piles need not be neighbours |

Divide and conquer and Knuth rest on the same inequality. Divide and conquer uses it inside one layer, where the best `j` of a cell bounds the cells on each side of it; Knuth uses it across the lengths of an interval DP, where the two cells of the previous diagonal bound a cell's split.

## Common Pitfalls

1. **No check of the condition.** With a cost that breaks the inequality the window misses the best split, and the DP returns a larger value with no error: 8 instead of 7 on piles 1, 1, 2, 1, 6 with the square root of the size as the cost.
2. **The window of two points.** `split[i][i]` is not a split; use `k = i` for a range of two (or set `opt[i][i] = i` and clamp the upper end to `j - 1`, as some write-ups do).
3. **The order of the fill.** The window reads two cells of the previous diagonal: fill by length, or with `i` going down and `j` going up. Row by row from the top reads `split[i+1][j]` before it exists.
4. **Narrowing with the wrong cells.** The bounds are `split[i][j-1]` and `split[i+1][j]`, in that order; swapping them gives an empty or wrong window. The exact count in the tests catches it.
5. **`<=` instead of `<`.** The largest best split is monotone too, so the values stay right (on 3000 random rows), but the merges differ from Interval DP's on 1001 of them.
6. **Overflow in C++ and Go.** A cell that does not fit must still leave a valid split for the windows that read it.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `knuth_optimization.py` | `split_dp`, `merge_piles`, `merge_piles_plan` (merges as `(i, k, j)` tuples), `optimal_bst`; `ValueError` on bad input |
| C++ | [C++/](C++/) | `knuth_optimization.cpp` | `splitDp` (a `std::function` cost), `mergePiles`, `mergePilesPlan` (a `MergePlan` of `Merge` structs), `optimalBst`; `long long`; `std::invalid_argument`, `std::overflow_error` |
| Go | [Go/](Go/) | `main.go` | `SplitDP` (a `func(i, j int) int64` cost), `MergePiles`, `MergePilesPlan` (a `[]Merge`), `OptimalBST`; `int64`; errors wrapping `ErrInvalidInput` or `ErrOverflow` |

All three try the same windows in the same order with the same tie rule: the C++ and Go tests check the costs, the merges and the number of splits tried on 40 pile rows, the costs and splits tried on 20 sets of key frequencies, and the square-root cost with and without the window on 16 rows, against outputs of the Python code.

## Practice Problems

- [Slimes (AtCoder DP N)](https://atcoder.jp/contests/dp/tasks/dp_n): exactly `merge_piles`; with `N` up to 400 the cubic DP passes, so it is a safe place to write the window and compare.
- [Minimum Cost to Cut a Stick (LeetCode 1547)](https://leetcode.com/problems/minimum-cost-to-cut-a-stick/): add the two ends to the sorted cuts; a cut costs the length of its piece, a range sum of the gaps, and the recurrence shares the cut point, `dp[i][k] + dp[k][j]`.
- [Knuth Division (CSES 2088)](https://cses.fi/problemset/task/2088): merging piles played backwards, with `n` up to 5000: only the O(n^2) window fits the time limit.
- [Breaking String (SPOJ BRKSTRNG)](https://www.spoj.com/problems/BRKSTRNG/): up to 1000 breaks in a long string, a break costing the length of the piece; many test cases, so the cubic DP is too slow.

## Related

- [Interval DP](../../Advanced_DP/Interval_DP/): the O(n^3) DP this speeds up, with the same pile-merging problem
- [Divide and Conquer Optimization](../Divide_and_Conquer_Optimization/): the same inequality, for layered DPs
- [Convex Hull Trick](../Convex_Hull_Trick/): the speed-up for costs that are lines
- [Matrix Chain Multiplication](../../2D_DP/Matrix_Chain_Multiplication/): an interval DP whose cost depends on `k`, where this window does not apply
- [Binary Search Tree](../../../../Data_Structures/Non_Linear/Trees/Binary_Search_Tree/): the trees `optimal_bst` builds
- [DP Optimizations overview](../README.md)
