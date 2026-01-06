# Modular Arithmetic Tricks (C++)

C++ implementation of modular arithmetic techniques.

## Functions

- `mod(x, m)` - Safe modulo operation
- `add(a, b, m)` - Modular addition
- `sub(a, b, m)` - Modular subtraction
- `mul(a, b, m)` - Modular multiplication
- `power(base, exp, m)` - Fast modular exponentiation
- `modInverse(a, m)` - Modular inverse (Fermat's)
- `extGCD(a, b)` - Extended Euclidean Algorithm
- `Factorials` - Precomputed factorials class
- `nCr(n, r)` - Combinations
- `nPr(n, r)` - Permutations

## Usage

```cpp
Factorials fact(1000);
cout << fact.nCr(10, 3) << endl;
```

