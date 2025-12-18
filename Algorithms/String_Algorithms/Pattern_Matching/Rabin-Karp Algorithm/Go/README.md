# Rabin-Karp Algorithm (Go)

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

1. **`RabinKarpSearch(text, pattern)`**
   - Find all occurrences of pattern in text using Rabin-Karp algorithm
   - Returns slice of starting indices
   - Time: O(n + m) average, O(n × m) worst
   - Space: O(1)

---

## Usage

```go
package main

import "fmt"

func main() {
    text := "ABABDABACDABABCABC"
    pattern := "ABABCABC"
    
    occurrences := RabinKarpSearch(text, pattern)
    fmt.Println(occurrences)  // [10]
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

- "Introduction to Algorithms" by CLRS (Chapter 32)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

