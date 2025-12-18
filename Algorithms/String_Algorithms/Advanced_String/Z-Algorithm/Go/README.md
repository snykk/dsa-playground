# Z-Algorithm (Go)

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
   - Returns slice of Z-values
   - Time: O(n), Space: O(n)

2. **`ZAlgorithmSearch(text, pattern)`**
   - Find all occurrences of pattern in text using Z-algorithm
   - Returns slice of starting indices
   - Time: O(n + m), Space: O(n + m)

---

## Usage

```go
package main

import "fmt"

func main() {
    text := "ABABDABACDABABCABC"
    pattern := "ABABCABC"
    
    occurrences := ZAlgorithmSearch(text, pattern)
    fmt.Println(occurrences)  // [10]
    
    // Build Z-array
    s := "aabxaabxcaabxaabxay"
    z := buildZArray(s)
    fmt.Println(z)
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

