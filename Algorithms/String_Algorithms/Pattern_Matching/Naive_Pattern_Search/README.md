# Naive Pattern Search

The naive (brute-force) search slides the pattern along the text one position at a time and compares character by character. It needs no preprocessing and O(1) extra space; its worst case is O(n*m) and every other search algorithm here improves on it.

## Intuition

A text of length `n` has `n - m + 1` places where a pattern of length `m` can start. Try each one: compare the pattern with the text from that position and stop at the first mismatch. Every start is tried, so no occurrence (including an overlapping one) can be missed. The cost is that a mismatch teaches the algorithm nothing: the next attempt starts again from scratch one position later.

## Visual

Pattern `ABABCABC` in text `ABABDABACDABABCABC`:

```text
text:    A B A B D A B A C D A B A B C A B C
i = 0:   A B A B C            ABAB matches, D vs C       5 comparisons
i = 1:     A                  B vs A                     1
i = 2:       A B A            AB matches, D vs A         3
 ...
i = 10:                      A B A B C A B C    all 8 match -> report 10
```

## How It Works

1. For each `i` from `0` to `n - m`, line the pattern up under `text[i]`.
2. Set `j = 0` and advance `j` while `j < m` and `text[i + j] == pattern[j]`.
3. If `j == m`, record `i`.
4. Move to `i + 1`.

An empty pattern, an empty text, or a pattern longer than the text returns `[]` in all three languages.

## Step-by-Step Trace

| Start i | Matched before the mismatch | Comparisons |
|---------|-----------------------------|-------------|
| 0 | `ABAB`, then `D` vs `C` | 5 |
| 1 | none (`B` vs `A`) | 1 |
| 2 | `AB`, then `D` vs `A` | 3 |
| 3 | none | 1 |
| 4 | none | 1 |
| 5 | `ABA`, then `C` vs `B` | 4 |
| 6 | none | 1 |
| 7 | `A`, then `C` vs `B` | 2 |
| 8 | none | 1 |
| 9 | none | 1 |
| 10 | all eight characters: match | 8 |

28 comparisons for an 18-character text; the result is `[10]`.

## Complexity

| Case | Time | When |
|------|------|------|
| Best | O(n) | the first pattern character mismatches at every alignment |
| Average | O(n) | random text over a reasonably large alphabet |
| Worst | O(n*m) | almost the whole pattern matches at every alignment, e.g. text `AAAA...AB`, pattern `AAAAB` |

For a 20-character text and pattern `AAAAB`: 16 attempts of 5 comparisons each, 80 in total. Extra space is O(1) besides the result list.

## When to Use

- Short patterns, small texts, or one-off searches.
- As a baseline and a test oracle for faster algorithms.
- Not for long patterns or repetitive input, where the quadratic worst case appears; use KMP for a guarantee.

## Naive vs. Alternatives

| Algorithm | Worst | Preprocessing | Idea |
|-----------|-------|---------------|------|
| Naive | O(n*m) | none | try every alignment |
| KMP | O(n + m) | O(m) | reuse the longest border |
| Rabin-Karp | O(n*m) | O(m) | compare window hashes first |
| Boyer-Moore (bad character) | O(n*m) | O(m) | compare right to left and jump |
| Z-algorithm | O(n + m) | O(n + m) | prefix matches over pattern + `$` + text |

## Common Pitfalls

- Off-by-one: the last start is `n - m`.
- Not checking `m > n` first; with unsigned sizes `n - m` wraps around.
- Skipping `m` positions after a match, which misses overlapping matches.
- Assuming O(n): a long run of equal characters makes it quadratic.
- Python indices are code points; C++ and Go indices are bytes.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `naive_pattern_search.py` | `naive_pattern_search`, `_count`, `_first` |
| C++ | [C++/](C++/) | `naive_pattern_search.cpp` | `naivePatternSearch`, `Count`, `First` |
| Go | [Go/](Go/) | `main.go` | `NaivePatternSearch`, `Count`, `First` |

The `count` and `first` helpers run the full search and then take its length or its first element.

## Practice Problems

- [Find the Index of the First Occurrence in a String (LeetCode 28)](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/)
- [Rotate String (LeetCode 796)](https://leetcode.com/problems/rotate-string/)
- [String Matching in an Array (LeetCode 1408)](https://leetcode.com/problems/string-matching-in-an-array/)
- [Repeated String Match (LeetCode 686)](https://leetcode.com/problems/repeated-string-match/)

## Related

- [KMP Algorithm](../KMP_Algorithm/)
- [Rabin-Karp Algorithm](../Rabin_Karp_Algorithm/)
- [Boyer-Moore Algorithm](../Boyer_Moore_Algorithm/)
- [Pattern Matching (all four algorithms)](../)
