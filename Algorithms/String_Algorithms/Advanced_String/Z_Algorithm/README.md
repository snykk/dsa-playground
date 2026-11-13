# Z-Algorithm

The Z-algorithm computes, for every position of a string `s`, the length of the longest match between the suffix starting there and a prefix of `s`. It builds this Z-array in O(n) time, and the array finds every occurrence of a pattern in a text in O(n + m).

## Intuition

`Z[i]` answers "how much of the string's beginning starts again at `i`?" (with `Z[0] = 0` by convention here). Computing each value from scratch is quadratic. The trick is the **Z-box** `[l, r]`: the prefix match that reaches furthest right so far, so `s[l..r]` equals `s[0..r-l]`. A position `i` inside the box sees a copy of the start of the string, so `Z[i]` can begin at the already known `Z[i - l]`, clipped at the edge of the box. Only characters beyond `r` are really compared, and `r` never moves left.

## Visual

`s = aabxaabxaab`, `Z = [0, 1, 0, 0, 7, 1, 0, 0, 3, 1, 0]`:

```text
index:  0 1 2 3 4 5 6 7 8 9 10
s:      a a b x a a b x a a b
Z:      0 1 0 0 7 1 0 0 3 1 0
                |<-- box [4, 10]: s[4..10] = s[0..6] -->|
```

## How It Works

1. Set `l = r = 0` and process `i = 1 .. n-1`.
2. If `i <= r`: start with `Z[i] = min(r - i + 1, Z[i - l])`.
3. While `i + Z[i] < n` and `s[Z[i]] == s[i + Z[i]]`: increase `Z[i]`.
4. If `i + Z[i] - 1 > r`: set `l = i` and `r = i + Z[i] - 1`.

**Pattern search.** Build the Z-array of `pattern + "$" + text`. Text position `j` is combined index `m + 1 + j`; it is an occurrence when `Z[m + 1 + j] >= m`. Use `>=`, not `==`: if `$` also occurs in the input, `Z[i]` can run past the separator and exceed `m`.

An empty pattern, an empty text, or a pattern longer than the text returns `[]`.

## Step-by-Step Trace

`s = aabxaabxaab`:

| i | Start value | Comparisons | Z[i] | Z-box after |
|---|-------------|-------------|------|-------------|
| 1 | 0 | `a = a`, then `a` vs `b` fails | 1 | [1, 1] |
| 2 | 0 | `b` vs `a` fails | 0 | [1, 1] |
| 3 | 0 | `x` vs `a` fails | 0 | empty |
| 4 | 0 | seven matches, then the end | 7 | [4, 10] |
| 5 | `min(6, Z[1])` = 1 | none | 1 | [4, 10] |
| 6 | `min(5, Z[2])` = 0 | none | 0 | [4, 10] |
| 7 | `min(4, Z[3])` = 0 | none | 0 | [4, 10] |
| 8 | `min(3, Z[4])` = 3 | none | 3 | [4, 10] |
| 9 | `min(2, Z[5])` = 1 | none | 1 | [4, 10] |
| 10 | `min(1, Z[6])` = 0 | none | 0 | [4, 10] |

Search `aab` in `aabxaabaab`: the combined string `aab$aabxaabaab` has `Z = [0, 1, 0, 0, 3, 1, 0, 0, 3, 1, 0, 3, 1, 0]`. The values `>= 3` are at combined indices 4, 8 and 11, so the matches are at text indices `[0, 4, 7]`.

## Complexity

| Quantity | Time | Space |
|----------|------|-------|
| Z-array of a string of length k | O(k) | O(k) |
| Pattern search | O(n + m) | O(n + m) |

Every successful comparison moves `r` right by one and `r` never moves left, so there are at most `k` successful comparisons, plus at most one failure per position. The search copies the text into the combined string, so it needs O(n + m) space where KMP needs O(m).

## When to Use

- You want a linear-time search that is easy to derive and has no hashing.
- You need the Z-array itself: smallest period (`p + Z[p] == n`), borders (`i + Z[i] == n`), prefix-suffix questions.
- Not for streaming text (it needs the whole combined string) or many patterns (use Aho-Corasick).

## Z-Algorithm vs. KMP and Rabin-Karp

| | Z-algorithm | KMP | Rabin-Karp |
|--|-------------|-----|------------|
| Preprocessing | Z-array of pattern + text | LPS table of the pattern | pattern hash |
| Worst case | O(n + m) | O(n + m) | O(n*m) |
| Extra space | O(n + m) | O(m) | O(1) |
| Streams the text | No | Yes | Yes |

## Common Pitfalls

- Testing `z[i] == m` instead of `z[i] >= m`; with `$` in the input real matches are dropped.
- Starting the scan at the wrong index, or mapping back with the wrong offset (`i - m - 1`).
- Omitting the clip `min(r - i + 1, ...)`.
- Expecting an empty pattern to match everywhere: this code returns `[]`.
- Indices are code points in Python and bytes in C++ and Go.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `z_algorithm.py` | `build_z_array`, `z_algorithm_search`; 17 tests |
| C++ | [C++/](C++/) | `z_algorithm.cpp` | `buildZArray`, `zAlgorithmSearch`; 15 tests |
| Go | [Go/](Go/) | `main.go` | `ZAlgorithmSearch` exported, `buildZArray` internal |

## Practice Problems

- [LeetCode 28: Find the Index of the First Occurrence in a String](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/)
- [LeetCode 459: Repeated Substring Pattern](https://leetcode.com/problems/repeated-substring-pattern/)
- [LeetCode 1392: Longest Happy Prefix](https://leetcode.com/problems/longest-happy-prefix/)
- [CSES: String Matching](https://cses.fi/problemset/task/1753)
- [CSES: Finding Borders](https://cses.fi/problemset/task/1732)

## Related

- [KMP Algorithm](../../Pattern_Matching/KMP_Algorithm/)
- [Naive Pattern Search](../../Pattern_Matching/Naive_Pattern_Search/)
- [Manacher's Algorithm](../Longest_Palindromic_Substring_Manachers/)
- [Aho-Corasick](../Aho_Corasick/)
