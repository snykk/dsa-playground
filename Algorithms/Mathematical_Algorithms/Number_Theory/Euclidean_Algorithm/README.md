# Euclidean Algorithm

The Euclidean algorithm computes the greatest common divisor `gcd(a, b)` by repeatedly replacing `(a, b)` with `(b, a mod b)` until the second number is 0. It takes `O(log min(a, b))` steps. The extended version also returns the Bezout coefficients `x` and `y` with `a*x + b*y = gcd(a, b)`, which is the tool behind modular inverses and the Chinese Remainder Theorem.

## Intuition

A common divisor of `a` and `b` also divides `a - k*b` for any integer `k`, and the other way round. So `a` and `b` have exactly the same common divisors as `b` and `a mod b`. The pair gets smaller at every step, and when the remainder reaches 0 the other number divides everything that came before it.

Invariant: `gcd(a, b) = gcd(b, a mod b)` at every step.

## Visual

Tiling a 48 x 18 rectangle with the largest possible squares mirrors the algorithm. Each quotient is how many squares of the current size fit, and the last square size is the gcd.

```text
48 x 18:  2 squares of 18 x 18, leaving 12 x 18
18 x 12:  1 square  of 12 x 12, leaving  6 x 12
12 x  6:  2 squares of  6 x  6, leaving nothing   -> gcd = 6
```

## How It Works

1. If `b = 0`, the answer is `|a|`.
2. Otherwise replace `(a, b)` by `(b, a mod b)` and repeat.

Extended version: run the same steps on `|a|` and `|b|` recursively; the last call returns `(g, 1, 0)`, and each call on the way back turns the `(x1, y1)` it got into `(y1, x1 - (a / b) * y1)`. For negative inputs, negate `x` when `a < 0` and `y` when `b < 0`. LCM follows from `lcm(a, b) = |a| / gcd(a, b) * |b|`.

## Step-by-Step Trace

`gcd(240, 46)` with the extended coefficients; each remainder `r` equals `240*x + 46*y` (the code back-substitutes instead of keeping this table, and reaches the same final pair):

| `r` | quotient | `x` | `y` |
|-----|----------|-----|-----|
| 240 | | 1 | 0 |
| 46 | | 0 | 1 |
| 10 | 5 | 1 | -5 |
| 6 | 4 | -4 | 21 |
| 4 | 1 | 5 | -26 |
| 2 | 1 | -9 | 47 |
| 0 | 2 | | |

So `gcd(240, 46) = 2` and `240*(-9) + 46*47 = 2`. `extended_gcd(-240, 46)` returns `(2, 9, 47)`: `-240*9 + 46*47 = 2`.

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| `gcd` (recursive) | O(log min(a, b)) | O(log min(a, b)) stack |
| `gcd_iterative` | O(log min(a, b)) | O(1) |
| `lcm` | O(log min(a, b)) | O(log min(a, b)) stack (it calls the recursive `gcd`) |
| `extended_gcd` | O(log min(a, b)) | O(log min(a, b)) stack |

Why logarithmic: after two steps the larger number is less than half of what it was (`a mod b < a / 2` whenever `a >= b`). Lame's theorem sharpens this: the number of steps never exceeds five times the number of decimal digits of the smaller input. The worst case is two consecutive Fibonacci numbers: `gcd(89, 55)` needs 9 division steps.

## When to Use

- Reducing fractions, computing lcm, checking coprimality.
- Modular inverses and congruences (through `extended_gcd`).
- Solving `a*x + b*y = c` (solvable exactly when `gcd(a, b)` divides `c`).
- Not for prime factorization: gcd does not find factors by itself.

## Euclidean Algorithm vs. Alternatives

| Method | Time | Notes |
|--------|------|-------|
| Euclid (modulo) | O(log n) | the default |
| Subtraction only | O(n) | `gcd(10^9, 1)` takes 10^9 steps |
| Binary GCD (Stein) | O(log n) | uses shifts instead of division; not in this repository |
| Prime factorization | far slower | gives all divisors, not just the gcd |

## Common Pitfalls

- `lcm` as `a * b / gcd`: the product can overflow even when the lcm fits. Divide first: `a / gcd * b`.
- An extended gcd that applies `abs` to its inputs but not to `x` and `y`: `a*x + b*y` then equals the gcd only for non-negative inputs.
- Taking `|x|` through floating point (`math.Abs`): it loses precision above 2^53.
- `gcd(0, 0)` is 0 (and `lcm` with a zero argument is 0): handle it before dividing by the gcd.
- The recursive versions use stack space of `O(log n)`; the iterative one uses none.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `euclidean_algorithm.py` | big integers; `gcd`, `gcd_iterative`, `lcm`, `extended_gcd` |
| C++ | [C++](C++/) | `euclidean_algorithm.cpp` | `long long`; lcm result must fit in `long long` |
| Go | [Go](Go/) | `main.go` | `int64`; integer-only absolute value |

## Practice Problems

- [Greatest Common Divisor of Strings (LeetCode 1071)](https://leetcode.com/problems/greatest-common-divisor-of-strings/)
- [Find Greatest Common Divisor of Array (LeetCode 1979)](https://leetcode.com/problems/find-greatest-common-divisor-of-array/)
- [Water and Jug Problem (LeetCode 365)](https://leetcode.com/problems/water-and-jug-problem/)
- [Number of Subarrays With GCD Equal to K (LeetCode 2447)](https://leetcode.com/problems/number-of-subarrays-with-gcd-equal-to-k/)

## Related

- [Modular Arithmetic](../Modular_Arithmetic/README.md)
- [Chinese Remainder Theorem](../Chinese_Remainder_Theorem/README.md)
- [Modular Exponentiation](../Modular_Exponentiation/README.md)
