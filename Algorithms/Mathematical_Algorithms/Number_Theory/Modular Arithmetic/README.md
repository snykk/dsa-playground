# Modular Arithmetic

Modular arithmetic works with remainders: numbers wrap around after reaching the modulus `m`, like hours on a clock. Addition, subtraction and multiplication are `O(1)`, powers take `O(log e)`, and division is done with a modular inverse found by the extended Euclidean algorithm in `O(log m)`. It keeps numbers small, which makes counting problems and cryptography possible.

## Intuition

`a = b (mod m)` means `a` and `b` differ by a multiple of `m`. Reducing early never changes the result of `+`, `-` and `*`:

- `(a + b) mod m = ((a mod m) + (b mod m)) mod m`
- `(a * b) mod m = ((a mod m) * (b mod m)) mod m`

Division is different: there is no "divide by 5 modulo 11" unless a number `x` exists with `5 * x = 1 (mod 11)`. Such an inverse exists exactly when `gcd(a, m) = 1`.

Invariant: every function here returns a residue in `0 .. m-1`, also for negative inputs (`-3 mod 11 = 8`).

## Visual

Wrapping integers around a clock of 11 ticks: every number that differs from 8 by a multiple of 11, including `-3`, lands on tick 8.

```text
 ... -14  -3   8   19   30 ...     (all = 8 mod 11)
       |    |   |    |    |
       +----+---+----+----+--->  residue 8
```

Multiplication table modulo 7: every row of a non-zero number contains exactly one 1, which marks its inverse (the 1s in the pairs 2 and 4, 3 and 5, and on the diagonal for 1 and 6).

```text
  * | 1 2 3 4 5 6
 ---+------------
  1 | 1 2 3 4 5 6
  2 | 2 4 6 1 3 5
  3 | 3 6 2 5 1 4
  4 | 4 1 5 2 6 3
  5 | 5 3 1 6 4 2
  6 | 6 5 4 3 2 1
```

## Operations

1. `mod_add`, `mod_subtract`, `mod_multiply`: reduce both operands into `0 .. m-1`, combine, reduce again. C++ and Go compare against `m - y` instead of adding, and multiply in 128 bits, so a modulus up to the largest 64-bit integer is safe.
2. `mod_inverse(a, m)`: run extended Euclid on `(a, m)`: `a*x + m*y = g`. If `g = 1`, then `x mod m` is the inverse; otherwise no inverse exists (`None` in Python, `-1` in C++ and Go).
3. `mod_divide(a, b, m)`: `a * mod_inverse(b, m) mod m`, or no-inverse if `gcd(b, m) != 1`.
4. `mod_power(base, e, m)`: binary exponentiation. A negative exponent means the inverse power: `mod_power(2, -1, 11) = 6`.

## Step-by-Step Trace

Modulo 11:

| Expression | Work | Result |
|------------|------|--------|
| `(7 + 5) mod 11` | 12 - 11 | 1 |
| `(7 - 5) mod 11` | 2 | 2 |
| `(3 - 5) mod 11` | -2 + 11 | 9 |
| `(7 * 5) mod 11` | 35 - 33 | 2 |
| `inverse of 5` | `5 * 9 = 45 = 1 (mod 11)` | 9 |
| `7 / 5` | `7 * 9 = 63 = 8 (mod 11)` | 8 |
| `inverse of -3` | `-3 = 8`; `8 * 7 = 56 = 1 (mod 11)` | 7 |
| `2^5 mod 11` | 32 - 22 | 10 |

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| add, subtract, multiply | O(1) | O(1) |
| `mod_inverse`, `mod_divide` | O(log min(a, m)) | O(log m) recursion |
| `mod_power` | O(log e) multiplications | O(1) |

## When to Use

- Counting problems whose answer is asked "modulo 10^9 + 7".
- Hashing, checksums, cyclic indices and cryptography.
- Not for exact large values you need in full: Python integers already give those; use modular arithmetic when only the remainder matters.

## Modular Arithmetic vs. Alternatives

| Approach | Notes |
|----------|-------|
| Reduce at every step (this code) | numbers stay below `m`; works for `+`, `-`, `*`, powers |
| Big integers, reduce at the end | exact but slow and memory-hungry |
| Fermat inverse `a^(m-2)` | inverse for a prime modulus `m` only (needs `gcd(a, m) = 1`) |
| Extended Euclid inverse | any modulus, any `a` coprime to it (this code) |

## Common Pitfalls

- Negative operands: `%` in C++ and Go keeps the sign of the dividend, so `-3 % 11 = -3`. Normalize with `((a % m) + m) % m` or `floorMod`.
- Overflow: `(a * b) % m` in 64-bit arithmetic is wrong once `m` is above about 3.04e9; use a 128-bit product.
- Forgetting the existence condition for an inverse. Fermat's little theorem `a^(p-1) = 1 (mod p)` needs `p` prime and `p` not dividing `a`; Euler's theorem `a^phi(n) = 1 (mod n)` needs `gcd(a, n) = 1`.
- Using `-1` as the "no inverse" sentinel in C++ and Go and then dividing a number that legitimately reduces to a negative residue: all results here are non-negative, so `-1` is unambiguous.
- Applying `abs` inside the extended gcd without fixing the signs of its coefficients (it gave `mod_inverse(-3, 11) = 4`).

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `modular_arithmetic.py` | big integers, `None` for no inverse; also exports `extended_gcd` |
| C++ | [C++](C++/) | `modular_arithmetic.cpp` | `__int128` products, `-1` for no inverse |
| Go | [Go](Go/) | `main.go` | `math/bits` products, `-1` for no inverse |

## Practice Problems

- [Exponentiation (CSES)](https://cses.fi/problemset/task/1095)
- [Binomial Coefficients (CSES)](https://cses.fi/problemset/task/1079): needs modular inverses of factorials.
- [Count All Valid Pickup and Delivery Options (LeetCode 1359)](https://leetcode.com/problems/count-all-valid-pickup-and-delivery-options/)
- Exercise: compute all inverses modulo 13 and check the table against `mod_inverse`.

## Related

- [Euclidean Algorithm](../Euclidean%20Algorithm/README.md)
- [Modular Exponentiation](../Modular%20Exponentiation/README.md)
- [Chinese Remainder Theorem](../Chinese%20Remainder%20Theorem/README.md)
