# Modular Exponentiation -- Python Implementation

## Files

- `modular_exponentiation.py`: the functions below plus a demo under `__main__`.
- `modular_exponentiation_test.py`: unit tests (basics, exponent 0, base 0, modulus 1, `2^100 mod 1000 = 376`, recursive version, negative base, negative exponent, inverses including negative numbers, a signed extended-gcd identity check, 500 random cases against built-in `pow`).

## API

- `mod_pow(base, exponent, modulus)`: iterative square and multiply; result in `0 .. modulus-1`. A negative exponent gives the inverse power (or `None` if `base` has no inverse).
- `mod_pow_recursive(base, exponent, modulus)`: the same result, recursive.
- `mod_inverse(a, m)`: `x` in `0 .. m-1` with `a*x = 1 (mod m)`, or `None`; negative `a` is fine.
- `extended_gcd_inline(a, b)`: `(g, x, y)` with `a*x + b*y == g == gcd(a, b)`, for inputs of any sign.

```python
from modular_exponentiation import mod_pow

print(mod_pow(5, 13, 11))   # 4
print(mod_pow(2, -1, 11))   # 6
```

## Python-Specific Notes

- Integers have arbitrary precision, so there is no overflow.
- The built-in `pow(base, exponent, modulus)` (and `pow(base, -1, modulus)` from 3.8) does the same thing in C and is what you should use in real code.
- The recursive version uses `O(log e)` stack, about two frames per bit of the exponent.
- The modulus must be positive. Python 3.9 and later.

## How to Run

```bash
python3 -m unittest modular_exponentiation_test
python3 modular_exponentiation.py
```

## Key Takeaways

- Square the base for every bit, multiply it in for every 1 bit.
- Reduce after every multiplication.
- A negative exponent needs a modular inverse.
