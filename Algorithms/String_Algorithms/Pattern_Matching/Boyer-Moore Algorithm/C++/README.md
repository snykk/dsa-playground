# Boyer-Moore Algorithm -- C++ Implementation

Boyer-Moore search with the bad-character rule.

## Files

| File | Contents |
|------|----------|
| `boyer_moore.cpp` | `buildBadCharTable`, `lastOccurrence`, `boyerMooreSearch` |
| `boyer_moore_test.cpp` | `assert`-based tests: basic and multiple matches, no match, empty pattern, empty text, a pattern longer than the text, the table, the absent-character lookup, the textbook example and overlaps |

## API

- `std::unordered_map<char, int> buildBadCharTable(const std::string& pattern)`: each byte to its rightmost index.
- `int lastOccurrence(const std::unordered_map<char, int>& table, char c)`: the index of `c`, or `-1`. It uses `find`, so it never inserts.
- `std::vector<int> boyerMooreSearch(const std::string& text, const std::string& pattern)`: all start indices, in increasing order; empty for an empty pattern, an empty text, or a pattern longer than the text.

## C++-Specific Notes

- Indices are byte offsets.
- A lookup with `operator[]` would insert an absent character with value 0, shrinking the shift after a match from `m + 1` to `m`; `lastOccurrence` avoids that.
- Only the bad-character rule is implemented; `std::boyer_moore_searcher` in `<functional>` is the full algorithm.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD boyer_moore_test.cpp -o boyer_moore_test
./boyer_moore_test
```

## Key Takeaways

1. Never let a lookup insert into the table.
2. The shift is at least 1; always clamp it.
