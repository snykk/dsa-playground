# Manacher's Algorithm (Longest Palindromic Substring)

Manacher's algorithm finds the longest palindromic substring of a string in O(n) time and O(n) space. It computes the palindrome radius at every center and reuses the mirror image of palindromes it has already found.

## Intuition

A palindrome is centered on a character (`aba`) or between two characters (`abba`). Putting a `#` between every pair of characters (and at both ends) makes every palindrome odd-length with a single center: `abba` becomes `#a#b#b#a#`, centered on the middle `#`. The radius of the palindrome in the new string equals its length in the original.

Inside a palindrome centered at `c`, the string reads the same in both directions. So the palindrome around a point `i` right of `c` mirrors the one around `2c - i`, as far as the right edge `r` of the big palindrome. Only the part past `r` must be compared. Since `r` never moves left, the total work is linear.

## Visual

`s = babad`, transformed `#b#a#b#a#d#`:

```text
index:   0 1 2 3 4 5 6 7 8 9 10
t:       # b # a # b # a # d #
p[i]:    0 1 0 3 0 3 0 1 0 1 0
                 ^ first largest radius (3) at index 3

start = (3 - 3) / 2 = 0, length = 3  ->  "bab"
```

## How It Works

1. Build `t = "#" + "#".join(s) + "#"`. Character `s[k]` is at `t[2k + 1]`. There are no sentinel characters; expansion is bounds-checked.
2. Keep `center` and `right`, the palindrome that reaches furthest right. For each `i`: if `i < right`, start with `p[i] = min(right - i, p[2*center - i])`.
3. Expand: while both ends are inside the string and `t[i + p[i] + 1] == t[i - p[i] - 1]`, increase `p[i]`.
4. If `i + p[i] > right`, set `center = i` and `right = i + p[i]`.
5. The first index with the largest `p[i]` gives the answer: start `(i - p[i]) / 2`, length `p[i]`.

## Step-by-Step Trace

`babad` (indices in the transformed string):

| i | char | start value | final p[i] | center, right |
|---|------|-------------|------------|---------------|
| 0 | `#` | 0 | 0 | 0, 0 |
| 1 | `b` | 0 | 1 | 1, 2 |
| 2 | `#` | 0 | 0 | 1, 2 |
| 3 | `a` | 0 | 3 | 3, 6 |
| 4 | `#` | 0 (copy of p[2]) | 0 | 3, 6 |
| 5 | `b` | 1 (min(1, p[1])) | 3 | 5, 8 |
| 6 | `#` | 0 (copy) | 0 | 5, 8 |
| 7 | `a` | 1 (min(1, p[3])) | 1 | 5, 8 |
| 8 | `#` | 0 | 0 | 5, 8 |
| 9 | `d` | 0 | 1 | 9, 10 |
| 10 | `#` | 0 | 0 | 9, 10 |

The largest radius is 3, first at index 3: `("bab", 0, 3)`. `aba` ties and starts later.

## Complexity

| Quantity | Value |
|----------|-------|
| Time | O(n) in every case |
| Space | O(n): the transformed string (2n + 1 characters) and the radius array |

Every successful comparison in the expansion loop moves `right` forward, and `right` is at most `2n`; failed comparisons happen at most once per index. Starting from the mirror value costs no comparisons.

## When to Use

- You need the longest palindromic substring, or the palindrome radius at every center, for long strings.
- You want to count palindromic substrings (the sum of `(p[i] + 1) / 2`).

For short inputs, expanding around each center is O(n^2) but shorter to write and uses O(1) extra space.

## Manacher's vs. Alternatives

| Approach | Time | Space |
|----------|------|-------|
| Manacher's | O(n) | O(n) |
| Expand around each center | O(n^2) | O(1) |
| DP table `isPal[i][j]` | O(n^2) | O(n^2) |
| Reverse and longest common substring | O(n^2) | O(n^2), and the indices must be checked |

## Common Pitfalls

- Using characters of the input as sentinels: an older version used `^` and `$`, and inputs containing them broke the algorithm. Check the bounds instead.
- Using `p[mirror]` without the `min` with `right - i`.
- Mapping the answer back wrongly: start is `(i - p[i]) / 2`, length is `p[i]`.
- Mixing bytes and runes: Go transforms and indexes runes, C++ works on bytes, Python on code points.
- Ties: the earliest palindrome is returned; the others are not reported.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `manacher.py` | Returns `(substring, start, length)`; code-point indices |
| C++ | [C++/](C++/) | `manacher.cpp` | Returns the substring; works on bytes |
| Go | [Go/](Go/) | `main.go` | Returns the substring; works on runes |

## Practice Problems

- [LeetCode 5: Longest Palindromic Substring](https://leetcode.com/problems/longest-palindromic-substring/)
- [LeetCode 647: Palindromic Substrings](https://leetcode.com/problems/palindromic-substrings/)
- [LeetCode 214: Shortest Palindrome](https://leetcode.com/problems/shortest-palindrome/)
- [LeetCode 132: Palindrome Partitioning II](https://leetcode.com/problems/palindrome-partitioning-ii/)

## Related

- [Z-Algorithm](../Z-Algorithm/)
- [KMP Algorithm](../../Pattern_Matching/KMP%20Algorithm/)
- [Longest Common Substring](../Longest%20Common%20Substring/)
