# Boyer-Moore Algorithm (C++)

**Boyer-Moore Algorithm** is an efficient string matching algorithm that uses bad character and good suffix heuristics to skip characters during pattern matching.

---

## Overview

The Boyer-Moore algorithm is particularly efficient for long patterns. It matches from right to left and uses two heuristics to skip characters:
- **Bad Character Rule**: When a mismatch occurs, shift the pattern to align the bad character with its last occurrence in the pattern
- **Good Suffix Rule**: When a suffix of the pattern matches, shift to align with the next occurrence of that suffix

**Key Characteristics:**
- Efficient for long patterns
- Best case: O(n/m) time complexity
- Worst case: O(n × m) time complexity
- Space: O(m) for bad character table

---

## Complexity Analysis

| Aspect | Complexity |
|--------|------------|
| **Best Time** | O(n/m) |
| **Worst Time** | O(n × m) |
| **Space** | O(m) |

Where:
- n = length of text
- m = length of pattern

---

## Implementation Details

### Functions

1. **`buildBadCharTable(pattern)`**
   - Build bad character table for Boyer-Moore algorithm
   - Returns unordered_map mapping characters to their last occurrence index
   - Time: O(m), Space: O(m)

2. **`boyerMooreSearch(text, pattern)`**
   - Find all occurrences of pattern in text using Boyer-Moore algorithm
   - Returns vector of starting indices
   - Time: O(n/m) best case, O(n × m) worst case
   - Space: O(m)

---

## Usage

```cpp
#include <string>
#include <vector>
#include <iostream>
#include "boyer_moore.cpp"

int main() {
    std::string text = "ABABDABACDABABCABC";
    std::string pattern = "ABABCABC";
    
    std::vector<int> occurrences = boyerMooreSearch(text, pattern);
    // occurrences = [10]
    
    return 0;
}
```

---

## Testing

Run tests with:

```bash
# Compile
g++ -o boyer_moore_test boyer_moore_test.cpp

# Run
./boyer_moore_test
```

Or compile and run in one command:

```bash
g++ boyer_moore_test.cpp -o boyer_moore_test && ./boyer_moore_test
```

---

## References

- Boyer, R. S., & Moore, J. S. (1977). "A fast string searching algorithm"
- "Introduction to Algorithms" by CLRS (Chapter 32)

---

_Last Updated: December 2025_

