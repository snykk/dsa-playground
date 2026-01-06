# Miller-Rabin Primality Test

A probabilistic algorithm to determine if a number is prime.

## Algorithm

Based on Fermat's Little Theorem with additional checks:
1. Write n-1 = 2^s × d (d is odd)
2. For each witness a:
   - Compute a^d mod n
   - Check if it equals 1 or n-1
   - Square repeatedly and check for n-1

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Test | O(k log³ n) | O(1) |

k = number of witnesses

## Deterministic Variant

For n < 3,317,044,064,679,887,385,961,981:
- Use witnesses: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37

## Applications

- Primality testing for large numbers
- Cryptographic key generation
- Random prime generation

