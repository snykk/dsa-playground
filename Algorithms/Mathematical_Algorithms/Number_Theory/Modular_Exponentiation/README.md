# Modular Exponentiation

Modular exponentiation computes `base^exponent mod m` with binary exponentiation (square and multiply): it squares the base once per bit of the exponent and multiplies the answer in whenever the bit is 1. That is `O(log exponent)` multiplications instead of `exponent - 1`, and every number stays below `m`.

## Intuition

Write the exponent in binary: `13 = 1101`, so `5^13 = 5^8 * 5^4 * 5^1`. The powers `5^1, 5^2, 5^4, 5^8, ...` come from repeated squaring, and the multiplication only keeps those whose bit is set. Because `(a * b) mod m` can be reduced at any moment, no intermediate value ever exceeds `m - 1`.

Invariant: before each step, `result * base^exponent = original base^original exponent (mod m)`.

## Visual

`5^13 mod 11`, bits of 13 read from the lowest one:

```text
bit i              : 1    0    1    1        (13 = 1101 in binary)
base^(2^i) mod 11  : 5    3    9    4        (each is the square of the one before)
result after bit i : 5    5    1    4        (multiply in the base where bit = 1)
                                       -> 5^13 mod 11 = 4
```

## How It Works

1. If `m = 1`, the answer is 0. Otherwise start with `result = 1` and `base = base mod m`.
2. While `exponent > 0`:
   1. If the exponent is odd, `result = result * base mod m`.
   2. `base = base * base mod m`.
   3. `exponent = exponent / 2` (a shift).
3. Return `result`.

A negative exponent means the inverse power: `base^(-e) = (base^-1)^e`. The code computes the inverse of `base` modulo `m` first and returns `None` (Python) or `-1` (C++ and Go) when it does not exist. A negative base is reduced into `0 .. m-1` first. Python also has `mod_pow_recursive`, which halves the exponent on even steps and peels one factor on odd steps.

## Step-by-Step Trace

`mod_pow(5, 13, 11)`:

| `i` | exponent bit | `base` (before squaring) | `result` after |
|-----|--------------|--------------------------|----------------|
| 0 | 1 | 5 | 5 |
| 1 | 0 | 3 | 5 |
| 2 | 1 | 9 | 1 |
| 3 | 1 | 4 | 4 |

The answer is 4: 4 squarings and 3 multiplications, against 12 multiplications for the naive loop. `mod_pow(2, 10, 1000)` goes `result = 1, 1, 4, 4, 24` over bits 0, 1, 0, 1 and returns 24.

## Complexity

| Version | Time | Space |
|---------|------|-------|
| iterative (`mod_pow`, `modPow`, `ModPow`) | O(log e) multiplications | O(1) |
| recursive (`mod_pow_recursive`) | O(log e) multiplications | O(log e) stack |

At most `2 * floor(log2 e) + 2` multiplications, each followed by one reduction.

## When to Use

- Any power modulo `m` with a huge exponent: RSA, Diffie-Hellman, Fermat and Euler inverses, primality tests.
- Inside Miller-Rabin and Fermat tests, and for `a^(p-2) mod p`.
- For linear recurrences, use the matrix version of the same idea (see Matrix Exponentiation).
- Not needed for tiny exponents, where a plain loop is as fast.

## Modular Exponentiation vs. Alternatives

| Method | Multiplications | Notes |
|--------|-----------------|-------|
| Naive loop | `e - 1` | hopeless for `e = 10^18` |
| Square and multiply (this code) | at most about `2 log2 e` | the standard method |
| Built-in `pow(b, e, m)` (Python) | about the same | prefer it in Python code |
| Compute `b^e` fully, then reduce | one huge number | memory and time explode |

## Common Pitfalls

- Overflow: `(result * base) % m` in 64-bit arithmetic is wrong once `m` is above about 3.04e9. This code multiplies in 128 bits in C++ (`__int128`) and Go (`math/bits`).
- Negative base in C++ and Go: `%` keeps the sign, so `-2 % 5 = -2`. The code reduces the base into `0 .. m-1` first.
- Forgetting the `m = 1` case (the answer is 0, not 1) and `0^0 = 1`.
- A negative exponent is not "no iterations": it needs an inverse, and no inverse exists when `gcd(base, m) != 1`.
- Reducing the exponent modulo `m` is wrong in general (use `phi(m)` and only for coprime base).

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `modular_exponentiation.py` | iterative and recursive versions, plus `mod_inverse` |
| C++ | [C++](C++/) | `modular_exponentiation.cpp` | `modPow`, `modInverse`; `__int128` products |
| Go | [Go](Go/) | `main.go` | `ModPow`, `ModInverse`; `math/bits` products |

## Practice Problems

- [Exponentiation (CSES)](https://cses.fi/problemset/task/1095)
- [Exponentiation II (CSES)](https://cses.fi/problemset/task/1712): the exponent is itself a power; with a prime modulus, Fermat lets you reduce it modulo `m - 1`.
- [Pow(x, n) (LeetCode 50)](https://leetcode.com/problems/powx-n/): the same idea with real numbers.
- [Super Pow (LeetCode 372)](https://leetcode.com/problems/super-pow/)

## Related

- [Modular Arithmetic](../Modular_Arithmetic/README.md)
- [Miller-Rabin Primality Test](../Miller_Rabin_Primality_Test/README.md)
- [Matrix Exponentiation](../../Advanced_Math/Matrix_Exponentiation/README.md)
- [Euclidean Algorithm](../Euclidean_Algorithm/README.md)
