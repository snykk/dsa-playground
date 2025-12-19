# Euclidean Algorithm (Go)

**Euclidean Algorithm** is an efficient method for computing the greatest common divisor (GCD) of two integers. It can also be used to compute the least common multiple (LCM).

---

## Overview

The Euclidean algorithm is one of the oldest algorithms still in use today. It is based on the principle that the GCD of two numbers also divides their difference.

**Key Characteristics:**
- Efficient: O(log min(a, b)) time complexity
- Simple: Easy to understand and implement
- Versatile: Can compute GCD, LCM, and solve linear Diophantine equations

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **GCD** | O(log min(a, b)) | O(1) iterative, O(log min(a, b)) recursive |
| **LCM** | O(log min(a, b)) | O(1) |
| **Extended GCD** | O(log min(a, b)) | O(log min(a, b)) |

---

## Implementation Details

### Functions

1. **`GCD(a, b)`**
   - Compute GCD using recursive Euclidean algorithm
   - Returns GCD of a and b
   - Time: O(log min(a, b)), Space: O(log min(a, b))

2. **`GCDIterative(a, b)`**
   - Compute GCD using iterative Euclidean algorithm
   - Returns GCD of a and b
   - Time: O(log min(a, b)), Space: O(1)

3. **`LCM(a, b)`**
   - Compute LCM using GCD
   - Returns LCM of a and b
   - Time: O(log min(a, b)), Space: O(1)

4. **`ExtendedGCD(a, b)`**
   - Extended Euclidean algorithm
   - Returns ExtendedGCDResult struct with GCD, X, Y where a*X + b*Y = GCD
   - Time: O(log min(a, b)), Space: O(log min(a, b))

---

## Usage

```go
package main

import "fmt"

func main() {
    // Compute GCD
    result := GCD(48, 18)
    fmt.Println(result)  // 6
    
    // Compute LCM
    result = LCM(12, 18)
    fmt.Println(result)  // 36
    
    // Extended GCD
    egcd := ExtendedGCD(48, 18)
    fmt.Printf("GCD = %d, x = %d, y = %d\n", egcd.GCD, egcd.X, egcd.Y)
    // GCD = 6, x = -1, y = 3
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

- "Introduction to Algorithms" by CLRS (Chapter 31)
- "Algorithm Design Manual" by Steven Skiena
- "Number Theory" by Rosen

---

_Last Updated: December 2025_

