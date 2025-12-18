# Longest Common Substring (C++)

**Longest Common Substring** finds the longest substring that appears in both strings using dynamic programming.

---

## Overview

The longest common substring problem finds the longest contiguous substring that appears in both input strings. This implementation uses dynamic programming with a 2D table to track matching substrings.

**Key Characteristics:**
- Finds longest common substring between two strings
- Time: O(m × n) time complexity
- Space: O(m × n)
- Uses dynamic programming

---

## Complexity Analysis

| Aspect | Complexity |
|--------|------------|
| **Time** | O(m × n) |
| **Space** | O(m × n) |

Where:
- m = length of first string
- n = length of second string

---

## Implementation Details

### Functions

1. **`longestCommonSubstring(s1, s2)`**
   - Find longest common substring between two strings
   - Returns the longest common substring as a string
   - Time: O(m × n), Space: O(m × n)

---

## Usage

```cpp
#include <string>
#include <iostream>
#include "longest_common_substring.cpp"

int main() {
    std::string s1 = "ABABC";
    std::string s2 = "BABCA";
    
    std::string result = longestCommonSubstring(s1, s2);
    // result = "BABC" or "ABCA"
    
    return 0;
}
```

---

## Testing

Run tests with:

```bash
# Compile
g++ -o longest_common_substring_test longest_common_substring_test.cpp

# Run
./longest_common_substring_test
```

Or compile and run in one command:

```bash
g++ longest_common_substring_test.cpp -o longest_common_substring_test && ./longest_common_substring_test
```

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

