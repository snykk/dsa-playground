# Longest Common Substring -- C++ Implementation

Dynamic-programming search for the longest run of characters shared by two strings.

## Files

| File | Contents |
|------|----------|
| `longest_common_substring.cpp` | `longestCommonSubstring` |
| `longest_common_substring_test.cpp` | `assert`-based tests: the basic case, no common substring, identical strings, one shared character, empty inputs, tie-breaking and overlapping candidates |

## API

- `std::string longestCommonSubstring(const std::string& s1, const std::string& s2)`: the longest common substring, or an empty string if there is none. Among equally long answers, the one that ends first in `s1` wins.

```cpp
longestCommonSubstring("ABABC", "BABCA");   // "BABC"
```

## C++-Specific Notes

- Uses a `vector<vector<int>>` of `(m+1) x (n+1)` ints: O(m*n) time and space.
- Indices are byte offsets; `std::string` does not decode UTF-8.
- Only the substring is returned, not its position (Python also returns the start indices).
- `int` sizes are fine for strings up to a few thousand characters; the table would be too large long before `int` overflows.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD longest_common_substring_test.cpp -o lcs_test
./lcs_test
```

## Key Takeaways

1. A mismatch resets the cell to 0.
2. Keep the maximum over all cells.
3. Only a strictly longer run replaces the best, which decides ties.
