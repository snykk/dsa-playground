# Modular Arithmetic Tricks (Go)

Go implementation of modular arithmetic techniques.

## Functions

- `mod(x, m)` - Safe modulo operation
- `add(a, b, m)` - Modular addition
- `sub(a, b, m)` - Modular subtraction
- `mul(a, b, m)` - Modular multiplication
- `power(base, exp, m)` - Fast modular exponentiation
- `modInverse(a, m)` - Modular inverse (Fermat's)
- `extGCD(a, b)` - Extended Euclidean Algorithm
- `NewFactorials(n, m)` - Precomputed factorials
- `NCr(n, r)` - Combinations
- `NPr(n, r)` - Permutations

## Usage

```go
fact := NewFactorials(1000, MOD)
fmt.Println(fact.NCr(10, 3))
```

