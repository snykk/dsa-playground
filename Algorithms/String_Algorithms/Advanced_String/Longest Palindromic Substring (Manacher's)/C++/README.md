# Manacher's Algorithm (C++)

**Manacher's Algorithm** finds the longest palindromic substring in a string in linear time.

---

## Overview

Manacher's algorithm is the optimal algorithm for finding the longest palindromic substring. It uses a clever technique with a transformed string and maintains a palindrome radius array to achieve linear time complexity.

**Key Characteristics:**
- Finds longest palindromic substring in linear time
- Time: O(n) time complexity
- Space: O(n)
- Optimal algorithm for palindrome detection

---

## Complexity Analysis

| Aspect | Complexity |
|--------|------------|
| **Time** | O(n) |
| **Space** | O(n) |

Where:
- n = length of string

---

## Implementation Details

### Functions

1. **`manacher(s)`**
   - Find longest palindromic substring using Manacher's algorithm
   - Returns the longest palindromic substring
   - Time: O(n), Space: O(n)

---

## Usage

```cpp
#include <string>
#include <iostream>
#include "manacher.cpp"

int main() {
    std::string s = "babad";
    
    std::string result = manacher(s);
    // result = "bab" or "aba"
    
    return 0;
}
```

---

## Testing

Run tests with:

```bash
# Compile
g++ -o manacher_test manacher_test.cpp

# Run
./manacher_test
```

Or compile and run in one command:

```bash
g++ manacher_test.cpp -o manacher_test && ./manacher_test
```

---

## References

- Manacher, G. (1975). "A new linear-time algorithm for finding the maximum palindrome"
- "Introduction to Algorithms" by CLRS

---

_Last Updated: December 2025_

