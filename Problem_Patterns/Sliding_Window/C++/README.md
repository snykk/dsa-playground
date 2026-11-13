# Sliding Window -- C++ Implementation

Fixed and variable windows over arrays and strings. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `sliding_window.cpp` | The four functions and a demo `main` |
| `sliding_window_test.cpp` | Assert-based tests (includes the `.cpp`) |

## API

- `int maxSumSubarray(const vector<int>& arr, int k)`: 0 if `k <= 0` or `k > size`.
- `int longestSubstringKDistinct(const string& s, int k)`
- `string minWindowSubstring(const string& s, const string& t)`
- `int longestSubstringNoRepeat(const string& s)`

## C++-Specific Notes

- Strings are bytes (`char`), so multi-byte UTF-8 characters count as several.
- Sums are `int`; use `long long` for large values.
- The demo `main` is compiled out when `IS_TEST_BUILD` is defined.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD sliding_window_test.cpp -o sw_test && ./sw_test
```

## Key Takeaways

- Both pointers only move forward, so the pass is O(n).
- Delete zero counts so the map size means "distinct characters".
- For the shortest window, record the answer inside the shrink loop.
