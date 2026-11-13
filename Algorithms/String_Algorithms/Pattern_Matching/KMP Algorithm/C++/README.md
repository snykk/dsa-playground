# KMP Algorithm -- C++ Implementation

Knuth-Morris-Pratt search with an LPS table.

## Files

| File | Contents |
|------|----------|
| `kmp.cpp` | `buildLPS`, `kmpSearch`, `kmpSearchCount`, `kmpSearchFirst` (a demo `main` is left commented out) |
| `kmp_test.cpp` | `assert`-based tests: basic and multiple matches, no match, LPS tables, count, first, empty pattern and text, overlaps and edge cases |

## API

- `std::vector<int> buildLPS(const std::string& pattern)`: the LPS table. O(m).
- `std::vector<int> kmpSearch(const std::string& text, const std::string& pattern)`: all start indices, in increasing order; empty for an empty pattern, an empty text, or a pattern longer than the text. O(n + m).
- `int kmpSearchCount(...)`: the number of occurrences.
- `int kmpSearchFirst(...)`: the first index or `-1`.

## C++-Specific Notes

- Indices are byte offsets.
- The table is a `std::vector<int>`; `int` sizes are fine for any text that fits comfortably in memory.
- `std::string::find` and `std::boyer_moore_searcher` are the standard-library alternatives.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD kmp_test.cpp -o kmp_test
./kmp_test
```

## Key Takeaways

1. The text index never moves back, so the search is linear.
2. Reset `j` to `lps[j - 1]` after a match to find overlaps.
