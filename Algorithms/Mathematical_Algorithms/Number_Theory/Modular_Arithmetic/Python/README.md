# Modular Arithmetic -- Python Implementation

## Files

- `modular_arithmetic.py`: the functions below plus a demo under `__main__`.
- `modular_arithmetic_test.py`: unit tests (add, subtract, multiply, divide, inverse, power, ring properties, negative operands, a signed extended-gcd identity check, inverses of negative numbers, negative exponents, a 60-bit modulus, `2^100 mod 1000 = 376`).

## API

- `mod_add(a, b, m)`, `mod_subtract(a, b, m)`, `mod_multiply(a, b, m)`: results in `0 .. m-1`.
- `mod_divide(a, b, m)`: `a * b^-1 mod m`, or `None` if `gcd(b, m) != 1`.
- `mod_inverse(a, m)`: `x` in `0 .. m-1` with `a*x = 1 (mod m)`, or `None`; negative `a` is fine.
- `mod_power(base, exponent, m)`: binary exponentiation; a negative exponent gives the inverse power, or `None` when `base` has no inverse.
- `extended_gcd(a, b)`: `(g, x, y)` with `a*x + b*y == g == gcd(a, b)`, for inputs of any sign.

```python
from modular_arithmetic import mod_inverse, mod_power

print(mod_inverse(-3, 11))   # 7
print(mod_power(2, -1, 11))  # 6
```

## Python-Specific Notes

- `%` already returns a non-negative result for a positive modulus, and integers never overflow.
- `pow(a, e, m)` and `pow(a, -1, m)` (3.8+) are the built-in equivalents of `mod_power` and `mod_inverse`.
- The modulus must be positive and is not checked: `m = 0` makes `mod_add(1, 2, 0)` raise `ZeroDivisionError`, but `mod_inverse(3, 0)` returns `None`.
- Python 3.9 and later.

## How to Run

```bash
python3 -m unittest modular_arithmetic_test
python3 modular_arithmetic.py
```

## Key Takeaways

- Reduce operands first; the result of `+`, `-`, `*` is the same.
- An inverse exists exactly when `gcd(a, m) = 1`.
- Keep the signs of the extended-gcd coefficients correct for negative inputs.
