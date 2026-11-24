# String Algorithms

String algorithms search and analyse sequences of characters. Pattern Matching finds one pattern in a text. Advanced String adds many patterns at once, an index of every suffix, and questions about palindromes and shared substrings.

## Topics

Read them in this order.

| # | Section | What it adds | Level |
|---|---------|--------------|-------|
| 1 | [Pattern Matching Algorithms](Pattern_Matching/) | Find every occurrence of one pattern in a text. Four searches that differ in what they do after a mismatch. | 4 topics |
| 2 | [Advanced String Algorithms](Advanced_String/) | Many patterns at once, suffix arrays, the Z-array, substring hashes, palindromes and common substrings. | 6 topics |

Pattern Matching is the foundation. KMP's failure idea reappears in the Z-array and in the failure links of Aho-Corasick, and the suffix array is what you build when you ask the same question many times against one text.

## How They Compare

| Sub-area | Topics | Question it answers | Typical cost |
|----------|--------|---------------------|--------------|
| Pattern Matching | Naive, Rabin-Karp, KMP, Boyer-Moore | where does one pattern occur in one text? | O(n + m) to O(n*m) |
| Advanced String | Z-algorithm, Aho-Corasick, Suffix Array, Manacher, Longest Common Substring | many patterns, an index of all suffixes, palindromes, shared substrings | O(n) to O(n^2 log n) |

`n` is the text length and `m` the pattern length. Costs depend on the topic; each sub-area README has a full table.

## Where to Start

1. Start with the naive search. It is the baseline every other algorithm improves on, and it needs only the string basics.
2. Read KMP, then the other searches. KMP's table of borders is the idea most later algorithms borrow. Rabin-Karp and Boyer-Moore are independent of each other.
3. Move to the Z-algorithm. It gives the same linear bound as KMP from a different array.
4. Choose by problem. Aho-Corasick for a dictionary of patterns, the suffix array for many queries against one text, Manacher for palindromes, and the dynamic-programming table for the longest common substring.

| Situation | Go to | Why |
|-----------|-------|-----|
| One pattern, one text | [Pattern Matching](Pattern_Matching/) | KMP gives a guaranteed O(n + m); Boyer-Moore is usually fastest on prose |
| A dictionary of patterns | [Aho-Corasick](Advanced_String/Aho_Corasick/) | one pass over the text finds every pattern |
| Many queries against a fixed text | [Suffix Array](Advanced_String/Suffix_Array/) | build once, then each query is a binary search |
| Palindromes | [Manacher's Algorithm](Advanced_String/Longest_Palindromic_Substring_Manachers/) | O(n) for the longest palindromic substring |
| What two strings share | [Longest Common Substring](Advanced_String/Longest_Common_Substring/) | a table of matching-run lengths |

## Common Pitfalls

- Reaching for an advanced structure too early: for one search on a short text, the library `find` function or the naive search is enough.
- Mixing up substring and subsequence: a substring is contiguous, and the longest common substring and the longest common subsequence are different problems.
- Python indexes code points, while C++ and Go index bytes, so offsets differ on non-ASCII text.
- Testing `Z == m` in a Z-search: if the separator also occurs in the input, a Z-value can exceed `m`, so the test must be `Z >= m`.

## Related

- [String Basics](../../Data_Structures/Linear/String/String_Basics/): read first.
- [Trie](../../Data_Structures/Non_Linear/Trees/Trie/): the structure Aho-Corasick adds failure links to.
- [Suffix Tree](../../Data_Structures/Non_Linear/Trees/Suffix_Tree/): the tree counterpart of the suffix array.
- [Dynamic Programming](../Dynamic_Programming/): the table method behind the longest common substring.
