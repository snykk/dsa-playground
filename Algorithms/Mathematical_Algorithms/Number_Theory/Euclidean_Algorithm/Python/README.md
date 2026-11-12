# Euclidean Algorithm -- Python Implementation

## Files

- `euclidean_algorithm.py`: the four functions below plus a demo under `__main__`.
- `euclidean_algorithm_test.py`: unit tests (gcd basics, zero, negatives, lcm, the gcd-lcm identity, extended gcd including negative inputs and 5,000 random signed pairs, values above 2^53, large lcm).

## API

- `gcd(a, b)`: recursive Euclid on `|a|` and `|b|`; `gcd(0, 0) == 0`.
- `gcd_iterative(a, b)`: the same result with a loop.
- `lcm(a, b)`: `|a * b| // gcd(a, b)`; 0 if either argument is 0.
- `extended_gcd(a, b)`: `(g, x, y)` with `a*x + b*y == g == gcd(a, b)`, for inputs of any sign.

```python
from euclidean_algorithm import gcd, extended_gcd

print(gcd(48, 18))            # 6
print(extended_gcd(-48, 18))  # (6, 1, 3): -48*1 + 18*3 == 6
```

## Python-Specific Notes

- Integers have arbitrary precision, so there is no overflow.
- The recursive versions use `O(log min(a, b))` stack; the recursion depth is tiny (about 90 frames at most for 64-bit inputs).
- `math.gcd` and `math.lcm` (3.9+) are the standard library equivalents; `pow(a, -1, m)` covers modular inverses.
- Python 3.9 and later.

## How to Run

```bash
python3 -m unittest euclidean_algorithm_test
python3 euclidean_algorithm.py
```

## Key Takeaways

- `gcd(a, b) = gcd(b, a mod b)`, and the loop ends in `O(log min)` steps.
- For negative inputs, run on absolute values and flip the signs of `x` and `y` afterwards.
