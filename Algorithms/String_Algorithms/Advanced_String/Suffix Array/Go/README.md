# Suffix Array (Go)

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

1. **`BuildSuffixArray(s)`**
   - Build suffix array for a given string
   - Returns slice of indices sorted by suffix
   - Time: O(n log n), Space: O(n)

2. **`SearchPattern(suffixArray, text, pattern)`**
   - Search for pattern in text using suffix array
   - Returns slice of starting indices where pattern is found
   - Time: O(m log n), Space: O(1)

---

## Usage

```go
package main

import "fmt"

func main() {
    text := "banana"
    
    // Build suffix array
    sa := BuildSuffixArray(text)
    fmt.Printf("Suffix array: %v\n", sa)
    
    // Search for pattern
    pattern := "ana"
    occurrences := SearchPattern(sa, text, pattern)
    fmt.Printf("Pattern '%s' found at: %v\n", pattern, occurrences)
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

