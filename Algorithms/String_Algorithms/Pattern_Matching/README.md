# Pattern Matching Algorithms

Pattern matching finds every place a pattern occurs in a text. The four algorithms here all return the same answer and differ in one step, what to do after a mismatch: start over, filter by hash, reuse what matched, or skip ahead.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Naive Pattern Search](Naive_Pattern_Search/) | The baseline. Try every alignment, compare left to right, and forget everything on a mismatch. | Beginner |
| 2 | [Rabin-Karp Algorithm](Rabin_Karp_Algorithm/) | Filter first. A rolling hash rejects most windows in O(1); only hash hits are compared character by character. | Intermediate |
| 3 | [Knuth-Morris-Pratt (KMP) Algorithm](KMP_Algorithm/) | Reuse what matched. The LPS table says how far the pattern can move, so the text pointer never goes back. | Intermediate |
| 4 | [Boyer-Moore Algorithm](Boyer_Moore_Algorithm/) | Skip ahead. Compare right to left and jump by the mismatching character, often by a whole pattern length. | Intermediate |

All four keep the same contract in Python, C++ and Go: every start index in increasing order, overlapping matches included, and `[]` for an empty pattern, an empty text or a pattern longer than the text. Python indexes code points; C++ and Go index bytes.

## How They Compare

| Algorithm | Preprocessing | Best | Worst | Extra space | Worst-case input |
|-----------|---------------|------|-------|-------------|------------------|
| Naive | none | O(n) | O(n*m) | O(1) | `aa...ab` in `aaa...a` |
| Rabin-Karp | O(m) | O(n + m) | O(n*m) | O(1) | many hash hits |
| KMP | O(m) | O(n + m) | O(n + m) | O(m) | none |
| Boyer-Moore (bad character) | O(m) | O(n/m) | O(n*m) | O(sigma) | `baaa` in `aaa...a` |

`n` is the text length, `m` the pattern length and `sigma` the number of distinct pattern characters. Rabin-Karp's expected time is O(n + m); its hash hits come from real matches or from collisions, which the modulus of 101 used here makes common. Boyer-Moore here uses the bad-character rule only, so its worst case stays quadratic.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| A short pattern, or code that must stay simple | Naive | no setup, and on typical text most alignments fail after a character or two |
| A guaranteed bound, or a stream read once | KMP | O(n + m) on every input, and the text is read left to right without going back |
| Many patterns of the same length | Rabin-Karp | hash every pattern once, then look each window hash up in a set |
| A long pattern over a large alphabet, such as prose | Boyer-Moore | most alignments end after one or two comparisons, followed by a long jump |
| Many patterns of different lengths | [Aho-Corasick](../Advanced_String/Aho_Corasick/) | one pass over the text finds every pattern of the set |
| Many queries against one fixed text | [Suffix Array](../Advanced_String/Suffix_Array/) | build it once, then answer each query with binary search |
| Everyday code | the standard library | `str.find`, `std::string::find` and `strings.Index` are tuned and tested |

## Common Pitfalls

- Shifting by `m` after a match misses overlapping matches: all four searches report `aa` in `aaaa` at `[0, 1, 2]`.
- In KMP, only `j` falls back on a mismatch (to `lps[j - 1]`); moving the text pointer back makes the search quadratic again.
- A Rabin-Karp hash hit is only a candidate: different windows can share a hash, so the characters must be compared.
- Library searches treat an empty pattern differently: `'abc'.find('')`, `std::string::find` and `strings.Index` report index 0, while these searches return `[]`.

## Related

- [String Basics](../../../Data_Structures/Linear/String/String_Basics/): read first.
- [Advanced String Algorithms](../Advanced_String/): the Z-algorithm, Aho-Corasick, suffix arrays, Manacher's algorithm and the longest common substring.
- [Sliding Window](../../../Problem_Patterns/Sliding_Window/): the window that Rabin-Karp's rolling hash slides.
