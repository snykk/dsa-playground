# Sieve of Eratosthenes (Go)

**Sieve of Eratosthenes** is an efficient algorithm for finding all prime numbers up to a given limit n.

---

## Overview

The Sieve of Eratosthenes is one of the most efficient ways to find all primes smaller than n when n is smaller than about 10 million. It works by iteratively marking the multiples of each prime number starting from 2.

**Key Characteristics:**
- Efficient: O(n log log n) time complexity
- Simple: Easy to understand and implement
- Space: O(n) for boolean array

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **SieveOfEratosthenes** | O(n log log n) | O(n) |
| **SieveBoolean** | O(n log log n) | O(n) |
| **IsPrimeSieve** | O(1) | O(1) |

---

## Implementation Details

### Functions

1. **`SieveOfEratosthenes(n)`**
   - Find all prime numbers up to n
   - Returns slice of primes
   - Time: O(n log log n), Space: O(n)

2. **`SieveBoolean(n)`**
   - Return boolean array indicating primes
   - Returns slice where isPrime[i] = true if i is prime
   - Time: O(n log log n), Space: O(n)

3. **`IsPrimeSieve(n, sieve)`**
   - Check if n is prime using precomputed sieve
   - Returns true if prime, false otherwise
   - Time: O(1), Space: O(1)

---

## Usage

```go
package main

import "fmt"

func main() {
    // Find all primes up to 100
    primes := SieveOfEratosthenes(100)
    fmt.Println(primes)
    
    // Use boolean array for O(1) prime checking
    sieve := SieveBoolean(1000)
    if sieve[17] {
        fmt.Println("17 is prime")
    }
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
- "Number Theory" by Rosen

---

_Last Updated: December 2025_

