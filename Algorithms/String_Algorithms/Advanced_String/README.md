# Advanced String Algorithms

These six topics go beyond finding one pattern in one text. They search many patterns at once, index every suffix of a string, compare any two substrings through their hashes, and answer questions about prefixes, palindromes and shared substrings, each with a different structure.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Z-Algorithm](Z_Algorithm/) | For every position, how long a prefix match starts there. One array in O(n) that also finds a pattern. | Intermediate |
| 2 | [String Hashing](String_Hashing/) | Prefix hashes in O(n), then the hash of any substring in O(1): equality, the common prefix of two suffixes and their order by binary search, distinct substrings. | Intermediate |
| 3 | [Aho-Corasick](Aho_Corasick/) | A trie of all patterns plus failure links, so one pass over the text finds every pattern. | Advanced |
| 4 | [Suffix Array](Suffix_Array/) | All suffixes in sorted order. Every occurrence of a pattern sits in one block that binary search finds. | Advanced |
| 5 | [Manacher's Algorithm](Longest_Palindromic_Substring_Manachers/) | The palindrome radius at every center in O(n), reusing the mirror image of what is already known. | Advanced |
| 6 | [Longest Common Substring](Longest_Common_Substring/) | A dynamic-programming table of matching-run lengths between two strings. | Intermediate |

Every topic but string hashing returns exact answers; a hash can collide, so its answers are right with high probability (two moduli here). Every search reports overlapping matches.

## How They Compare

| Topic | Build | Search or query | Space |
|-------|-------|-----------------|-------|
| Z-algorithm | O(k) for a string of length k | O(n + m) | O(n + m) |
| String hashing | O(n) | O(1) per substring hash, O(log n) per common prefix or comparison | O(n) |
| Aho-Corasick | O(m) | O(n + z) | O(m) |
| Suffix array | O(n^2 log n) here | O(m log n + k log k) | O(n^2) in Python and C++ here, O(n) ideal |
| Manacher | none | O(n) | O(n) |
| Longest common substring | none | O(m*n) | O(m*n) here, two rows would be enough |

`n` is the text length, `m` the pattern length (the total pattern length for Aho-Corasick) and `z` the number of reported matches, which can exceed `n` when patterns overlap; `k` is the number of occurrences a suffix-array search sorts before returning them. The suffix array build is slow here because it sorts copies of the suffixes. Prefix doubling brings it to O(n log^2 n), but it is not implemented in this repository.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| One pattern, linear time, a simple array | Z-algorithm | one array in O(n) and no failure table |
| Many equality, common-prefix or order questions about substrings of one string | String hashing | O(1) or O(log n) each after O(n), at a tiny risk of a collision |
| A dictionary of patterns of any lengths | Aho-Corasick | one pass over the text finds every pattern |
| Many different queries against one fixed text | Suffix array | pay for the build once, then each query finds its block in O(m log n) |
| Longest palindromic substring | Manacher | O(n), against O(n^2) for expanding around every center |
| Longest block shared by two strings | Longest common substring | a clear table; a suffix array can do it in near-linear time |
| The text changes between queries | Aho-Corasick or a plain search | a suffix array is static and must be rebuilt on every change |

## Common Pitfalls

- Testing `Z == m` in a Z-search: the search runs on `pattern + "$" + text`, and if `$` also occurs in the input a Z-value can exceed `m`, so the test must be `Z >= m`.
- Aho-Corasick returns the index where each match ends, not where it starts.
- Trusting one hash modulus near 10^9 for 10^5 substrings: a collision is almost certain. String hashing keeps two moduli.
- Manacher and the longest common substring return one longest result, not all of them, and both need contiguous characters: they are substring problems, not subsequence problems.
- A suffix array is static, so each edit to the text means a rebuild.

## Related

- [Pattern Matching Algorithms](../Pattern_Matching/): read first.
- [Rabin-Karp Algorithm](../Pattern_Matching/Rabin_Karp_Algorithm/): the rolling hash that String Hashing keeps for every prefix.
- [Knuth-Morris-Pratt (KMP) Algorithm](../Pattern_Matching/KMP_Algorithm/): the failure idea behind the Z-array and Aho-Corasick.
- [Trie](../../../Data_Structures/Non_Linear/Trees/Trie/): the structure Aho-Corasick adds failure links to.
- [Suffix Tree](../../../Data_Structures/Non_Linear/Trees/Suffix_Tree/): the tree counterpart of the suffix array.
- [Dynamic Programming](../../Dynamic_Programming/): the table method behind the longest common substring.
