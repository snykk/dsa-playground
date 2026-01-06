# Optimization Techniques

Performance optimization techniques for competitive programming.

## Topics

| Technique | Description |
|-----------|-------------|
| [Fast I/O](Fast_IO/) | High-performance input/output methods |
| [Modular Arithmetic Tricks](Modular_Arithmetic_Tricks/) | Efficient modular operations |
| [Bitmasking](Bitmasking/) | Bit manipulation and subset enumeration |
| [Precomputation](Precomputation/) | Trading memory for time |

## Overview

### Fast I/O
- Standard fast I/O setup (`ios_base::sync_with_stdio(false)`)
- Custom getchar/putchar methods
- Buffered I/O classes

### Modular Arithmetic Tricks
- Safe modulo operations
- Fast exponentiation
- Modular inverse (Fermat's, Extended GCD)
- Factorial precomputation

### Bitmasking
- Basic bit operations (get, set, clear, toggle)
- Subset enumeration
- Gosper's hack
- Bitmask DP (TSP, subset sum)

### Precomputation
- Factorials and inverse factorials
- Prime sieve, SPF
- Prefix sums (1D, 2D)
- Sparse tables

## Complexity Reference

| Technique | Build | Query | Space |
|-----------|-------|-------|-------|
| Factorial precomputation | O(n) | O(1) | O(n) |
| Prime sieve | O(n log log n) | O(1) | O(n) |
| Prefix sum | O(n) | O(1) | O(n) |
| Sparse table | O(n log n) | O(1) | O(n log n) |

