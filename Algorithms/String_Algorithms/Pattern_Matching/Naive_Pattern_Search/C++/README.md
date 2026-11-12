# Naive Pattern Search -- C++ Implementation

Brute-force search for every occurrence of a pattern.

## Files

| File | Contents |
|------|----------|
| `naive_pattern_search.cpp` | `naivePatternSearch`, `naivePatternSearchCount`, `naivePatternSearchFirst` (a demo `main` is left commented out) |
| `naive_pattern_search_test.cpp` | `assert`-based tests: matches, multiple and overlapping occurrences, no match, empty inputs, a pattern longer than the text, pattern equals text, single character, count, first, a worst-case input |

## API

- `std::vector<int> naivePatternSearch(const std::string& text, const std::string& pattern)`: all start indices, in increasing order; empty for an empty pattern, an empty text, or a pattern longer than the text. O(n*m).
- `int naivePatternSearchCount(...)`: the number of occurrences.
- `int naivePatternSearchFirst(...)`: the first index or `-1`.

## C++-Specific Notes

- Indices are byte offsets.
- The inner loop compares characters directly; no `substr` copy is made.
- Sizes are `int`; the code checks `pattern.length() > text.length()` before computing `n - m`.
- `std::string::find` is the standard-library equivalent.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD naive_pattern_search_test.cpp -o naive_test
./naive_test
```

## Key Takeaways

1. Check `m > n` before looping.
2. Advance by one after a match to keep overlapping matches.
