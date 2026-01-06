# Modular Arithmetic Tricks (Python)

Python implementation of modular arithmetic techniques.

## Functions

- `mod(x, m)` - Safe modulo operation
- `add(a, b, m)` - Modular addition
- `sub(a, b, m)` - Modular subtraction
- `mul(a, b, m)` - Modular multiplication
- `power(base, exp, m)` - Fast modular exponentiation
- `mod_inverse(a, m)` - Modular inverse (Fermat's)
- `ext_gcd(a, b)` - Extended Euclidean Algorithm
- `Factorials` - Precomputed factorials class
- `nCr(n, r)` - Combinations
- `nPr(n, r)` - Permutations

## Usage

```python
fact = Factorials(1000)
print(fact.nCr(10, 3))
```

