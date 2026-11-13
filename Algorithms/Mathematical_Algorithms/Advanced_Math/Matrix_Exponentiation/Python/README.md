# Matrix Exponentiation -- Python Implementation

Matrix multiplication, identity, recursive and iterative matrix power, and Fibonacci by matrix power.

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `matrix_exponentiation.py` | the functions below |
| `matrix_exponentiation_test.py` | 17 tests: exact small powers, modulus, negative entries, a modulus above 2^32, negative exponents, modulus 0 and 1, Fibonacci |

## API

- `matrix_multiply(A, B, mod=None)`: `n x m` times `m x p`.
- `matrix_identity(n, mod=None)`: identity (zeros when `mod == 1`).
- `matrix_power(A, k, mod=None)`: recursive; `ValueError` if `k < 0`.
- `matrix_power_iterative(A, k, mod=None)`: iterative binary exponentiation; `ValueError` if `k < 0`.
- `fibonacci_matrix(n, mod=None)`: `F(n)`; `ValueError` if `n < 0`.

## Python-Specific Notes

- A modulus is applied only when it is a positive integer; `None`, 0 and negative values mean no modulus.
- Python's `%` is always non-negative for a positive modulus, so negative entries reduce into `[0, mod)`.
- Integers are unbounded: no overflow, no 128-bit tricks needed. Without a modulus the numbers still grow exponentially.
- `matrix_power` is recursive (depth about `2 log k`), so `fibonacci_matrix` uses O(log n) space, not O(1).

## How to Run

```bash
python3 -m unittest matrix_exponentiation_test
python3 matrix_exponentiation.py        # demo
```

## Key Takeaways

1. Associativity is all that repeated squaring needs.
2. Reduce after every product when working modulo `m`.
3. Decide how modulus 0, 1 and negative exponents behave, and test those cases.
