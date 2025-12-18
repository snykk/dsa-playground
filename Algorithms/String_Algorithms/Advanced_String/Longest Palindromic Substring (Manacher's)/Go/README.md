# Manacher's Algorithm (Go)

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

1. **`Manacher(s)`**
   - Find longest palindromic substring using Manacher's algorithm
   - Returns the longest palindromic substring
   - Time: O(n), Space: O(n)

---

## Usage

```go
package main

import "fmt"

func main() {
    s := "babad"
    
    result := Manacher(s)
    fmt.Println("Longest palindromic substring:", result)  // "bab" or "aba"
}
```

---

## Testing

Run tests with:

```bash
# Run tests
go test -v

# Or run the main file to see example usage
go run main.go
```

---

## References

- Manacher, G. (1975). "A new linear-time algorithm for finding the maximum palindrome"
- "Introduction to Algorithms" by CLRS

---

_Last Updated: December 2025_

