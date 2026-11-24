# Interval DP

Interval DP solves a problem on a row of things (piles, balloons, the letters of a string) by answering it for every contiguous range `i..j`, shortest ranges first. The answer for a range comes from one choice inside it, a split point or the last action taken in it, and from the answers for the two shorter ranges that choice leaves. With about `n^2 / 2` ranges and up to `n - 1` choices each, that is O(n^3) time and O(n^2) space. [Matrix Chain Multiplication](../../2D_DP/Matrix_Chain_Multiplication/) is the classic example; this topic names the pattern and applies it to merging piles (with the merges read back), bursting balloons and cutting a string into palindromes.

## Intuition

Four piles of stones lie in a row: 3, 2, 4 and 1. You may merge two neighbouring piles into one, and a merge costs the size of the pile it makes. What is the cheapest way to end with a single pile?

Look at the **last** merge. It joins a left pile made of piles `i..k` with a right pile made of piles `k+1..j`, and it costs `sum(i..j)` whatever `k` is. Before it, the left pile was built from its own piles only, and the right pile from its own: the two halves never interact. So each half must be built as cheaply as possible, and

    dp[i][j] = min over i <= k < j of dp[i][k] + dp[k+1][j] + sum(i..j),   dp[i][i] = 0

Both `dp[i][k]` and `dp[k+1][j]` are ranges shorter than `i..j`. Filling the table **by increasing length** (all ranges of length 2, then 3, up to `n`) guarantees that every cell a candidate reads is already final. Matrix Chain Multiplication is the same recurrence with another join cost, `dims[i-1] * dims[k] * dims[j]` instead of `sum(i..j)`.

The choice does not have to be a split. In **burst balloons**, bursting a balloon earns the product of its value and its two current neighbours, so the first balloon you burst makes its neighbours meet, and the two sides interact. Choose instead the balloon burst **last** between two balloons `left` and `right` that stay: when it goes, everything else between them is gone, so its neighbours are exactly `left` and `right`, and until then it separates the balloons on its left from those on its right.

## Visual

The table for the piles 3, 2, 4, 1, as `_fill_merge` leaves it. Each cell is `dp[i][j]`, the cheapest way to merge piles `i..j`, with `split[i][j]`, the `k` of the last merge, in brackets. The cells are filled one diagonal at a time: length 1 (the zeros), then 2, 3 and 4.

```text
 dp[i][j] [k]   j=0     j=1       j=2       j=3
 i=0 (3)         0     5 [0]    14 [1]    20 [1]   <- answer
 i=1 (2)                 0       6 [1]    12 [1]
 i=2 (4)                           0       5 [2]
 i=3 (1)                                     0
```

Reading `split` back from the top cell gives the merge tree: the last merge (cost 10) joins piles `0..1` with piles `2..3`, each of which was one merge of two piles (cost 5 each). The total is 20.

```text
            10            merge (0, 1, 3): cost 10
          /    \
         5      5         merges (0, 0, 1) and (2, 2, 3): cost 5 each
        / \    / \
       3   2  4   1       the piles
```

## How It Works

**Merging piles** (`merge_piles`, `merge_piles_plan`):

1. Check that every pile size is 0 or more, and compute the prefix sums `P[t] = piles[0] + ... + piles[t-1]`, so that `sum(i..j) = P[j+1] - P[i]` in O(1).
2. `dp[i][i] = 0`: one pile needs no merge.
3. For each `length` from 2 to `n`, each `i` from 0 to `n - length`, and `j = i + length - 1`: start `dp[i][j]` at infinity, then for each `k` from `i` to `j - 1` compute `dp[i][k] + dp[k+1][j] + P[j+1] - P[i]`; if it is **strictly** smaller, store it and set `split[i][j] = k`.
4. The answer is `dp[0][n-1]` (0 for no piles or one pile).
5. To read the merges back, start with the range `0..n-1` on a stack. A range of one pile is already built. For a longer range with `k = split[i][j]`, first build `i..k`, then `k+1..j`, then record the merge `(i, k, j)`. The merges come out in **post-order**, so every merge comes after the merges that built its two parts, and their costs add up to the answer.

