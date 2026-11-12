# String Pattern Matching

Pattern matching finds every position where a pattern `P` (length `m`) occurs inside a text `T` (length `n`). The naive scan costs O(n*m); KMP guarantees O(n + m), and Rabin-Karp and Boyer-Moore are fast on typical text. This topic is the overview and puts the algorithms side by side; each has its own topic with the full analysis.

## Intuition

Slide the pattern along the text and ask at each alignment: does it match here? The naive method forgets everything after a mismatch. The better algorithms reuse what they learned:

- **KMP** remembers how much of the pattern is still matched (a border of the matched part), so the text pointer never moves back.
- **Rabin-Karp** compares a cheap hash of each window first and looks at characters only when the hashes agree.
- **Boyer-Moore** compares from the right end of the pattern, so a mismatching character tells it how far it can jump.

All four report every start index in increasing order, including overlapping matches (`aa` in `aaaa` gives `[0, 1, 2]`).

## Visual

KMP on text `abababaca` with pattern `ababaca`. The LPS table is `[0, 0, 1, 2, 3, 0, 1]`.

```text
index:   0 1 2 3 4 5 6 7 8
text:    a b a b a b a c a
pattern: a b a b a c a          match 5 chars, then c != b at i = 5
                   ^ mismatch   j = lps[4] = 3: keep "aba", do not move i
pattern:     a b a b a c a      compare text[5] = b with pattern[3] = b ...
                             ^  j reaches 7: match at index 2
```

## How It Works

1. **Naive.** For each `i` in `0..n-m`, compare `T[i..i+m-1]` with `P`.
2. **KMP.** Build `lps` (`lps[i]` is the length of the longest proper prefix of `P[0..i]` that is also a suffix). Scan the text with indices `i` (text) and `j` (pattern). On a match advance both; on a mismatch with `j > 0` set `j = lps[j-1]` and keep `i`; with `j == 0` advance `i`. After a full match report `i - j` and set `j = lps[j-1]`.
3. **Rabin-Karp.** Hash `P` and the first window with base 256 modulo a prime `q` (default 101). Slide with `hash = (256 * (hash - T[i] * 256^(m-1)) + T[i+m]) mod q`. Verify equal hashes character by character.
4. **Boyer-Moore (bad character only).** Store the last index of every pattern character. At each alignment compare from the right; on a mismatch at pattern index `j` against text character `c`, shift by `max(1, j - last[c])` (`last[c] = -1` when `c` is not in the pattern). After a match shift by 1.

An empty pattern occurs at every position `0..n` in all four functions; a pattern longer than the text gives `[]`.

## Step-by-Step Trace

KMP, pattern `ababaca`, text `abababaca`:

| Step | i | j | Compare | Action |
|------|---|---|---------|--------|
| 1-5 | 0..4 | 0..4 | `ababa` equals `ababa` | advance both, `j = 5` |
| 6 | 5 | 5 | `b` vs `c` | mismatch, `j = lps[4] = 3` |
| 7 | 5 | 3 | `b` vs `b` | advance, `j = 4` |
| 8 | 6 | 4 | `a` vs `a` | advance, `j = 5` |
| 9 | 7 | 5 | `c` vs `c` | advance, `j = 6` |
| 10 | 8 | 6 | `a` vs `a` | advance, `j = 7 = m`: report `8 - 7 + 1 = 2` |

Result: `[2]`, the same as `naive_search`.

## Complexity

| Algorithm | Preprocessing | Best | Worst | Extra space |
|-----------|---------------|------|-------|-------------|
| Naive | none | O(n) | O(n*m) | O(1) |
| KMP | O(m) | O(n + m) | O(n + m) | O(m) |
| Rabin-Karp | O(m) | O(n + m) | O(n*m) | O(1) |
| Boyer-Moore (bad character) | O(m + sigma) | O(n/m) | O(n*m) | O(sigma) |

KMP is linear because `i` never decreases and `j` can fall back only as often as it has advanced, so the loop runs at most 2n times. Rabin-Karp is quadratic only when many windows share the pattern's hash; with `q = 101` a spurious hit occurs about once per 101 windows, and each is rejected by the comparison, so results stay correct. Boyer-Moore with the bad-character rule alone can still degrade to O(n*m); the good-suffix rule, which is not implemented here, is needed for a linear bound.

## When to Use

- Use the **standard library** (`str.find`, `std::string::find`, `strings.Index`) in real code.
- Use **naive** for short patterns and small texts.
- Use **KMP** when you need a guaranteed bound or must read the text once, in order.
- Use **Rabin-Karp** for many patterns of equal length.
- Use **Boyer-Moore** for long patterns over a large alphabet.
- For a dictionary of many different patterns use Aho-Corasick.

## Pattern Matching vs. Alternatives

| Need | Better tool |
|------|-------------|
| Many patterns at once | Aho-Corasick |
| Many queries on one fixed text | Suffix array or suffix tree (preprocess the text, not the pattern) |
| Prefix lookups in a dictionary | Trie |
| Approximate matches | Edit distance (dynamic programming) |
| Regular-expression semantics | A regex engine |

## Common Pitfalls

- Crashing on an empty pattern; all four functions return `[0..n]`.
- Hashing the first window of Rabin-Karp when `m > n`; check this first.
- Resetting the text pointer in KMP, which makes it quadratic.
- Stopping at the first match; overlapping matches are reported.
- Expecting equal offsets across languages on non-ASCII text: Python counts code points, C++ and Go count bytes.
- A tiny Rabin-Karp modulus: correct, but slow on adversarial input.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `pattern_matching.py` | All four algorithms; 7 tests |
| C++ | [C++/](C++/) | `pattern_matching.cpp` | Naive and KMP only |
| Go | [Go/](Go/) | `main.go` | Naive and KMP only; package `pattern` |

## Practice Problems

- [LeetCode 28: Find the Index of the First Occurrence in a String](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/)
- [LeetCode 459: Repeated Substring Pattern](https://leetcode.com/problems/repeated-substring-pattern/)
- [LeetCode 686: Repeated String Match](https://leetcode.com/problems/repeated-string-match/)
- [LeetCode 1392: Longest Happy Prefix](https://leetcode.com/problems/longest-happy-prefix/)
- [LeetCode 214: Shortest Palindrome](https://leetcode.com/problems/shortest-palindrome/)

## Related

- [Naive Pattern Search](../../../../Algorithms/String_Algorithms/Pattern_Matching/Naive%20Pattern%20Search/)
- [KMP Algorithm](../../../../Algorithms/String_Algorithms/Pattern_Matching/KMP%20Algorithm/)
- [Rabin-Karp Algorithm](../../../../Algorithms/String_Algorithms/Pattern_Matching/Rabin-Karp%20Algorithm/)
- [Boyer-Moore Algorithm](../../../../Algorithms/String_Algorithms/Pattern_Matching/Boyer-Moore%20Algorithm/)
- [Z-Algorithm](../../../../Algorithms/String_Algorithms/Advanced_String/Z-Algorithm/)
- [Aho-Corasick](../../../../Algorithms/String_Algorithms/Advanced_String/Aho-Corasick/)
- [String Manipulation](../String%20Manipulation/)
