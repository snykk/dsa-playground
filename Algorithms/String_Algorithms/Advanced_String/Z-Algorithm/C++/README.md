# Z-Algorithm -- C++ Implementation

The Z-array and a linear-time pattern search built on it.

## Files

| File | Contents |
|------|----------|
| `z_algorithm.cpp` | `buildZArray`, `zAlgorithmSearch` |
| `z_algorithm_test.cpp` | 15 `assert`-based tests: Z-arrays, searches, overlaps, empty inputs, a pattern longer than the text, a `$` inside the input |

## API

- `std::vector<int> buildZArray(const std::string& s)`: `z[i]` is the longest match of the suffix at `i` with a prefix of `s`; `z[0]` is 0. O(n).
- `std::vector<int> zAlgorithmSearch(const std::string& text, const std::string& pattern)`: all start indices, in increasing order; empty for an empty pattern, an empty text, or a pattern longer than the text. O(n + m).

## C++-Specific Notes

- The search concatenates `pattern + "$" + text` and keeps positions with `z[i] >= m`; `>=` is required because a `$` inside the input can make `z[i]` exceed `m`.
- Indices are byte offsets.
- Sizes are `int`; the loop variable of the search is `size_t` and the stored index is converted back to `int`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD z_algorithm_test.cpp -o z_algorithm_test
./z_algorithm_test
```

## Key Takeaways

1. The Z-box never moves left, which gives the linear bound.
2. Test `>=`, not `==`, for matches.
