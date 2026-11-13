# Sieve of Eratosthenes -- Python Implementation

## Files

- `sieve_of_eratosthenes.py`: the three functions below plus a demo under `__main__`.
- `sieve_of_eratosthenes_test.py`: unit tests (small and medium limits, counts, empty cases, the boolean sieve, lookups, negative and out-of-range lookups, negative limits, agreement with trial division up to 20,000, squares of primes, prime counts up to 100,000).

## API

- `sieve_of_eratosthenes(n)`: sorted list of the primes up to and including `n`; `[]` for `n < 2`.
- `sieve_boolean(n)`: list of `n + 1` booleans, true at the primes; `[]` for `n < 0`.
- `is_prime_sieve(k, sieve)`: `sieve[k]` for `0 <= k < len(sieve)`, otherwise false.

```python
from sieve_of_eratosthenes import sieve_of_eratosthenes

print(sieve_of_eratosthenes(30))  # [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
```

## Python-Specific Notes

- The limit uses `math.isqrt`, an exact integer square root (no floating point).
- A list of bools costs 8 bytes per entry; for large `n` use `bytearray` or NumPy.
- Negative indexes would wrap around in Python, so `is_prime_sieve` checks `k >= 0` first.
- Python 3.9 and later.

## How to Run

```bash
python3 -m unittest sieve_of_eratosthenes_test
python3 sieve_of_eratosthenes.py
```

## Key Takeaways

- Start crossing out at `p * p` and stop the outer loop at `sqrt(n)`.
- Always guard sieve lookups against negative indexes.