**The tie rule.** The splits are tried in increasing order and `dp[i][j]` changes only on a strict gain, so `split[i][j]` is the **smallest** `k` that reaches the minimum. On piles 1, 1, 1 both splits of the whole row cost 5; `k = 0` is kept, so the merges are `(1, 1, 2)` and then `(0, 0, 2)`: the last two piles first. On equal piles the smallest `k` makes the left part as short as possible. Python, C++ and Go follow this rule and return the same list.

**Top-down** (`merge_piles_memo`). The same recurrence as a recursive function with a memo: `solve(i, j)` asks for `solve(i, k)` and `solve(k+1, j)` before it tries `k`. It computes every cell once, tries the same `(i, k, j)` candidates in another order and fills the same tables (the tests compare them). The recursion goes up to `n` calls deep.

**Burst balloons** (`burst_balloons`):

1. Check that every value is 0 or more, and add a balloon worth 1 at each end: `v = [1] + nums + [1]`.
2. `dp[left][right]` is the most coins from bursting every balloon strictly between `left` and `right`, while those two stay. A range with nothing inside is worth 0.
3. By increasing `right - left`, for each `k` between them, as the last balloon burst in the range: `dp[left][k] + v[left] * v[k] * v[right] + dp[k][right]`. Keep the largest.
4. The answer is `dp[0][n+1]`.

**Cutting a string into palindromes** (`min_palindrome_cuts`):

1. Fill `pal[i][j]`, "`s[i..j]` reads the same both ways", by length too: `pal[i][j] = s[i] == s[j]` and, for length 3 or more, `pal[i+1][j-1]`. That is O(n^2).
2. A palindrome needs no cut: `cuts[i][j] = 0`. Any other range has a first cut after some `k`: `cuts[i][j] = min over k of cuts[i][k] + 1 + cuts[k+1][j]`.
3. The answer is `cuts[0][n-1]` (0 for the empty string).

**Bad input.** A pile or a balloon below 0 is rejected: `ValueError` in Python, `std::invalid_argument` in C++, an error wrapping `ErrInvalidInput` in Go. Every string is valid.

## Step-by-Step Trace

The ten candidates `merge_piles([3, 2, 4, 1])` tries, in order, as `_try_split` sees them (prefix sums 0, 3, 5, 9, 10):

| Length | Cell | k | dp[i][k] + dp[k+1][j] + sum | Cost | dp[i][j] after |
|--------|------|---|-----------------------------|------|----------------|
| 2 | `dp[0][1]` | 0 | 0 + 0 + 5 | 5 | 5, `split = 0` |
| 2 | `dp[1][2]` | 1 | 0 + 0 + 6 | 6 | 6, `split = 1` |
| 2 | `dp[2][3]` | 2 | 0 + 0 + 5 | 5 | 5, `split = 2` |
| 3 | `dp[0][2]` | 0 | 0 + 6 + 9 | 15 | 15, `split = 0` |
| 3 | `dp[0][2]` | 1 | 5 + 0 + 9 | 14 | 14, `split = 1` |
| 3 | `dp[1][3]` | 1 | 0 + 5 + 7 | 12 | 12, `split = 1` |
| 3 | `dp[1][3]` | 2 | 6 + 0 + 7 | 13 | 12 (no change) |
| 4 | `dp[0][3]` | 0 | 0 + 12 + 10 | 22 | 22, `split = 0` |
| 4 | `dp[0][3]` | 1 | 5 + 5 + 10 | 20 | 20, `split = 1` |
| 4 | `dp[0][3]` | 2 | 14 + 0 + 10 | 24 | 20 (no change) |

Reading back: `split[0][3] = 1` splits the row into `0..1` and `2..3`; `split[0][1] = 0` and `split[2][3] = 2` split those into single piles. `merge_piles_plan` returns `(20, [(0, 0, 1), (2, 2, 3), (0, 1, 3)])`: 5 + 5 + 10.

`burst_balloons([3, 1, 5, 8])` returns 167. With `v = 1, 3, 1, 5, 8, 1`, the best last balloon of the whole row is 8 (it earns 1 * 8 * 1 = 8); before it, between the left end and 8, the last is 3 (1 * 3 * 8 = 24); between 3 and 8, the last is 5 (3 * 5 * 8 = 120); between 3 and 5, the 1 (3 * 1 * 5 = 15). Played forwards: burst 1, 5, 3, then 8, for 15 + 120 + 24 + 8 = 167.

