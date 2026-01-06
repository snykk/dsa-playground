# Sieve of Eratosthenes

An efficient algorithm for finding all prime numbers up to a given limit.

## Algorithm

1. Create a boolean array of size n+1, initially all true
2. Mark 0 and 1 as not prime
3. For each prime p, mark all multiples of p as not prime
4. Remaining true values are primes

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Build | O(n log log n) | O(n) |
| Query | O(1) | - |

## Variants

- **Segmented Sieve**: For large ranges with limited memory
- **Linear Sieve**: O(n) time with smallest prime factor

## Applications

- Prime factorization
- Counting primes in range
- Finding prime factors

