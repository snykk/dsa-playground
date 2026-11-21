# Suffix Array (Construction and Search)

A suffix array lists the start indices of all suffixes of a string in sorted order. Suffixes that start with a pattern are contiguous, so two binary searches find every occurrence in O(m log n) comparisons. It is both the data structure (an array of `n` integers next to the text, a compact alternative to a [Suffix Tree](../../../../Data_Structures/Non_Linear/Trees/Suffix_Tree/)) and the algorithms around it: construction, search, LCP and applications.

## Intuition

Sort all suffixes of `banana` like dictionary words and keep only their start indices. Every word starting with `ana` sits in one block, because nothing can sort between two words with a common prefix unless it shares that prefix. Pattern search becomes a range lookup.

## Visual

```text
banana          rank  SA  suffix    LCP with the rank above
                  0    5  a         -
                  1    3  ana       1
                  2    1  anana     3
                  3    0  banana    0
                  4    4  na        0
                  5    2  nana      2

SA = [5, 3, 1, 0, 4, 2]       search("ana") -> ranks 1..2 -> [1, 3]
```

## Operations

| Operation | Description | Time |
|-----------|-------------|------|
| Build | sort all suffixes, keep their start indices | O(n^2 log n) in this code |
| `search(pattern)` | all start indices of the pattern, in increasing order | O(m log n + k log k) for k matches |
| `get_suffixes()` | the suffixes in sorted order | O(n^2) |
| `longest_common_prefix(i, j)` | common prefix length of the suffixes at `i` and `j` | O(n) |

## How It Works

1. **Construct (this repository).** Slice every suffix, sort the `(suffix, index)` pairs, keep the indices.
2. **Construct faster (not implemented here), prefix doubling.** Rank suffixes by their first character, then by pairs `(rank[i], rank[i + k])` for `k = 1, 2, 4, ...`, using `-1` past the end. After about `log2(n)` rounds all ranks differ and give the order. O(n log^2 n) with comparison sorts, O(n log n) with radix sort; SA-IS and DC3 reach O(n).
3. **Search.** Binary search for the first rank whose suffix starts with the pattern, then for the last; the indices between are the occurrences, returned sorted.
4. **LCP array (not implemented here).** `LCP[k]` is the common prefix length of the suffixes at ranks `k-1` and `k`; Kasai's algorithm computes it in O(n).

The empty pattern returns every index `0..n-1` on a non-empty text, and `[]` on an empty text.

## Step-by-Step Trace

Prefix doubling on `banana` (not part of the code in this folder):

| i | suffix | rank by 1 char | by 2 chars | by 4 chars |
|---|--------|----------------|------------|------------|
| 0 | `banana` | 1 | 2 | 3 |
| 1 | `anana` | 0 | 1 | 2 |
| 2 | `nana` | 2 | 3 | 5 |
| 3 | `ana` | 0 | 1 | 1 |
| 4 | `na` | 2 | 3 | 4 |
| 5 | `a` | 0 | 0 | 0 |

All ranks are now different, so the order is suffix 5, 3, 1, 0, 4, 2: `SA = [5, 3, 1, 0, 4, 2]`, the same as the sort in the code gives.

Binary search for `ana` in the repository's code:

| Phase | Range | mid | Suffix at mid | Decision |
|-------|-------|-----|---------------|----------|
| first | 0..5 | 2 | `anana` | starts with `ana`: first = 2, go left |
| first | 0..1 | 0 | `a` | smaller than `ana`: go right |
| first | 1..1 | 1 | `ana` | starts with `ana`: first = 1, go left |
| last | 1..5 | 3 | `banana` | no match: go left |
| last | 1..2 | 1 | `ana` | match: last = 1, go right |
| last | 2..2 | 2 | `anana` | match: last = 2, go right |

Ranks 1 and 2 hold `SA = 3` and `SA = 1`; sorted: `[1, 3]`.

## Complexity

| Step | This repository | Textbook |
|------|-----------------|----------|
| Build time | O(n^2 log n) worst case | O(n log n) doubling with radix sort; O(n) SA-IS |
| Build memory | O(n^2) in Python and C++ (suffixes are copied); O(n) in Go | O(n) |
| Search | O(m log n), plus O(k log k) to sort the k matches | O(m log n) |
| LCP of two suffixes | O(n) | O(1) with an LCP array and range minimum |
| LCP array | not implemented | O(n) with Kasai |

Worst input for the build: `aaaa...a`, where every comparison runs to the end of the shorter suffix.

## When to Use

- A fixed text and many pattern queries.
- Repeat questions (longest repeated substring, distinct substring count, longest common substring) once an LCP array is available.
- Not for one pattern (use KMP or Z), and not for a text that changes often.

## Suffix Array vs. Alternatives

| Structure | Build | Search | Memory |
|-----------|-------|--------|--------|
| Suffix array | O(n log n) or better | O(m log n) | n integers |
| Suffix tree | O(n) | O(m) | many nodes |
| KMP or Z per query | none | O(n + m) each | O(m) |

## Common Pitfalls

- Comparing for equality instead of "starts with the pattern".
- Quoting O(n log n) for a build that sorts copied strings.
- Forgetting to sort the result: the block is in suffix order.
- Using a separator that occurs in the text when concatenating strings.
- Expecting index `n` for the empty pattern: there is no empty suffix in the array.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `suffix_array.py` | `build_suffix_array`, `search_pattern`, `get_suffixes`, `longest_common_prefix`, class `SuffixArray` |
| C++ | [C++/](C++/) | `suffix_array.cpp` | `buildSuffixArray`, `searchPattern`, `getSuffixes`, `longestCommonPrefix`, class `SuffixArray` |
| Go | [Go/](Go/) | `main.go` | `BuildSuffixArray`, `SearchPattern`, `GetSuffixes`, `LongestCommonPrefix`, type `SuffixArray`; slices, no copying |

## Practice Problems

- [LeetCode 1044: Longest Duplicate Substring](https://leetcode.com/problems/longest-duplicate-substring/)
- [LeetCode 718: Maximum Length of Repeated Subarray](https://leetcode.com/problems/maximum-length-of-repeated-subarray/)
- [CSES: String Matching](https://cses.fi/problemset/task/1753)
- [CSES: Distinct Substrings](https://cses.fi/problemset/task/2105)

## Related

- [Suffix Tree](../../../../Data_Structures/Non_Linear/Trees/Suffix_Tree/)
- [Trie](../../../../Data_Structures/Non_Linear/Trees/Trie/)
- [Longest Common Substring](../Longest_Common_Substring/)
- [Z-Algorithm](../Z_Algorithm/)
- [Pattern Matching](../../Pattern_Matching/)