`min_palindrome_cuts("banana")` returns 1: the palindromes longer than one letter are `ana` (twice), `nan` and `anana`, and `b | anana` needs one cut.

## Complexity

| Function | Time | Space | Why |
|----------|------|-------|-----|
| `merge_piles`, `merge_piles_plan` | O(n^3) | O(n^2) | exactly `(n^3 - n) / 6` candidates: `n - L + 1` ranges of length `L`, `L - 1` splits each |
| `merge_piles_memo` | O(n^3) | O(n^2), plus a recursion `n` calls deep | the same candidates, each once |
| `burst_balloons` | O(n^3) | O(n^2) | exactly `n(n + 1)(n + 2) / 6` candidates over the `n + 2` balloons with the padding |
| `min_palindrome_cuts` | O(n^3) | O(n^2) | `n(n + 1) / 2` palindrome cells, then `j - i` candidates for each range that is not a palindrome: `(n^3 - n) / 6` when none is, 0 when all are |

Counted on the Python code (`_try_split` calls of `merge_piles`):

| n | candidates |
|---|-----------|
| 10 | 165 |
| 20 | 1,330 |
| 40 | 10,660 |
| 80 | 85,320 |

Doubling `n` multiplies the work by about 8. In Python, 200 piles take about 0.4 s and 400 piles about 3 s; in C++ and Go, 1000 piles take under a second and 2000 piles several seconds.

For pile merging the cubic loop is not the end. The best split of `i..j` lies between the best splits of `i..j-1` and `i+1..j` (with the smallest-`k` rule, `split[i][j-1] <= split[i][j] <= split[i+1][j]` held on 3000 random rows), so Knuth's optimization tries only the splits in that window and brings the time down to O(n^2).

**Overflow.** Python's integers do not overflow. C++ and Go keep costs and coins in signed 64-bit integers and report a result above 2^63 - 1 instead of wrapping: `std::overflow_error` in C++, an error wrapping `ErrOverflow` in Go.

- Merging piles 2^62 and 2^62 costs 2^63 and overflows (Python returns 2^63); piles 2^62 and 2^62 - 1 cost exactly 2^63 - 1, which fits.
- A split whose cost does not fit simply loses: on piles 2^62, 0, 1 the split after pile 1 would cost 2^63 + 1, but the minimum, after pile 0, is 2^62 + 2, and C++ and Go return it.
- Three piles of 2^61 have a total that fits, but every order costs 5 * 2^61: an overflow.
- One pile costs 0 whatever its size; two piles whose total does not fit cannot be merged.
- Balloons: 3037000499 and 3037000499 earn 9223372033963249500, which fits; 3037000500 and 3037000500 earn 9223372040037250500, which does not (Python returns it). A candidate that does not fit means the answer does not either, since bursting the balloons of one range first earns at least that range's best.

## When to Use

Use it when:
- the input is a sequence, and the question for a range is answered by one choice inside it (where to split, or what happens last) plus the same question on the two shorter ranges it leaves;
- the two sides of that choice are independent once it is fixed (if they are not, look for a "last" choice that separates them, as in burst balloons);
- `n` is at most a few hundred in Python, or about a thousand in C++ and Go.

