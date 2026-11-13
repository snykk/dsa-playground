# Modular Arithmetic Tricks -- Python Implementation

Modular operations, fast exponentiation, inverses, factorial tables, Lucas' theorem, the generalised Chinese remainder theorem, matrix power and Fibonacci.

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `modular_tricks.py` | the functions below and a small demo |
| `modular_tricks_test.py` | 20 tests: basics, power (including modulus 1), inverses, factorials, Lucas against exact binomials, CRT against brute force, Fibonacci |

## API

- `MOD = 10**9 + 7`; `mod`, `add`, `sub`, `mul` (default modulus `MOD`).
- `power(base, exp, m)`: binary exponentiation; returns `1 % m`.
- `mod_inverse(a, m)`: Fermat (prime `m`); `mod_inverse_ext_gcd(a, m)`: any coprime pair, -1 when none; `ext_gcd(a, b)` returns `(g, x, y)`; `div_mod(a, b, m)`.
- `Factorials(n, m)`: `fact`, `inv_fact`, `nCr(n, r)`, `nPr(n, r)`.
- `lucas_nCr(n, r, p, fact_obj)`: `fact_obj` must be `Factorials(p - 1, p)`; otherwise `ValueError`.
- `chinese_remainder(remainders, moduli)`: smallest non-negative solution; raises `ValueError` if the system has no solution.
- `matrix_mult`, `matrix_power`, `fibonacci(n, m)`.

## Python-Specific Notes

- Unbounded integers: no overflow, so `mul` is just `(a % m) * (b % m) % m`.
- Python's `%` is non-negative for a positive modulus; `mod` is kept for parity with the other languages.
- `chinese_remainder` returns a value modulo `lcm(moduli)`, which is their product when they are pairwise coprime.
- `mod_inverse` silently gives a wrong value for a composite modulus; use `mod_inverse_ext_gcd` there.

## How to Run

```bash
python3 -m unittest modular_tricks_test
python3 modular_tricks.py      # demo
```

## Key Takeaways

1. Reduce after every operation; divide by multiplying with an inverse.
2. Lucas' theorem needs binomials modulo the same prime.
3. Detect impossible systems (CRT) instead of returning garbage.
