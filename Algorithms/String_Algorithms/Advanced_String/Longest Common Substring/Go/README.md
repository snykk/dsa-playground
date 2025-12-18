# Longest Common Substring (Go)

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

1. **`LongestCommonSubstring(s1, s2)`**
   - Find longest common substring between two strings
   - Returns the longest common substring as a string
   - Time: O(m × n), Space: O(m × n)

---

## Usage

```go
package main

import "fmt"

func main() {
    s1 := "ABABC"
    s2 := "BABCA"
    
    result := LongestCommonSubstring(s1, s2)
    fmt.Println("Longest Common Substring:", result)  // "BABC" or "ABCA"
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

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

