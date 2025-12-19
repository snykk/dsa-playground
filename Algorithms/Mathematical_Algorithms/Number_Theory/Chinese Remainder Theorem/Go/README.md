# Chinese Remainder Theorem (Go)

**Chinese Remainder Theorem (CRT)** solves systems of simultaneous congruences with pairwise coprime moduli.

---

## Overview

The Chinese Remainder Theorem is a fundamental result in number theory that provides conditions for the existence and uniqueness of solutions to systems of simultaneous congruences.

**Key Characteristics:**
- Solves: x ≡ a_i (mod m_i) for all i
- Requires: Moduli must be pairwise coprime
- Efficient: O(n log max(moduli)) time complexity

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **ChineseRemainderTheorem** | O(n log max(moduli)) | O(n) |
| **ChineseRemainderTheoremPairwise** | O(log max(m1, m2)) | O(1) |
| **VerifyCrtSolution** | O(n) | O(1) |

---

## Implementation Details

### Functions

1. **`ChineseRemainderTheorem(remainders, moduli)`**
   - Solve system of congruences
   - Returns solution x mod (product of all moduli), or -1 if moduli are not coprime
   - Time: O(n log max(moduli)), Space: O(n)

2. **`ChineseRemainderTheoremPairwise(a1, m1, a2, m2)`**
   - Solve system of two congruences
   - Returns solution x mod (m1 * m2), or -1 if m1 and m2 are not coprime
   - Time: O(log max(m1, m2)), Space: O(1)

3. **`VerifyCrtSolution(x, remainders, moduli)`**
   - Verify that x satisfies all congruences
   - Returns true if valid, false otherwise
   - Time: O(n), Space: O(1)

---

## Usage

```go
package main

import "fmt"

func main() {
    // Example: x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7)
    remainders := []int64{2, 3, 2}
    moduli := []int64{3, 5, 7}
    solution := ChineseRemainderTheorem(remainders, moduli)
    fmt.Println(solution)  // 23
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
- "Number Theory" by Rosen
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

