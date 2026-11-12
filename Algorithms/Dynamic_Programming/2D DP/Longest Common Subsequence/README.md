# Longest Common Subsequence

The Longest Common Subsequence (LCS) of two strings is the longest sequence of characters that appears in both, in the same order but not necessarily contiguously. A table over prefixes finds its length in O(m * n) time, and a walk back through the table recovers one such sequence.

## Intuition

A substring is contiguous (`ell` in `hello`); a subsequence only keeps the order (`hlo` in `hello`). The LCS is the longest chain of matches you can draw between the two strings without any lines crossing.

Let `dp[i][j]` be the LCS length of the first `i` characters of `s1` and the first `j` characters of `s2`. If the last characters match, some LCS ends with that character, so take it. If not, one of the two last characters is unused, so drop one and keep the better answer.

## Visual

`s1 = "ABCBDAB"`, `s2 = "BDCAB"`. Matched cells on the traceback are bracketed.

```text
        -  B  D  C  A  B
   -    0  0  0  0  0  0
   A    0  0  0  0  1  1
   B    0  1  1  1  1  2
   C    0  1  1  2  2  2
   B    0 [1] 1  2  2  3
   D    0  1 [2] 2  2  3
   A    0  1  2  2 [3] 3
   B    0  1  2  2  3 [4]     <- dp[7][5] = 4
```

Reading the brackets from the bottom: `B`, `A`, `D`, `B`, which is `BDAB` once reversed.

## How It Works

1. `dp[0][j] = 0` and `dp[i][0] = 0` (an empty prefix shares nothing).
2. For `i = 1..m`, `j = 1..n`:
   - if `s1[i-1] == s2[j-1]`, `dp[i][j] = dp[i-1][j-1] + 1`;
   - otherwise `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`.
3. The length is `dp[m][n]`.

Traceback (`lcs_sequence`): start at `(m, n)`. On a match, record the character and move diagonally. Otherwise move up if `dp[i-1][j] > dp[i][j-1]`, else left. Reverse the recorded characters. The tie rule picks one of possibly several LCSs.

## Step-by-Step Trace

The key cells of the example:

| Cell | Characters | Rule | Value |
|------|-----------|------|-------|
| `dp[2][1]` | `B` and `B` match | `dp[1][0] + 1` | 1 |
| `dp[4][1]` | `B` and `B` match | `dp[3][0] + 1` | 1 |
| `dp[5][2]` | `D` and `D` match | `dp[4][1] + 1` | 2 |
| `dp[6][4]` | `A` and `A` match | `dp[5][3] + 1` | 3 |
| `dp[7][5]` | `B` and `B` match | `dp[6][4] + 1` | 4 |
| `dp[3][3]` | `C` and `C` match | `dp[2][2] + 1` | 2 |

`BCAB` is another LCS of length 4, so the answer is not unique.

## Complexity

| Version | Time | Space | Why |
|---------|------|-------|-----|
| Plain recursion | O(2^(m+n)) | O(m + n) stack | prefix pairs repeat |
| Table (`lcs_length`, `lcs_sequence`, C++, Go) | O(m * n) | O(m * n) | `(m + 1)(n + 1)` cells, constant work each |
| Two rows (`lcs_optimized`, Python) | O(m * n) | O(min(m, n)) | row `i` needs only row `i-1`; length only |

## When to Use

Use it for:
- comparing two sequences (files, DNA strings, versions);
- problems that ask for the longest ordered overlap (Uncrossed Lines, shortest common supersequence, edit distance with inserts and deletes only).

Do not use it when:
- the common part must be contiguous (longest common substring: reset a cell to 0 on a mismatch);
- the strings are huge, since time and memory are quadratic;
- you need the most similar strings under replacements too (edit distance).

## LCS vs. Alternatives

| Problem | Skips allowed? | Mismatch rule | Time |
|---------|----------------|---------------|------|
| Longest Common Subsequence | yes | `max(up, left)` | O(m * n) |
| Longest Common Substring | no | cell becomes 0 | O(m * n) |
| Edit Distance | yes, at cost 1 per edit | `1 + min(up, left, diagonal)` | O(m * n) |
| Shortest Common Supersequence | builds a string containing both | length `m + n - LCS` | O(m * n) |

## Common Pitfalls

1. Confusing subsequence and substring.
2. Off-by-one: cell `dp[i][j]` compares `s1[i-1]` and `s2[j-1]`.
3. Trying to recover the sequence from the two-row version: it keeps no table to walk back through.
4. Expecting a unique answer: the tie rule decides which LCS is returned.
5. Byte versus character semantics: C++ and Go compare bytes, Python compares Unicode code points, so an accented letter that takes two bytes in UTF-8 gives different results across languages.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `lcs.py` | `lcs_length`, `lcs_sequence` (traceback), `lcs_optimized` (two rows) |
| C++ | [C++/](C++/) | `lcs.cpp` | `lcsLength` only; compares bytes |
| Go | [Go/](Go/) | `main.go` | `LCSLength` only; compares bytes |

## Practice Problems

- [LeetCode 1143. Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence/) - the canonical problem
- [LeetCode 1035. Uncrossed Lines](https://leetcode.com/problems/uncrossed-lines/) - the LCS in disguise
- [LeetCode 583. Delete Operation for Two Strings](https://leetcode.com/problems/delete-operation-for-two-strings/) - `m + n - 2 * LCS`
- [LeetCode 1092. Shortest Common Supersequence](https://leetcode.com/problems/shortest-common-supersequence/) - build the string from the table
- [LeetCode 718. Maximum Length of Repeated Subarray](https://leetcode.com/problems/maximum-length-of-repeated-subarray/) - the substring variant

## Related

- [Edit Distance](../Edit%20Distance/) - the same table with replacements
- [Longest Increasing Subsequence](../../Linear%20DP/Longest%20Increasing%20Subsequence/) - a one-sequence cousin
- [0/1 Knapsack](../0-1%20Knapsack/) - another 2D DP table
- [Dynamic Programming overview](../../README.md)
