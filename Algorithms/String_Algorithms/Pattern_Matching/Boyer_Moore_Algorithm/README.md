# Boyer-Moore Algorithm

Boyer-Moore searches for a pattern by comparing it from right to left and, on a mismatch, using the mismatching text character to jump ahead, often by the whole pattern length. It is sublinear on typical text (best case O(n/m)). This repository implements the **bad-character rule only**; the good-suffix rule of the full algorithm is not implemented.

## Intuition

Slide the pattern along the text and look at the last character of the window first. If that text character does not occur in the pattern at all, no alignment covering it can match, so the pattern can jump past it. If it does occur, line up its **rightmost** occurrence in the pattern with it; every closer alignment would leave a mismatch under that character.

## Visual

Pattern `EXAMPLE`, text `HERE IS A SIMPLE EXAMPLE`. Table: `E:6 X:1 A:2 M:3 P:4 L:5`.

```text
HERE IS A SIMPLE EXAMPLE
EXAMPLE                     s = 0: S vs E, S absent  -> shift 7
       EXAMPLE              s = 7: P vs E, last[P]=4 -> shift 2
         EXAMPLE            s = 9: I vs A, I absent  -> shift 3
            EXAMPLE         s = 12: X vs E, last[X]=1 -> shift 5
                 EXAMPLE    s = 17: all 7 match      -> report 17
```

## How It Works

1. Build `last[c]`, the index of the rightmost occurrence of each pattern character (absent means `-1`).
2. At alignment `s`, compare from the right: `j = m - 1`, then decrease `j` while `pattern[j] == text[s + j]`.
3. On a mismatch at `j`, shift by `max(1, j - last[text[s + j]])`.
4. On a full match (`j < 0`), report `s`. If `s + m < n`, shift by `m - last[text[s + m]]`; otherwise shift by 1.

An empty pattern, an empty text, or a pattern longer than the text returns `[]` in all three languages, like the naive, KMP and Rabin-Karp searches.

## Step-by-Step Trace

| s | Mismatch at j | Text char | last | Shift | Next s |
|---|---------------|-----------|------|-------|--------|
| 0 | 6 | `S` | -1 | 7 | 7 |
| 7 | 6 | `P` | 4 | 2 | 9 |
| 9 | 2 | `I` | -1 | 3 | 12 |
| 12 | 6 | `X` | 1 | 5 | 17 |
| 17 | match | - | - | - | end of text |

Result `[17]`. Five of the 18 possible alignments were tried, with 15 character comparisons (the naive scan makes 27 on this input).

## Complexity

| Case | Time | When |
|------|------|------|
| Best | O(n/m) | the last character of every window is absent from the pattern |
| Average | O(n) | natural text over a large alphabet; shifts are long |
| Worst | O(n*m) | the shift is 1 each time, e.g. pattern `baaa` in `aaaa...a` |

Preprocessing is O(m) time and O(sigma) space (one entry per distinct pattern character). The full algorithm adds the good-suffix rule, which with Galil's refinement gives O(n + m) in the worst case; it is not implemented here.

## When to Use

- Long patterns over a large alphabet (natural-language text), where most characters never occur in the pattern.
- Not for small alphabets (binary, DNA), short patterns, or when you need a worst-case guarantee (use KMP).

## Boyer-Moore vs. Alternatives

| Algorithm | Best | Worst | Extra space |
|-----------|------|-------|-------------|
| Boyer-Moore (bad character) | O(n/m) | O(n*m) | O(sigma) |
| Naive | O(n) | O(n*m) | O(1) |
| KMP | O(n + m) | O(n + m) | O(m) |
| Rabin-Karp | O(n + m) | O(n*m) | O(1) |

## Common Pitfalls

- Storing the leftmost occurrence instead of the rightmost.
- Forgetting `max(1, ...)`: the bad-character shift can be zero or negative.
- In C++, using `unordered_map::operator[]` for an absent character: it inserts the key with value 0 and shrinks the shift. The code uses `find`.
- Shifting by `m` after a match, which skips overlapping matches.
- Expecting linear time without the good-suffix rule.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `boyer_moore.py` | Also `boyer_moore_search_count` and `boyer_moore_search_first` |
| C++ | [C++/](C++/) | `boyer_moore.cpp` | `unordered_map` table, `find`-based lookup |
| Go | [Go/](Go/) | `main.go` | `map[byte]int` table |

## Practice Problems

- [Find the Index of the First Occurrence in a String (LeetCode 28)](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/)
- [Repeated String Match (LeetCode 686)](https://leetcode.com/problems/repeated-string-match/)
- [String Matching (Kattis stringmatching)](https://open.kattis.com/problems/stringmatching)
- [String Matching (CSES 1753)](https://cses.fi/problemset/task/1753)

## Related

- [Naive Pattern Search](../Naive_Pattern_Search/)
- [KMP Algorithm](../KMP_Algorithm/)
- [Rabin-Karp Algorithm](../Rabin_Karp_Algorithm/)
- [Z-Algorithm](../../Advanced_String/Z_Algorithm/)
- [Pattern Matching (all four algorithms)](../)
