# Suffix Array (C++)

**Suffix Array** is a sorted array of all suffixes of a string, useful for efficient pattern matching and string processing.

---

## Overview

A suffix array is a sorted array of all suffixes of a string. It enables efficient pattern matching using binary search, making it powerful for multiple pattern queries and string analysis.

**Key Characteristics:**
- Sorted array of all suffixes
- Time: O(n log n) construction, O(m log n) search
- Space: O(n)
- Powerful for string processing

---

## Complexity Analysis

| Aspect | Complexity |
|--------|------------|
| **Construction Time** | O(n log n) |
| **Search Time** | O(m log n) |
| **Space** | O(n) |

Where:
- n = length of text
- m = length of pattern

---

## Implementation Details

### Functions

1. **`buildSuffixArray(s)`**
   - Build suffix array for a given string
   - Returns vector of indices sorted by suffix
   - Time: O(n log n), Space: O(n)

2. **`searchPattern(suffixArray, text, pattern)`**
   - Search for pattern in text using suffix array
   - Returns vector of starting indices where pattern is found
   - Time: O(m log n), Space: O(1)

---

## Usage

```cpp
#include <string>
#include <vector>
#include <iostream>
#include "suffix_array.cpp"

int main() {
    std::string text = "banana";
    
    // Build suffix array
    std::vector<int> sa = buildSuffixArray(text);
    
    // Search for pattern
    std::string pattern = "ana";
    std::vector<int> occurrences = searchPattern(sa, text, pattern);
    // occurrences = [1, 3]
    
    return 0;
}
```

---

## Testing

Run tests with:

```bash
# Compile
g++ -o suffix_array_test suffix_array_test.cpp

# Run
./suffix_array_test
```

Or compile and run in one command:

```bash
g++ suffix_array_test.cpp -o suffix_array_test && ./suffix_array_test
```

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

