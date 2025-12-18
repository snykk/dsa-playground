# KMP Algorithm (C++)

**KMP (Knuth-Morris-Pratt) Algorithm** is an efficient string matching algorithm that uses preprocessing to avoid rechecking characters that have already been matched.

---

## Overview

The KMP algorithm improves upon naive pattern search by using information from previous matches to skip unnecessary comparisons. It preprocesses the pattern to build a Longest Proper Prefix which is also Suffix (LPS) array.

**Key Characteristics:**
- Efficient: O(n + m) time complexity
- Uses preprocessing: Builds LPS array in O(m) time
- No backtracking: Text pointer never moves backward
- Optimal for repeated patterns

---

## Complexity Analysis

| Aspect | Complexity |
|--------|------------|
| **Time** | O(n + m) |
| **Space** | O(m) for LPS array |
| **Preprocessing** | O(m) |
| **Search** | O(n) |

---

## Implementation Details

### Functions

1. **`buildLPS(pattern)`**
   - Build Longest Proper Prefix which is also Suffix array
   - Returns LPS vector
   - Time: O(m), Space: O(m)

2. **`kmpSearch(text, pattern)`**
   - Find all occurrences of pattern in text
   - Returns vector of starting indices
   - Time: O(n + m), Space: O(m)

3. **`kmpSearchCount(text, pattern)`**
   - Count occurrences of pattern in text
   - Returns number of occurrences
   - Time: O(n + m), Space: O(m)

4. **`kmpSearchFirst(text, pattern)`**
   - Find first occurrence of pattern in text
   - Returns index of first occurrence, or -1 if not found
   - Time: O(n + m), Space: O(m)

---

## Usage

```cpp
#include <string>
#include <vector>
#include <iostream>
#include "kmp.cpp"

int main() {
    std::string text = "ABABDABACDABABCABC";
    std::string pattern = "ABABCABC";
    
    std::vector<int> lps = buildLPS(pattern);
    std::vector<int> occurrences = kmpSearch(text, pattern);
    // occurrences = [10]
    
    return 0;
}
```

---

## Testing

Run tests with:

```bash
# Compile
g++ -o kmp_test kmp_test.cpp

# Run
./kmp_test
```

Or compile and run in one command:

```bash
g++ kmp_test.cpp -o kmp_test && ./kmp_test
```

---

## References

- Knuth, D. E., Morris, J. H., & Pratt, V. R. (1977). "Fast pattern matching in strings"
- "Introduction to Algorithms" by CLRS (Chapter 32)

---

_Last Updated: December 2025_

