# Euler's Totient -- Python Implementation

`phi(n)` by trial division and the product formula, `phi` and the smallest prime factor of every number up to `n` with the linear sieve, and the modular inverse from Euler's theorem. See the [topic README](../README.md) for the idea, a trace and the 64-bit limits of the other two languages.

## Files

| File | Contents |
|------|----------|
| `eulers_totient.py` | `prime_factors`, `phi`, `TotientSieve`, `linear_sieve`, `mod_inverse_euler`, the module-level helpers `_divide_out` and `_cross_out`, and a demo `main()` |
| `eulers_totient_test.py` | 34 `unittest` tests: `phi` against a count of gcds for every `n` up to 3000; primes, prime powers, 1, 0 and negative `n`; multiplicativity on all pairs up to 120 and the divisor sum up to 3000 and at 64 bits; the sieve against `phi` up to 5000, its edge limits and 10^6; a count of the candidates trial division tries; a record of every number the sieve crosses out, which fails if a composite is crossed out twice; Euler's theorem; the inverse against an extended Euclid; the values the C++ and Go tests pin |

## API

| Call | Result | Time |
|------|--------|------|
| `prime_factors(n)` | the factorization of `n >= 1` as `(p, k)` pairs, `p` increasing; `[]` for 1; `ValueError` for `n < 1` | O(sqrt n) |
| `phi(n)` | Euler's totient of `n >= 1`; `ValueError` for `n < 1` (`phi(0)` is undefined) | O(sqrt n) |
| `linear_sieve(n)` | a `TotientSieve(phi, spf, primes, crossings)` for `0..n`: `phi[0] = 0`, `spf[0] = spf[1] = 0`, the primes increasing, and one crossing per composite; `ValueError` for `n < 0` | O(n) |
| `mod_inverse_euler(a, n)` | `a^(phi(n) - 1) mod n`, in `0..n-1`, 0 for `n = 1`; `a` may be negative; `ValueError` if `n < 1` or `gcd(a, n) != 1` | O(sqrt n + log n) |

```python
prime_factors(360)            # [(2, 3), (3, 2), (5, 1)]
phi(360)                      # 96
phi(2**64 - 1)                # 9208981628670443520
linear_sieve(10).phi          # [0, 1, 1, 2, 2, 4, 2, 6, 4, 6, 4]
mod_inverse_euler(7, 360)     # 103, and 7 * 103 = 721 = 2 * 360 + 1
```

## Python-Specific Notes

- Integers never overflow, so any `n` works, `phi(2**100)` included; only the time grows, by about 0.2 to 0.35 microseconds per candidate. The loop test is still written `p <= n // p`, as in C++ and Go, where `p * p` would overflow.
- The modular power is the built-in three-argument `pow`, and `math.gcd` checks that an inverse exists. `pow(a, -1, n)` (Python 3.8 and later) gives the same inverse by the extended Euclid; the tests compare the two.
- `_divide_out(n, p)` (one call per candidate) and `_cross_out(phi, spf, i, p)` (one call per crossing) are module-level functions, so the tests replace them with counting wrappers.
- `TotientSieve` is a `NamedTuple`, so `t.phi` and `phi_table, spf, primes, crossings = t` both work.

## How to Run

```bash
cd "Algorithms/Mathematical_Algorithms/Number_Theory/Eulers_Totient/Python"
python3 -m unittest eulers_totient_test
python3 eulers_totient.py
```

## Key Takeaways

- `phi(n) = n * prod(1 - 1/p)`: factor once, then `result -= result // p` per distinct prime.
- The linear sieve crosses out each composite once, as `i * spf`, and gets `phi(i * p)` from `phi(i)` in O(1).
- `a^(phi(n) - 1)` is an inverse only when `gcd(a, n) = 1`.
