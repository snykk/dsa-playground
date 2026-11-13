# Miller-Rabin Primality Test -- Python Implementation

## Files

- `miller_rabin.py`: the three functions below plus a demo under `__main__`.
- `miller_rabin_test.py`: unit tests (small primes and composites, edge cases, Carmichael numbers, agreement with trial division for 0..5000, primes up to 2^64, strong pseudoprimes, the 12-base bound).

## API

- `miller_rabin(n, k=5)`: `k` random witnesses from `[2, n - 2]`; `n` should be odd and greater than 3, other values are handled. Returns True for "probably prime".
- `is_prime_miller_rabin(n, k=5)`: handles `n < 2` and even `n`, then calls `miller_rabin`.
- `miller_rabin_deterministic(n)`: the twelve witnesses 2..37; exact for `n < 318665857834031151167461`, which includes every 64-bit integer.

```python
from miller_rabin import is_prime_miller_rabin, miller_rabin_deterministic

print(is_prime_miller_rabin(561, k=10))          # False (Carmichael)
print(miller_rabin_deterministic(2**64 - 59))    # True
```

## Python-Specific Notes

- `pow(a, d, n)` does the modular exponentiation with big integers, so there is no overflow at any size.
- Randomness comes from `random.randrange`, seeded by Python at start-up.
- Above 318665857834031151167461 the deterministic function can answer True for a composite (the first such number is 399165290221 * 798330580441); use `miller_rabin` with more rounds there.
- Python 3.9 and later.

## How to Run

```bash
python3 -m unittest miller_rabin_test
python3 miller_rabin.py
```

## Key Takeaways

- Decompose `n - 1 = d * 2^r`, then look for 1 or `n - 1` in the chain of squares.
- Several bases are needed: one base can be fooled (2 for 2047).
- The fixed witnesses 2..37 are exact for 64-bit inputs.
