# Modular Arithmetic Tricks

Counting problems ask for the answer modulo a prime such as 10^9 + 7, because the true value is far too large. A few tricks keep every step exact and fast: safe reduction, fast exponentiation, modular inverses, factorial tables for binomials, Lucas' theorem and the Chinese remainder theorem. Addition, subtraction and multiplication are O(1), a power is O(log e), and a binomial coefficient is O(1) after an O(n) setup.

## Intuition

Reduction respects addition and multiplication: `(a + b) mod m = ((a mod m) + (b mod m)) mod m`, and the same for products. So every intermediate value can be reduced at once and never exceeds `m^2`, however large the true number is. Division is the exception: `a / b` only exists modulo `m` when `b` has an inverse, so a division becomes a multiplication by the inverse.

## Visual

```text
3^13 mod 1000, 13 = 1101 in binary (lowest bit first)

bit:            1    0    1    1
3^(2^i) mod m:  3    9    81   561      (each is the square of the previous)
used?           yes  no   yes  yes
result:         3         243  323      (3, then 3*81, then 243*561 = 136323 -> 323)
```

## How It Works

1. **Safe reduction:** `mod(x, m) = ((x % m) + m) % m`. The extra `+ m` is needed in C++ and Go, whose `%` can be negative; Python's `%` is already non-negative.
2. **Multiplication:** reduce both factors, multiply, reduce. For `m = 10^9 + 7` the product fits in 64 bits. Above about 3e9 it does not; C++ uses `__int128` and Go uses `math/bits`, exact for moduli below 2^62. Python integers never overflow.
3. **Power:** square the base and multiply it into the result for each set bit of the exponent. `power(x, 0, 1)` is 0 (everything is 0 modulo 1).
4. **Inverse:** Fermat, `a^(m-2)`, needs a prime `m` and `a` not a multiple of `m`. The extended Euclidean algorithm works for any `m` with `gcd(a, m) = 1` and returns -1 when there is no inverse.
5. **Factorial tables:** `fact[i]` and `invFact[i]` in O(n) (one inverse, then a backward loop); `C(n, r) = fact[n] * invFact[r] * invFact[n-r]`.
6. **Lucas' theorem** (prime `p`, large `n`): `C(n, r) = C(n/p, r/p) * C(n%p, r%p) mod p`. C++ and Go compute the small binomial directly modulo `p`; Python reads it from a `Factorials(p - 1, p)` table and rejects any other table.
7. **Chinese remainder theorem (Python):** merges `x = r_i (mod m_i)` pairwise; the moduli may share factors. A system with no solution raises `ValueError`.

## Step-by-Step Trace

- `power(2, 100)` modulo 10^9 + 7 is 976371285; the inverse of 3 is 333333336 (3 * 333333336 = 1,000,000,008 = 1 mod 10^9 + 7).
- Lucas: `C(100, 37) mod 37`. `100 = 2*37 + 26` and `37 = 1*37 + 0`, so the result is `C(2, 1) * C(26, 0) = 2`.
- CRT: `chinese_remainder([2, 3, 2], [3, 5, 7])` is 23. With shared factors, `x = 1 (mod 2)` and `x = 3 (mod 4)` give 3, while `x = 1 (mod 2)` and `x = 2 (mod 4)` have no solution.

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| `mod`, `add`, `sub`, `mul` | O(1) | O(1) |
| `power` | O(log e) | O(1) |
| inverse (Fermat or extended Euclid) | O(log m) | O(1) / O(log m) |
| factorial tables | O(n) | O(n) |
| `nCr`, `nPr` with tables | O(1) | O(1) |
| Lucas, C++ and Go | O(p) per base-p digit of n | O(log_p n) |
| Lucas, Python | O(1) per digit (table lookups) | O(log_p n) |
| `chinese_remainder` | O(k log M) | O(k) |

## When to Use

Use these whenever a statement says "modulo 10^9 + 7" or similar, or an exact count would exceed 64 bits. Do not use Fermat for a composite modulus, and do not use factorial tables when `n` is at least the modulus (use Lucas).

## Modular Tricks vs. Alternatives

| Need | Tool here | Alternative |
|------|-----------|-------------|
| huge counts | modular arithmetic | big integers (slow, memory-hungry) |
| inverse, prime modulus | Fermat | extended Euclid (also works for composites) |
| binomials, `n` below the prime | factorial tables | Pascal's triangle (O(n^2)) |
| binomials, `n` above the prime | Lucas | not available with plain tables |
| n-th term of a recurrence | [Matrix Exponentiation](../../../Algorithms/Mathematical_Algorithms/Advanced_Math/Matrix_Exponentiation/README.md) | a loop, if n is small |

## Common Pitfalls

1. **Negative remainders** in C++ and Go: add the modulus before the final `%`.
2. **Product overflow** with a large modulus: use `mul`, which goes through 128 bits in C++ and Go.
3. **Fermat with a composite modulus** returns a wrong value silently.
4. **Inverse of a multiple of `m`** does not exist; Fermat gives 0.
5. **Lucas with the wrong tables:** the small binomials must be computed modulo `p`. An earlier C++ version used tables built for 10^9 + 7 and returned 3 for `C(36, 18) mod 37` (the true value is 1).
6. **CRT with shared factors:** the plain formula needs coprime moduli; the generalised merge handles shared factors and detects inconsistent systems.
7. **`power(x, 0, 1)`** is 0, not 1.
8. **C++ `nCr` before `precompute()`:** the tables are zeros until it runs.
9. **Parity:** Go has no CRT and no matrix power, and C++ has no CRT and no matrix power; only Python has all of them.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `modular_tricks.py` | `Factorials` class, `lucas_nCr`, generalised `chinese_remainder`, `matrix_power`, `fibonacci` |
| C++ | [C++/](C++/) | `modular_tricks.cpp` | global tables and `precompute()`, `lucasNCr` without tables, `mulmod`, `mulmodSlow` |
| Go | [Go/](Go/) | `main.go` | unexported helpers, `Factorials`, `divMod`, `lucasNCr` |

## Practice Problems

- [Exponentiation (CSES)](https://cses.fi/problemset/task/1095)
- [Binomial Coefficients (CSES)](https://cses.fi/problemset/task/1079)
- [Creating Strings II (CSES)](https://cses.fi/problemset/task/1715)
- [Pow(x, n) (LeetCode 50)](https://leetcode.com/problems/powx-n/)
- Compute `C(10^18, 5)` modulo 10^9 + 7 without factorial tables up to 10^18.

## Related

- [Modular Arithmetic](../../../Algorithms/Mathematical_Algorithms/Number_Theory/Modular_Arithmetic/README.md)
- [Modular Exponentiation](../../../Algorithms/Mathematical_Algorithms/Number_Theory/Modular_Exponentiation/README.md)
- [Chinese Remainder Theorem](../../../Algorithms/Mathematical_Algorithms/Number_Theory/Chinese_Remainder_Theorem/README.md)
- [Euclidean Algorithm](../../../Algorithms/Mathematical_Algorithms/Number_Theory/Euclidean_Algorithm/README.md)
- [Precomputation](../Precomputation/README.md)
