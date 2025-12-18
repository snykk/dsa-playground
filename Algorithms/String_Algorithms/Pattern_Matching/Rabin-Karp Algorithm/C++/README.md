# Rabin-Karp Algorithm (C++)

**Rabin-Karp Algorithm** uses hashing to find patterns in text efficiently.

---

## Overview

The Rabin-Karp algorithm uses a rolling hash function to compute hash values for all substrings of the text. It compares hash values instead of characters directly, making it efficient on average.

**Key Characteristics:**
- Hash-based pattern matching
- Average case: O(n + m) time complexity
- Worst case: O(n × m) time complexity
- Space: O(1)

---

## Complexity Analysis

| Aspect | Complexity |
|--------|------------|
| **Average Time** | O(n + m) |
| **Worst Time** | O(n × m) |
| **Space** | O(1) |

Where:
- n = length of text
- m = length of pattern

---

## Implementation Details

### Functions

1. **`rabinKarpSearch(text, pattern)`**
   - Find all occurrences of pattern in text using Rabin-Karp algorithm
   - Returns vector of starting indices
   - Time: O(n + m) average, O(n × m) worst
   - Space: O(1)

---

## Usage

```cpp
#include <string>
#include <vector>
#include <iostream>
#include "rabin_karp.cpp"

int main() {
    std::string text = "ABABDABACDABABCABC";
    std::string pattern = "ABABCABC";
    
    std::vector<int> occurrences = rabinKarpSearch(text, pattern);
    // occurrences = [10]
    
    return 0;
}
```

---

## Testing

Run tests with:

```bash
# Compile
g++ -o rabin_karp_test rabin_karp_test.cpp

# Run
./rabin_karp_test
```

Or compile and run in one command:

```bash
g++ rabin_karp_test.cpp -o rabin_karp_test && ./rabin_karp_test
```

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 32)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

