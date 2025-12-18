# Z-Algorithm (C++)

**Z-Algorithm** constructs a Z-array for efficient pattern matching and string processing.

---

## Overview

The Z-Algorithm constructs a Z-array where Z[i] is the length of the longest substring starting at position i that is also a prefix of the string. This array is useful for pattern matching and various string processing tasks.

**Key Characteristics:**
- Constructs Z-array for pattern matching
- Time: O(n + m) time complexity
- Space: O(n + m)
- Useful for string processing

---

## Complexity Analysis

| Aspect | Complexity |
|--------|------------|
| **Time** | O(n + m) |
| **Space** | O(n + m) |

Where:
- n = length of text
- m = length of pattern

---

## Implementation Details

### Functions

1. **`buildZArray(s)`**
   - Build Z-array for a given string
   - Returns vector of Z-values
   - Time: O(n), Space: O(n)

2. **`zAlgorithmSearch(text, pattern)`**
   - Find all occurrences of pattern in text using Z-algorithm
   - Returns vector of starting indices
   - Time: O(n + m), Space: O(n + m)

---

## Usage

```cpp
#include <string>
#include <vector>
#include <iostream>
#include "z_algorithm.cpp"

int main() {
    std::string text = "ABABDABACDABABCABC";
    std::string pattern = "ABABCABC";
    
    std::vector<int> occurrences = zAlgorithmSearch(text, pattern);
    // occurrences = [10]
    
    // Build Z-array
    std::string s = "aabxaabxcaabxaabxay";
    std::vector<int> z = buildZArray(s);
    
    return 0;
}
```

---

## Testing

Run tests with:

```bash
# Compile
g++ -o z_algorithm_test z_algorithm_test.cpp

# Run
./z_algorithm_test
```

Or compile and run in one command:

```bash
g++ z_algorithm_test.cpp -o z_algorithm_test && ./z_algorithm_test
```

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

