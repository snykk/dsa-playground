# Matrix Exponentiation

Computing matrix powers efficiently using binary exponentiation.

## Algorithm

Same as scalar binary exponentiation but with matrix multiplication:
1. If power is odd, multiply result by matrix
2. Square the matrix
3. Halve the power

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Matrix Power | O(k³ log n) | O(k²) |

k = matrix dimension, n = power

## Applications

### Linear Recurrences
Fibonacci: F(n) = F(n-1) + F(n-2)

```
[F(n+1)]   [1 1]^n   [F(1)]
[F(n)  ] = [1 0]   × [F(0)]
```

### Graph Problems
- Count paths of length n
- State transitions

## When to Use

- Large n (> 10⁹)
- Linear recurrence relations
- Fixed transition matrices

