# Edit Distance -- C++ Implementation

Bottom-up Levenshtein distance over a 2D table.

## Files

| File | Contents |
|------|----------|
| `edit_distance.cpp` | `editDistance` |
| `edit_distance_test.cpp` | `assert`-based tests; it `#include`s `edit_distance.cpp` |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `int editDistance(const std::string& s1, const std::string& s2)` | minimum number of inserts, deletes and replaces | O(m * n) | O(m * n) |

It returns only the distance, with no traceback and no two-row version.

## C++-Specific Notes

- `std::string` holds bytes. A UTF-8 character that takes two bytes counts as two edits, unlike the Python version.
- The recurrence uses `std::min` with an initializer list for the three-way minimum.
- The test file includes the `.cpp`, so compile only the test file.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD edit_distance_test.cpp -o edit_distance_test
./edit_distance_test
```

## Key Takeaways

- The table is `(m + 1) x (n + 1)`; cell `dp[i][j]` compares `s1[i - 1]` and `s2[j - 1]`.
- It works on bytes, so convert to code points first if you need character semantics.
