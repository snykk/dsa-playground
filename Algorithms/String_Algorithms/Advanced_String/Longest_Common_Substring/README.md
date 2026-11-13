# Longest Common Substring

The longest common substring of two strings is the longest run of consecutive characters that appears in both. A dynamic-programming table of matching-run lengths finds it in O(m*n) time; a suffix array or suffix automaton can do it in near-linear time.

## Intuition

Lay the two strings along the sides of a grid. A cell `(i, j)` where the characters match starts or extends a diagonal run; a mismatch ends it. The longest diagonal run anywhere in the grid is the answer. So `dp[i][j]` is the length of the longest common run that ends exactly at `s1[i-1]` and `s2[j-1]`, and a mismatch resets it to 0 because a substring cannot skip characters.

This differs from the longest common subsequence, which may skip characters and carries the best value through a mismatch.

## Visual

For `s1 = ABABC` and `s2 = BABCA`:

```text
         ''  B  A  B  C  A
    ''    0  0  0  0  0  0
    A     0  0  1  0  0  1
    B     0  1  0  2  0  0
    A     0  0  2  0  0  1
    B     0  1  0  3  0  0
    C     0  0  0  0  4  0     <- 4 at (5, 4): the answer ends here

The diagonal 1 -> 2 -> 3 -> 4 spells BABC.
```

## How It Works

1. Create a `(m+1) x (n+1)` table of zeros.
2. For each `i` in `1..m` and `j` in `1..n`: if `s1[i-1] == s2[j-1]`, set `dp[i][j] = dp[i-1][j-1] + 1`, otherwise 0.
3. Whenever a cell is strictly greater than the best so far, record its length and its row `i` (and column `j` in Python).
4. Return `s1[i - best : i]`, or the empty string if `best` is 0.

Because only a strictly greater value replaces the best, among equally long answers the one that ends first in `s1` wins.

## Step-by-Step Trace

The cells on the winning diagonal for `ABABC` and `BABCA`:

| Cell (i, j) | Characters | dp value | Best so far |
|-------------|------------|----------|-------------|
| (2, 1) | `B` = `B` | 1 | 1 |
| (3, 2) | `A` = `A` | 2 | 2 |
| (4, 3) | `B` = `B` | 3 | 3 |
| (5, 4) | `C` = `C` | 4 | 4, ending at i = 5 |

The answer is `s1[5-4 : 5] = BABC`. Python returns `("BABC", 4, 1, 0)`: the substring, its length, and its start in `s1` and in `s2`.

## Complexity

| Quantity | This code | Possible improvement |
|----------|-----------|----------------------|
| Time | O(m*n) in every case | O(m + n) with a suffix automaton; O(n log n) with a suffix array |
| Space | O(m*n), the whole table | O(min(m, n)) with two rolling rows |

The time is fixed because every cell is computed once, in constant time. Row `i` depends only on row `i-1`, which is why two rows would be enough; the code does not do that.

## When to Use

- Two strings of up to a few thousand characters, where the simple table is fast enough.
- You need the exact block they share, not just a similarity score.

For very long strings use a suffix array (concatenate with a separator and take the largest LCP between suffixes of different strings), a suffix automaton, or binary search on the length with hashing. For more than two strings, use a suffix structure.

## Longest Common Substring vs. Alternatives

| Problem | Contiguous | Recurrence |
|---------|------------|------------|
| Longest common substring | Yes | reset to 0 on a mismatch; answer is the maximum cell |
| Longest common subsequence | No | `max` of the left and upper cells on a mismatch; answer is the last cell |
| Edit distance | No | minimum over insert, delete and replace |

## Common Pitfalls

- Using `max` on a mismatch: that is the subsequence recurrence.
- Returning `dp[m][n]` instead of the maximum over all cells.
- Slicing with the wrong end: `i` is one past the last matched character.
- Reading Python's returned indices as end indices: they are start indices.
- Expecting every longest answer: only one is returned.
- Indices are code points in Python and bytes in C++ and Go.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `longest_common_substring.py` | Returns `(substring, length, start_in_s1, start_in_s2)` |
| C++ | [C++/](C++/) | `longest_common_substring.cpp` | Returns the substring only |
| Go | [Go/](Go/) | `main.go` | Returns the substring only |

## Practice Problems

- [LeetCode 718: Maximum Length of Repeated Subarray](https://leetcode.com/problems/maximum-length-of-repeated-subarray/)
- [LeetCode 1143: Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence/) (the subsequence contrast)
- [LeetCode 1044: Longest Duplicate Substring](https://leetcode.com/problems/longest-duplicate-substring/)
- [LeetCode 1062: Longest Repeating Substring](https://leetcode.com/problems/longest-repeating-substring/)

## Related

- [Suffix Array](../Suffix_Array/)
- [KMP Algorithm](../../Pattern_Matching/KMP_Algorithm/)
- [Longest Palindromic Substring (Manacher's)](../Longest_Palindromic_Substring_Manachers/)