Do not use it when:
- any two items may be combined, not only neighbours: merging any two piles is Huffman coding, solved greedily with a heap;
- `n` is in the thousands or more: the cubic loop is too slow, so look for a faster structure (Knuth's optimization for pile merging, the prefix form for palindrome cuts).

A range with only one or two choices, as in a game where each player takes from either end, still uses the interval table, but without a split loop: O(n^2).

## Interval DP vs. Alternatives

| Approach | Time | Result |
|----------|------|--------|
| Interval DP (this code) | O(n^3) | exact minimum or maximum |
| Every merge order or burst order | (n - 1)! merge orders, n! burst orders | exact, only for tiny inputs |
| Greedy: merge the cheapest neighbouring pair | O(n^2) | not optimal: on 3, 2, 2, 3 it pays 21 against 20 |
| Huffman coding (any two piles may merge) | O(n log n) | optimal, but for a different problem |
| Knuth's optimization (pile merging) | O(n^2) | exact, for costs such as `sum(i..j)` |
| Palindrome cuts over prefixes | O(n^2) | exact: `best[e] = min over b with s[b..e-1] a palindrome of best[b] + 1` |

The prefix form shows that palindrome cutting does not need the full interval DP: only the first piece's end matters, not both. The tests check that it agrees with `min_palindrome_cuts` and with brute force on 500 random strings.

## Common Pitfalls

1. **The wrong fill order.** Looping `i` down the rows from the top and `j` along each row reads `dp[k+1][j]` before it is computed: on 3, 2, 4, 1 it returns 10 instead of 20, without any error. Fill by length, or take `i` from the bottom row up.
2. **Summing the range inside the `k` loop.** That makes the time O(n^4). Prefix sums give `sum(i..j)` in O(1).
3. **Choosing the first balloon instead of the last.** After the first burst its two neighbours meet, so the two sides are no longer independent and the recurrence is wrong.
4. **Forgetting the padding.** Without a 1 at each end, the balloons at the ends have no neighbour to multiply by.
5. **Overflow in C++ and Go.** A merge cost is a range sum and an answer adds `n - 1` of them, so large piles pass 2^63 quickly.
6. **`<=` instead of `<`.** The value is the same, but `split` then keeps the largest tied `k`, and the merges returned change.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `interval_dp.py` | `merge_piles`, `merge_piles_plan` (merges as `(i, k, j)` tuples), `merge_piles_memo`, `burst_balloons`, `min_palindrome_cuts`; `ValueError` on bad input; compares code points |
| C++ | [C++/](C++/) | `interval_dp.cpp` | `mergePiles`, `mergePilesPlan` (a `MergePlan` of `Merge` structs), `mergePilesMemo`, `burstBalloons`, `minPalindromeCuts`; `long long`; `std::invalid_argument`, `std::overflow_error`; compares bytes |
| Go | [Go/](Go/) | `main.go` | `MergePiles`, `MergePilesPlan` (a `[]Merge`), `MergePilesMemo`, `BurstBalloons`, `MinPalindromeCuts`; `int64`; errors wrapping `ErrInvalidInput` or `ErrOverflow`; compares bytes |

All three fill the tables in the same order with the same tie rule and return the same values and merges: the C++ and Go tests check 40 pile rows, 24 balloon rows and 24 strings against outputs of the Python code. On text outside ASCII, C++ and Go compare UTF-8 bytes: an `a`, an `e` with an acute accent and an `a` make a palindrome in Python (0 cuts), but four bytes in C++ and Go, where no two bytes of a longer piece match (3 cuts).

## Practice Problems

- [Removal Game (CSES 1097)](https://cses.fi/problemset/task/1097): a table over the remaining range `l..r` filled by length, with only two choices per range (take the left end or the right end).
- [Slimes (AtCoder DP N)](https://atcoder.jp/contests/dp/tasks/dp_n): exactly `merge_piles`, with sizes up to 10^9, so the sums need 64 bits.
- [Minimum Score Triangulation of Polygon (LeetCode 1039)](https://leetcode.com/problems/minimum-score-triangulation-of-polygon/): the third vertex of the triangle on side `(i, j)` splits the polygon; the same shape as burst balloons, with a minimum.
- [Burst Balloons (LeetCode 312)](https://leetcode.com/problems/burst-balloons/): `burst_balloons` itself; the examples give 167 and 10.
- [Palindrome Partitioning II (LeetCode 132)](https://leetcode.com/problems/palindrome-partitioning-ii/): the palindrome table, but strings of 2000 letters need the O(n^2) prefix form instead of the cubic split loop.

## Related

- [Matrix Chain Multiplication](../../2D_DP/Matrix_Chain_Multiplication/): the classic interval DP, with a product as the join cost
- [Longest Common Subsequence](../../2D_DP/Longest_Common_Subsequence/): a 2D table over two prefixes rather than one range
- [Bitmask DP](../Bitmask_DP/): another state that is not a single index, a set instead of a range
- [Huffman Coding](../../../Greedy/Huffman_Coding/): merging any two piles, not only neighbours, is greedy
- [Advanced DP overview](../README.md)
