# Pattern Matching -- C++ Implementation

Naive search and KMP, each returning a `vector<int>` of start indices.

## Files

| File | Contents |
|------|----------|
| `pattern_matching.cpp` | `naive_search`, `compute_lps`, `kmp_search` |
| `pattern_matching_test.cpp` | `assert`-based tests: the `ababcabcabc` / `abc` fixture, an empty pattern, a pattern longer than the text, overlapping matches |

## API

- `vector<int> naive_search(const string &text, const string &pattern)`: compare every window. O(n*m).
- `vector<int> compute_lps(const string &pattern)`: the LPS table. O(m).
- `vector<int> kmp_search(const string &text, const string &pattern)`: KMP search. O(n + m).

An empty pattern returns `{0, 1, ..., n}` from both functions; a pattern longer than the text returns an empty vector. Rabin-Karp and Boyer-Moore exist only in the Python version of this topic.

## C++-Specific Notes

- Indices are **byte** offsets, since `std::string` stores bytes; UTF-8 text gives different offsets from Python.
- `naive_search` builds `text.substr(i, m)` for each alignment, which allocates a copy; a `compare` call or a character loop would avoid it.
- `n` and `m` are `int`, so `n - m` is negative (and the loop does not run) when the pattern is longer than the text.
- `std::string::find` is the standard-library answer. C++17 also provides `std::boyer_moore_searcher` and `std::boyer_moore_horspool_searcher` in `<functional>`, used with `std::search`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD pattern_matching_test.cpp -o pattern_matching_test
./pattern_matching_test
```

## Key Takeaways

1. KMP never moves the text index back, so it is linear in `n + m`.
2. The `m == 0` guard matters: without it the empty pattern would read `lps[-1]`.
3. Prefer the standard library for production searching.
