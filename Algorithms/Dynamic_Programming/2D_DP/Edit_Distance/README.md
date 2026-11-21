# Edit Distance

Edit distance (Levenshtein distance) is the minimum number of single-character insertions, deletions and replacements needed to turn string `s1` into string `s2`. A table over prefixes of both strings computes it in O(m * n) time.

## Intuition

You have a draft and a corrected version. How few keystrokes fix the draft? Each keystroke is one of three moves: insert a character, delete a character, or replace one character with another.

Let `dp[i][j]` be the distance between the first `i` characters of `s1` and the first `j` characters of `s2`. Look at the last characters: if they are equal, they cost nothing; otherwise the last move of a cheapest script is a delete, an insert or a replace, and each leaves a smaller pair of prefixes. So every cell depends only on three neighbors.

## Visual

`s1 = "kitten"`, `s2 = "sitting"`. Rows are prefixes of `s1`, columns are prefixes of `s2` (`-` is the empty prefix).

```text
        -  s  i  t  t  i  n  g
   -    0  1  2  3  4  5  6  7
   k    1 [1] 2  3  4  5  6  7
   i    2  2 [1] 2  3  4  5  6
   t    3  3  2 [1] 2  3  4  5
   t    4  4  3  2 [1] 2  3  4
   e    5  5  4  3  2 [2] 3  4
   n    6  6  5  4  3  3 [2][3]   <- dp[6][7] = 3
```

The bracketed cells form one traceback path from the corner back to `dp[0][0]`.

## How It Works

1. Borders: `dp[i][0] = i` (delete `i` characters) and `dp[0][j] = j` (insert `j` characters).
2. For `i = 1..m` and `j = 1..n`:
   - if `s1[i-1] == s2[j-1]`, then `dp[i][j] = dp[i-1][j-1]`;
   - otherwise `dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])`, which is delete, insert, replace.
3. The answer is `dp[m][n]`.

To list the actual edits, walk back from `dp[m][n]` choosing a neighbor that explains the value (diagonal for match or replace, up for delete, left for insert). The code in this repository returns only the number.

## Step-by-Step Trace

`kitten` to `sitting`, following the path in the Visual section:

| Step | Cell | Operation | Result |
|------|------|-----------|--------|
| 1 | `dp[1][1] = 1` | replace `k` with `s` | `sitten` |
| 2 | `dp[2][2]`, `dp[3][3]`, `dp[4][4]` | match `i`, `t`, `t` | `sitten` |
| 3 | `dp[5][5] = 2` | replace `e` with `i` | `sittin` |
| 4 | `dp[6][6]` | match `n` | `sittin` |
| 5 | `dp[6][7] = 3` | insert `g` | `sitting` |

Three non-match steps, so the distance is 3.

## Complexity

| Approach | Time | Space | Why |
|----------|------|-------|-----|
| Plain recursion | exponential (3 branches per mismatch) | O(m + n) stack | prefix pairs are recomputed |
| Bottom-up table (this code) | O(m * n) | O(m * n) | `(m + 1)(n + 1)` cells, constant work each |
| Two rows | O(m * n) | O(min(m, n)) | row `i` needs only row `i-1`; no traceback |

Time is the same for every input: there is no best or worst case.

## When to Use

Use it for:
- spell checking and autocorrect (dictionary words within a small distance);
- fuzzy search and record matching;
- sequence alignment (the same table with weights).

Do not use it when:
- you need semantic similarity ("cat" and "feline" are 6 edits apart);
- you only need to know whether the strings are equal (`==`);
- the strings are huge and quadratic time is too slow.

## Edit Distance vs. Alternatives

| Measure | Allowed operations | Time | Note |
|---------|-------------------|------|------|
| Levenshtein (this code) | insert, delete, replace | O(m * n) | unit costs |
| Indel distance | insert, delete | O(m * n) | equals `m + n - 2 * LCS` |
| Hamming distance | replace | O(n) | equal-length strings only |
| Damerau-Levenshtein | also swap adjacent letters | O(m * n) | `ab` to `ba` costs 1 instead of 2 |

## Common Pitfalls

1. Off-by-one: the table is one larger than the strings, so cell `dp[i][j]` compares `s1[i-1]` and `s2[j-1]`.
2. Wrong borders: `dp[0][j]` is `j`, not 0.
3. Counting a replace as two edits.
4. Bytes versus characters: the C++ and Go versions compare bytes, so a character that takes two bytes in UTF-8 can cost two edits. Python compares code points.
5. Expecting a swap of adjacent letters to cost 1 (that is Damerau-Levenshtein).

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `edit_distance.py` | `edit_distance`; compares Unicode code points |
| C++ | [C++/](C++/) | `edit_distance.cpp` | `editDistance`; compares bytes |
| Go | [Go/](Go/) | `main.go` | `EditDistance`; compares bytes |

Each is a single 2D-table function that returns only the distance.

## Practice Problems

- [LeetCode 72. Edit Distance](https://leetcode.com/problems/edit-distance/) - the canonical problem
- [LeetCode 583. Delete Operation for Two Strings](https://leetcode.com/problems/delete-operation-for-two-strings/) - insert and delete only
- [LeetCode 161. One Edit Distance](https://leetcode.com/problems/one-edit-distance/) - is the distance exactly 1
- [LeetCode 712. Minimum ASCII Delete Sum for Two Strings](https://leetcode.com/problems/minimum-ascii-delete-sum-for-two-strings/) - weighted deletions

## Related

- [Longest Common Subsequence](../Longest_Common_Subsequence/) - the insert/delete-only cousin
- [0/1 Knapsack](../0_1_Knapsack/) - another 2D DP table
- [Dynamic Programming overview](../../README.md)
