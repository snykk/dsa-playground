# Advanced String Algorithms

These five topics go beyond finding one pattern in one text. They search many patterns at once, index every suffix of a string, and answer questions about prefixes, palindromes and shared substrings, each with a different structure.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Z-Algorithm](Z_Algorithm/) | For every position, how long a prefix match starts there. One array in O(n) that also finds a pattern. | Intermediate |
| 2 | [Aho-Corasick](Aho_Corasick/) | A trie of all patterns plus failure links, so one pass over the text finds every pattern. | Advanced |
| 3 | [Suffix Array](Suffix_Array/) | All suffixes in sorted order. Every occurrence of a pattern sits in one block that binary search finds. | Advanced |
| 4 | [Manacher's Algorithm](Longest_Palindromic_Substring_Manachers/) | The palindrome radius at every center in O(n), reusing the mirror image of what is already known. | Advanced |
| 5 | [Longest Common Substring](Longest_Common_Substring/) | A dynamic-programming table of matching-run lengths between two strings. | Intermediate |

Every topic returns exact answers, and every search reports overlapping matches.

## How They Compare

| Topic | Build | Search or query | Space |
|-------|-------|-----------------|-------|
| Z-algorithm | O(k) for a string of length k | O(n + m) | O(n + m) |
| Aho-Corasick | O(m) | O(n + z) | O(m) |
| Suffix array | O(n^2 log n) here | O(m log n + k log k) | O(n^2) in Python and C++ here, O(n) ideal |
| Manacher | none | O(n) | O(n) |
| Longest common substring | none | O(m*n) | O(m*n) here, two rows would be enough |

`n` is the text length, `m` the pattern length (the total pattern length for Aho-Corasick) and `z` the number of reported matches, which can exceed `n` when patterns overlap; `k` is the number of occurrences a suffix-array search sorts before returning them. The suffix array build is slow here because it sorts copies of the suffixes. Prefix doubling brings it to O(n log^2 n), but it is not implemented in this repository.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| One pattern, linear time, a simple array | Z-algorithm | one array in O(n) and no failure table |
| A dictionary of patterns of any lengths | Aho-Corasick | one pass over the text finds every pattern |
| Many different queries against one fixed text | Suffix array | pay for the build once, then each query finds its block in O(m log n) |
| Longest palindromic substring | Manacher | O(n), against O(n^2) for expanding around every center |
| Longest block shared by two strings | Longest common substring | a clear table; a suffix array can do it in near-linear time |
| The text changes between queries | Aho-Corasick or a plain search | a suffix array is static and must be rebuilt on every change |

## Common Pitfalls

- Testing `Z == m` in a Z-search: the search runs on `pattern + "$" + text`, and if `$` also occurs in the input a Z-value can exceed `m`, so the test must be `Z >= m`.
- Aho-Corasick returns the index where each match ends, not where it starts.
- Manacher and the longest common substring return one longest result, not all of them.
- A suffix array is static, so each edit to the text means a rebuild.
- Both the palindrome and the common-substring problems need contiguous characters, so they are substring problems, not subsequence problems.

## Related

- [Pattern Matching Algorithms](../Pattern_Matching/): read first.
- [Knuth-Morris-Pratt (KMP) Algorithm](../Pattern_Matching/KMP_Algorithm/): the failure idea behind the Z-array and Aho-Corasick.
- [Trie](../../../Data_Structures/Non_Linear/Trees/Trie/): the structure Aho-Corasick adds failure links to.
- [Suffix Tree](../../../Data_Structures/Non_Linear/Trees/Suffix_Tree/): the tree counterpart of the suffix array.
- [Dynamic Programming](../../Dynamic_Programming/): the table method behind the longest common substring.
