# Suffix Array

A suffix array is the list of start positions of all suffixes of a string, in sorted order. All suffixes that begin with a pattern sit next to each other, so binary search finds every occurrence of the pattern in O(m log n) comparisons. It is a compact, simple alternative to a suffix tree.

## Intuition

Write down every suffix of `banana` and sort them like words in a dictionary. Any word that starts with `ana` must lie in one block, because nothing can sort between two words with the same prefix unless it shares the prefix. Searching for a pattern is therefore a dictionary lookup: find where the block starts and where it ends.

The array stores only the start index of each suffix, not the suffix itself, and keeps the text alongside.

## Visual

```text
text = b a n a n a        index 0..5

rank  SA   suffix    LCP with the rank above
  0    5   a          -
  1    3   ana        1
  2    1   anana      3
  3    0   banana     0
  4    4   na         0
  5    2   nana       2

SA = [5, 3, 1, 0, 4, 2]
search("ana") -> ranks 1..2 -> SA values 3 and 1 -> [1, 3]
```

## Operations

| Operation | Description | Time |
|-----------|-------------|------|
| Build | sort all suffixes, keep their start indices | O(n^2 log n) in this code (see Complexity) |
| `search(pattern)` | all start indices of the pattern, in increasing order | O(m log n) ideal |
| `get_suffixes()` | the suffixes in sorted order (Python only) | O(n^2) |
| `longest_common_prefix(i, j)` | common prefix length of the suffixes starting at `i` and `j` (Python only) | O(n) |

`search` runs two binary searches over the ranks: one for the first suffix that starts with the pattern, one for the last. Every rank in between is an occurrence. The start indices are then sorted so that the result is in text order. An empty pattern is a prefix of every suffix, so on a non-empty text it returns `0..n-1`; on an empty text it returns `[]`.

## Step-by-Step Trace

`search("ana")` on `banana`, `SA = [5, 3, 1, 0, 4, 2]`:

| Phase | Range | mid | Suffix at mid | Decision |
|-------|-------|-----|---------------|----------|
| first | 0..5 | 2 | `anana` | starts with `ana`: first = 2, go left |
| first | 0..1 | 0 | `a` | smaller than `ana`: go right |
| first | 1..1 | 1 | `ana` | starts with `ana`: first = 1, go left |
| last | 1..5 | 3 | `banana` | no match: go left |
| last | 1..2 | 1 | `ana` | match: last = 1, go right |
| last | 2..2 | 2 | `anana` | match: last = 2, go right |

Ranks 1..2 hold `SA = 3` and `SA = 1`; sorted, the answer is `[1, 3]`.

## Complexity

| Quantity | This code | Textbook |
|----------|-----------|----------|
| Build time | O(n^2 log n) worst case | O(n log n) with prefix doubling, O(n) with SA-IS |
| Space | O(n^2) in Python and C++ (every suffix is copied); O(n) in Go (string slices share memory) | O(n) |
| Search | O(m log n) in Go; O(n log n) in Python and C++ (each probe copies a suffix) | O(m log n) |

Sorting compares suffixes, which can share up to `n` characters, so one comparison is O(n). On `aaaa...a` with n = 8000 the Python copies alone took about 33 MB in the audit measurement. The search is logarithmic because every probe halves the range of ranks.

## When to Use

- One fixed text and many pattern queries.
- Repeat questions (longest repeated substring, distinct substrings) once you add an LCP array.
- Memory matters more than the `log n` search factor.

Do not use this code on large inputs: build the array with prefix doubling or SA-IS, or use the standard library. Do not use a suffix array if the text changes often.

## Suffix Array vs. Suffix Tree

| | Suffix array | Suffix tree |
|--|--------------|-------------|
| Memory | n integers (plus the text) | many nodes |
| Pattern search | O(m log n) | O(m) |
| Implementation | a sort and two binary searches | much longer |
| Repeat queries | need an LCP array | read from the tree |

## Common Pitfalls

- Testing "suffix equals pattern" instead of "suffix starts with pattern".
- Forgetting to sort the result: the matching block is in suffix order, not text order.
- Assuming the build is O(n log n); here it is not.
- Mixing offsets: Python indices are code points, C++ and Go indices are bytes.
- Treating the empty text and empty pattern the same: an empty text matches nothing.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `suffix_array.py` | `SuffixArray` with `search`, `get_suffixes`, `longest_common_prefix` |
| C++ | [C++/](C++/) | `suffix_array.cpp` | `SuffixArray` with `search` |
| Go | [Go/](Go/) | `main.go` | `NewSuffixArray` and `Search`; the only version with a copy-free search |

## Practice Problems

- [LeetCode 28: Find the Index of the First Occurrence in a String](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/) (as a warm-up for searching)
- [LeetCode 1044: Longest Duplicate Substring](https://leetcode.com/problems/longest-duplicate-substring/)
- [LeetCode 718: Maximum Length of Repeated Subarray](https://leetcode.com/problems/maximum-length-of-repeated-subarray/)
- [CSES: String Matching](https://cses.fi/problemset/task/1753)
- [CSES: Distinct Substrings](https://cses.fi/problemset/task/2105)

## Related

- [Suffix Tree](../Suffix%20Tree/)
- [Suffix Array (algorithm view: construction and applications)](../../../../Algorithms/String_Algorithms/Advanced_String/Suffix%20Array/)
- [Trie](../Trie/)
- [Longest Common Substring](../../../../Algorithms/String_Algorithms/Advanced_String/Longest%20Common%20Substring/)
- [String Pattern Matching](../../../Linear/String/Pattern%20Matching/)
