# Knuth-Morris-Pratt (KMP) Algorithm

KMP finds every occurrence of a pattern in a text in O(n + m) time. It precomputes, for each prefix of the pattern, the longest border (a prefix that is also a suffix), so after a mismatch it never moves backwards in the text.

## Intuition

When the naive search fails after matching `j` characters it forgets them and restarts one step to the right. But those `j` characters are known: they equal `pattern[0..j-1]`. If a prefix of the pattern is also a suffix of that matched part (a border), it is already matched at the next useful alignment. The LPS table stores the longest such border for every prefix, so a mismatch only moves the pattern pointer `j` back to `lps[j-1]`; the text pointer `i` never decreases.

## Visual

Pattern `ABABCABC`, LPS `[0, 0, 1, 2, 0, 1, 2, 0]`; text `ABABDABACDABABCABC`:

```text
text:     A B A B D A B A C D A B A B C A B C
index:    0 1 2 3 4 5 6 7 8 9 ...
attempt1: A B A B . .                  ABAB matches, D vs C: j = lps[3] = 2,
                                       D vs A: j = lps[1] = 0, D vs A: i -> 5
attempt2:           A B A .            ABA matches, C vs B: j = lps[2] = 1,
                                       C vs B: j = 0, C vs A: i -> 9, D vs A: i -> 10
attempt3:                     A B A B C A B C    all 8 match -> report 10
```

## How It Works

1. **Build `lps`.** With `i = 1` and `length = 0`: if `pattern[i] == pattern[length]`, set `length += 1`, `lps[i] = length`, `i += 1`; else if `length != 0`, set `length = lps[length - 1]` (keep `i`); else set `lps[i] = 0` and `i += 1`.
2. **Scan.** With `i = j = 0`: if `text[i] == pattern[j]`, advance both.
3. **Full match.** If `j == m`, report `i - j` and set `j = lps[j - 1]` (overlapping matches are found).
4. **Mismatch.** If `i < n` and `text[i] != pattern[j]`: if `j != 0`, set `j = lps[j - 1]`; otherwise advance `i`.

An empty pattern, an empty text, or a pattern longer than the text returns `[]` in all three languages.

## Step-by-Step Trace

| Step | i | j | Event | Next j |
|------|---|---|-------|--------|
| 1-4 | 0..3 | 0..3 | `ABAB` matches | 4 |
| 5 | 4 | 4 | `D` vs `C` | `lps[3] = 2` |
| 6 | 4 | 2 | `D` vs `A` | `lps[1] = 0` |
| 7 | 4 | 0 | `D` vs `A`, `j == 0` | i = 5 |
| 8-10 | 5..7 | 0..2 | `ABA` matches | 3 |
| 11 | 8 | 3 | `C` vs `B` | `lps[2] = 1` |
| 12 | 8 | 1 | `C` vs `B` | `lps[0] = 0` |
| 13-14 | 8, 9 | 0 | `C` vs `A`, `D` vs `A`, `j == 0` | i = 10 |
| 15-22 | 10..17 | 0..7 | eight matches, `j == m` | report 10 |

The text characters `D` and `C` are each compared with three pattern positions, so "each text character is examined once" is not literally true; `i` never moves left and at most `2n` distinct `(i, j)` pairs are compared (22 here, with `n = 18`). The code's `elif` repeats many of these tests, so its raw count of `==` and `!=` tests is at most twice that (39 here).

## Complexity

| Phase | Time | Space |
|-------|------|-------|
| LPS table | O(m) | O(m) |
| Search | O(n) | O(1) beyond the table |
| Total | O(n + m) | O(m) |

In the search, `i` only increases, `j` grows at most `n` times in total and each fall back lowers it, so there are at most `n` fall backs and at most `2n` loop steps. The bound holds in the best, average and worst case.

## When to Use

- A guaranteed linear bound for one pattern, or text that arrives as a stream.
- Borders and periods: `m - lps[m-1]` is the smallest period candidate; `lps[m-1]` is the longest border.
- Not for many patterns (use Aho-Corasick), and not when a library search is available and speed on typical text matters most.

## KMP vs. Alternatives

| Algorithm | Best | Worst | Extra space |
|-----------|------|-------|-------------|
| KMP | O(n + m) | O(n + m) | O(m) |
| Naive | O(n) | O(n*m) | O(1) |
| Z-algorithm | O(n + m) | O(n + m) | O(n + m) |
| Boyer-Moore (bad character) | O(n/m) | O(n*m) | O(sigma) |
| Rabin-Karp | O(n + m) | O(n*m) | O(1) |

## Common Pitfalls

- Moving `i` back on a mismatch.
- Using `lps[j]` instead of `lps[j - 1]` when falling back.
- Advancing `i` on a mismatch when `j > 0`.
- Stopping at the first match, which loses overlapping matches.
- Mixing empty-pattern conventions: here `[]`, while library searches (`str.find`, `std::string::find`, `strings.Index`) report an empty pattern at index 0.
- Python indices are code points; C++ and Go are bytes.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `kmp.py` | `build_lps`, `kmp_search`, `kmp_search_count`, `kmp_search_first` |
| C++ | [C++/](C++/) | `kmp.cpp` | `buildLPS`, `kmpSearch`, `kmpSearchCount`, `kmpSearchFirst` |
| Go | [Go/](Go/) | `main.go` | `BuildLPS`, `KMPSearch`, `KMPSearchCount`, `KMPSearchFirst` |

## Practice Problems

- [LeetCode 28: Find the Index of the First Occurrence in a String](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/)
- [LeetCode 459: Repeated Substring Pattern](https://leetcode.com/problems/repeated-substring-pattern/)
- [LeetCode 1392: Longest Happy Prefix](https://leetcode.com/problems/longest-happy-prefix/)
- [LeetCode 214: Shortest Palindrome](https://leetcode.com/problems/shortest-palindrome/)
- [CSES: String Matching](https://cses.fi/problemset/task/1753)

## Related

- [Naive Pattern Search](../Naive_Pattern_Search/)
- [Boyer-Moore Algorithm](../Boyer_Moore_Algorithm/)
- [Rabin-Karp Algorithm](../Rabin_Karp_Algorithm/)
- [Z-Algorithm](../../Advanced_String/Z_Algorithm/)
- [Aho-Corasick](../../Advanced_String/Aho_Corasick/)
- [Pattern Matching (all four algorithms)](../)
