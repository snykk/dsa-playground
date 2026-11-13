# Suffix Array -- C++ Implementation

A suffix array built by sorting the materialized suffixes, with binary-search pattern lookup.

## Files

| File | Contents |
|------|----------|
| `suffix_array.cpp` | class `SuffixArray` |
| `suffix_array_test.cpp` | `assert`-based tests: exact search results on `banana`, absent patterns, the empty pattern, an empty text |

## API

- `SuffixArray(const string& s)`: builds the sorted suffix indices.
- `vector<int> search(const string& pattern)`: all start indices, in increasing order; empty if absent. An empty pattern returns `0..n-1` on a non-empty text.

## C++-Specific Notes

- Construction stores `pair<string, int>` for every suffix (`substr`), so it uses O(n^2) memory and O(n^2 log n) time in the worst case.
- `search` copies the probed suffix with `substr` at each step, so it costs O(n log n) per query; the match test uses `compare(0, m, pattern)`, which stops after `m` characters.
- Indices are byte offsets.
- Only `search` is exposed; the Python version also has `get_suffixes` and `longest_common_prefix`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD suffix_array_test.cpp -o suffix_array_test
./suffix_array_test
```

## Key Takeaways

1. The sorted order puts every occurrence of a pattern in one block.
2. Copying suffixes is simple but quadratic in memory; the textbook builds avoid it.
