# Suffix Array -- C++ Implementation

Suffix array construction by sorting, with binary-search pattern lookup.

## Files

| File | Contents |
|------|----------|
| `suffix_array.cpp` | `buildSuffixArray`, `searchPattern`, `getSuffixes`, `longestCommonPrefix`, the `SuffixArray` class |
| `suffix_array_test.cpp` | `assert`-based tests: all indices present, search counts and indices, no match, a single character, an empty text, the exact order of `banana`, exact results, the empty pattern, overlaps, sorted suffixes, LCP of two suffixes, the class, a random comparison with brute force |

## API

- `std::vector<int> buildSuffixArray(const std::string& s)`: the start indices of the suffixes in sorted order.
- `std::vector<int> searchPattern(const std::vector<int>& suffixArray, const std::string& text, const std::string& pattern)`: all start indices, in increasing order. An empty pattern returns `0..n-1` on a non-empty text.

- `std::vector<std::string> getSuffixes(suffixArray, text)`: the suffixes in sorted order.
- `int longestCommonPrefix(const std::string& text, int i, int j)`: common prefix length of the suffixes starting at `i` and `j`, O(n).
- `SuffixArray(text)`: members `text`, `suffixArray`; methods `search`, `getSuffixes`, `longestCommonPrefix`.

## C++-Specific Notes

- Construction stores `std::pair<std::string, int>` for every suffix (`substr`): O(n^2) memory, O(n^2 log n) worst-case time.
- Search uses `text.compare(idx, m, pattern)`, which looks at most `m` characters and copies nothing: O(m log n) per query, plus O(k log k) to sort the `k` matches.
- Indices are byte offsets.
- `int` indices limit the text to about 2 billion bytes, far above what the quadratic build can handle.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD suffix_array_test.cpp -o suffix_array_test
./suffix_array_test
```

## Key Takeaways

1. Suffixes with a common prefix are adjacent after sorting.
2. Copying suffixes is simple but quadratic in memory.
