# Longest Common Subsequence -- C++ Implementation

Bottom-up LCS length over a 2D table.

## Files

| File | Contents |
|------|----------|
| `lcs.cpp` | `lcsLength` |
| `lcs_test.cpp` | `assert`-based tests; it `#include`s `lcs.cpp` |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `int lcsLength(const std::string& s1, const std::string& s2)` | length of the LCS | O(m * n) | O(m * n) |

There is no sequence reconstruction and no two-row version here; the Python folder has both.

## C++-Specific Notes

- `std::string` holds bytes, so a multi-byte UTF-8 character is compared byte by byte. Python compares code points.
- The table is a `vector<vector<int>>`, `(m + 1) x (n + 1)`.
- The test file includes the `.cpp`, so compile only the test file.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD lcs_test.cpp -o lcs_test
./lcs_test
```

## Key Takeaways

- Cell `dp[i][j]` compares `s1[i - 1]` and `s2[j - 1]`.
- A match adds 1 to the diagonal; a mismatch takes the larger of up and left.
- It works on bytes, not characters.
