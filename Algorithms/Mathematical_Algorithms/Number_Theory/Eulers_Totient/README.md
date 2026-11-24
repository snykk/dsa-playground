# Euler's Totient

Euler's totient `phi(n)` counts the integers `k` from 1 to `n` with `gcd(k, n) = 1`. For one number it comes from the prime factorization: factor `n` by trial division in O(sqrt n), then `phi(n) = n * (1 - 1/p1) * ... * (1 - 1/pr)` over its distinct primes. For every number up to `n` at once, the linear sieve gives `phi`, the smallest prime factor and the list of primes in O(n), crossing out each composite exactly once. Euler's theorem, `a^phi(n) = 1 (mod n)` when `gcd(a, n) = 1`, turns `phi` into a modular inverse: `a^(phi(n) - 1) mod n`.

The [Sieve of Eratosthenes](../Sieve_of_Eratosthenes/) lists primes in O(n log log n); the linear sieve here is its O(n) variant. [Precomputation](../../../../Utilities/Optimization_Techniques/Precomputation/) keeps the smallest-prime-factor table and factorizes with it in O(log x).

## Intuition

Among `1..n`, a fraction `1/p` are multiples of a prime `p`. If `n = 12`, the multiples of 2 are 6 numbers and the multiples of 3 are 4, and 2 numbers are multiples of both; inclusion-exclusion leaves `12 - 6 - 4 + 2 = 4` numbers that share no factor with 12 (1, 5, 7, 11). The same count is `12 * (1 - 1/2) * (1 - 1/3) = 4`: for coprime `m` and `n`, a number is coprime to `mn` exactly when it is coprime to both, and by the Chinese Remainder Theorem the residues modulo `m` and modulo `n` combine independently. That is **multiplicativity**: `phi(mn) = phi(m) * phi(n)` when `gcd(m, n) = 1`. With `phi(p^k) = p^k - p^(k-1)` (the multiples of `p` among `1..p^k` are `p^(k-1)` numbers) the product formula follows.

The linear sieve rests on one fact: every composite `m` is `p * i` for exactly one pair with `p` = the smallest prime factor of `m` and `p <= spf(i)`. The sieve visits each `i` once and crosses out `i * p` only for the primes `p <= spf(i)`, so it reaches every composite once. `phi(i * p)` follows from `phi(i)` in O(1): `phi(i) * p` when `p` divides `i`, `phi(i) * (p - 1)` when it does not.

## Visual

`linear_sieve(30)`. `spf` is the smallest prime factor, and a composite is crossed out as `i x p` with `p = spf`:

```text
x        2    3    4    5    6    7    8    9   10   11   12   13   14   15   16
spf      2    3    2    5    2    7    2    3    2   11    2   13    2    3    2
phi      1    2    2    4    2    6    4    6    4   10    4   12    6    8    8
by     prime prime 2x2 prime 3x2 prime 4x2 3x3  5x2 prime 6x2 prime 7x2  5x3  8x2

x       17   18   19   20   21   22   23   24   25   26   27   28   29   30
spf     17    2   19    2    3    2   23    2    5    2    3    2   29    2
phi     16    6   18    8   12   10   22    8   20   12   18   12   28    8
by     prime 9x2 prime 10x2 7x3 11x2 prime 12x2 5x5 13x2 9x3 14x2 prime 15x2
```

19 composites, 19 crossings. The Sieve of Eratosthenes writes 24 crossings up to 30 (12, 18, 24 and 30 are crossed out by 2 and by 3, and 30 by 5 too), and 2,122,048 up to 10^6 against 921,501 composites.

## How It Works

### phi(n) by trial division (`prime_factors`, `phi`)

1. Raise `ValueError` for `n < 1`: `phi(0)` is undefined.
2. For `p = 2, 3, 4, ...` while `p <= n // p` (that is, `p * p <= n` for what is left of `n`): divide `p` out of `n` as often as it goes; if it went `k >= 1` times, record `(p, k)`.
3. If what is left is above 1, it is one prime larger than the square root of what was left: record `(n, 1)`.
4. `phi` starts with `result = n` and, for each distinct prime `p`, does `result -= result // p`, which is `result * (1 - 1/p)` exactly: `p` divides `n`, and no earlier step removed it.

A composite candidate such as 4 never divides what is left, because its prime factors were divided out before it. The factors come out with `p` increasing. `prime_factors(1)` is empty and `phi(1) = 1`.

### The linear sieve (`linear_sieve`)

1. `phi = [0] * (n + 1)`, `spf = [0] * (n + 1)`, `primes = []`, and `phi[1] = 1` when `n >= 1`. Index 0 holds 0 in both tables (`phi(0)` is undefined), and `spf[1] = 0` (1 has no prime factor).
2. For `i = 2 .. n`:
   1. If `spf[i] == 0`, nothing crossed `i` out, so `i` is prime: `spf[i] = i`, `phi[i] = i - 1`, append it to `primes`.
   2. For each `p` in `primes`, in increasing order: stop if `p > spf[i]` or `p > n // i` (that is, `i * p > n`). Otherwise cross out `m = i * p`: `spf[m] = p`, and `phi[m] = phi[i] * p` if `p == spf[i]`, else `phi[i] * (p - 1)`. Count it in `crossings`.
3. Return `TotientSieve(phi, spf, primes, crossings)`.

Why `p > spf[i]` stops the loop: for such a `p`, `spf[i] < p` divides `i * p`, so `p` is not its smallest prime factor; that number is crossed out later, by `i' = (i * p) / spf[i]`. Every composite is crossed out once, so `crossings` ends equal to the number of composites up to `n`, which is `n - 1 - len(primes)` for `n >= 1`.

### Euler's theorem and the inverse (`mod_inverse_euler`)

If `gcd(a, n) = 1`, multiplying the `phi(n)` residues coprime to `n` by `a` only reorders them, so their product times `a^phi(n)` equals their product, and `a^phi(n) = 1 (mod n)`. Then `a * a^(phi(n) - 1) = 1`, so `a^(phi(n) - 1) mod n` is the inverse of `a`. For a prime `n` this is Fermat's `a^(n - 2)`. When `gcd(a, n) > 1` no power of `a` is 1 modulo `n`, and there is no inverse.

`mod_inverse_euler(a, n)` reduces `a` modulo `n`, raises `ValueError` if `n < 1` or `gcd(a, n) != 1`, and returns `pow(a, phi(n) - 1, n)`. Modulo 1 every number is 0, so the answer for `n = 1` is 0. The tests compare it with the extended Euclidean inverse for every `n` up to 400.

### The 64-bit limits

- **The loop test.** C++ and Go take `n` as an unsigned 64-bit integer, so the largest `n` is 2^64 - 1. `p * p <= n` would wrap around once `p` reaches 2^32 and keep the loop going; `p <= n / p` cannot overflow. All three languages write it that way.
- **The result.** `phi(n) <= n`, and `result -= result / p` never forms anything larger than `result`. Computing `result * (p - 1) / p` instead would overflow.
- **The time.** A prime near 2^64 makes trial division try about 2^32 candidates: 8 s in C++ and Go on the machine these numbers were measured on, and roughly 15 to 25 minutes in Python (0.2 to 0.35 microseconds per candidate). Numbers whose second-largest prime factor is small finish fast: `phi(2^64 - 1)` tries 65,536 candidates.
- **Modular products.** The inverse multiplies residues up to `n - 1`, and the product of two of them needs 128 bits: `mulMod` multiplies in `unsigned __int128` in C++, `MulMod` uses `bits.Mul64` and `bits.Rem64` in Go, and Python's `pow` has no limit.
- **The sieve.** Its tables hold `int` values (`phi[i] <= i <= n`). The test `i * p > n` is written `p > n // i`, because `i * p` reaches `2n`, past `INT_MAX` in C++ once `n` is above about 2^30.

### Errors

| Input | Python | C++ | Go |
|-------|--------|-----|----|
| `n = 0` for `prime_factors`, `phi` or as the modulus of the inverse | `ValueError` (also for a negative `n`) | `std::invalid_argument` | an error wrapping `ErrZero` |
| a negative sieve limit | `ValueError` | `std::invalid_argument` | an error wrapping `ErrNegativeLimit` |
| `gcd(a, n) != 1` in the inverse | `ValueError` | `std::invalid_argument` | an error wrapping `ErrNotCoprime` |

C++ and Go take `n` and `a` unsigned, so they cannot even be passed a negative number; Python reduces a negative `a` modulo `n`.

## Step-by-Step Trace

`phi(360)`:

| Candidate p | Test `p <= n // p` | What is left of n | Factor | result |
|-------------|--------------------|-------------------|--------|--------|
| | | 360 | | 360 |
| 2 | 2 <= 180 | 45 | (2, 3) | 360 - 180 = 180 |
| 3 | 3 <= 15 | 5 | (3, 2) | 180 - 60 = 120 |
| 4 | 4 <= 1 fails | 5 | | |
| (left over) | | 1 | (5, 1) | 120 - 24 = 96 |

Two candidates, and `phi(360) = 360 * 1/2 * 2/3 * 4/5 = 96`. The divisor sum checks it: the 24 divisors of 360 have `phi` values that add up to 360.

`linear_sieve(20)`, every `i` that crosses something out:

| i | spf[i] | phi[i] | Crosses out | phi of it | Why it stops |
|---|--------|--------|-------------|-----------|--------------|
| 2 | 2 (prime) | 1 | 4 = 2x2 | 1 * 2 = 2 | no more primes in the list |
| 3 | 3 (prime) | 2 | 6 = 3x2, 9 = 3x3 | 2 * 1 = 2, 2 * 3 = 6 | no more primes in the list |
| 4 | 2 | 2 | 8 = 4x2 | 2 * 2 = 4 | 3 > spf[4] |
| 5 | 5 (prime) | 4 | 10 = 5x2, 15 = 5x3 | 4 * 1 = 4, 4 * 2 = 8 | 5 > 20 // 5 = 4 |
| 6 | 2 | 2 | 12 = 6x2 | 2 * 2 = 4 | 3 > spf[6] |
| 7 | 7 (prime) | 6 | 14 = 7x2 | 6 * 1 = 6 | 3 > 20 // 7 = 2 |
| 8 | 2 | 4 | 16 = 8x2 | 4 * 2 = 8 | 3 > spf[8] |
| 9 | 3 | 6 | 18 = 9x2 | 6 * 1 = 6 | 3 > 20 // 9 = 2 |
| 10 | 2 | 4 | 20 = 10x2 | 4 * 2 = 8 | 3 > spf[10] |

From `i = 11` on, `2 > 20 // i`, so nothing more is crossed out; 11, 13, 17 and 19 are found prime because `spf[i]` is still 0. 11 crossings for the 11 composites up to 20.

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| `prime_factors(n)`, `phi(n)` | O(sqrt n) candidates in the worst case (`n` prime); fewer when `n` has small factors | O(log n) for the factors |
| `linear_sieve(n)` | O(n): one crossing per composite, plus one failed test per `i` | O(n): two tables of `n + 1` and the primes |
| `mod_inverse_euler(a, n)` | O(sqrt n) for `phi(n)` plus O(log n) multiplications | O(log n) |

Counted with the Python code: trial division never tried more than `isqrt(n) - 1` candidates for any `n` up to 20,000; a prime `p` tries exactly `2 .. isqrt(p)`, and `2^k` tries one candidate, because the bound shrinks with what is left. The linear sieve crossed out every composite exactly once for every limit tested up to 65,536, and made 921,501 crossings up to 10^6, one per composite, against 2,122,048 writes for the Sieve of Eratosthenes. In Python `linear_sieve(10^6)` took 0.36 s and `linear_sieve(10^7)` 3.9 s.

## When to Use

- `phi` of one or a few numbers up to about 10^12 in Python, or up to 2^64 - 1 in C++ and Go when the number has no two large prime factors.
- `phi` of every number up to a limit of about 10^7: counting reduced fractions, coprime pairs, sums of gcds through `sum of phi(d) over d | n = n`.
- An inverse modulo `n` when `phi(n)` is known anyway, as `p - 1` is for a prime: `a^(p - 2)` is the usual way contest code divides modulo a prime.
- Reducing a huge exponent: `a^e = a^(e mod phi(n)) (mod n)` when `gcd(a, n) = 1`.
- Not for factoring a 64-bit number with two large prime factors: trial division needs up to 2^32 candidates; Pollard's rho (not in this repository) needs about `n^(1/4)`. Not for a single inverse modulo a composite: the [extended Euclidean algorithm](../Euclidean_Algorithm/) needs no factoring.

## Euler's Totient vs. Alternatives

| Method | Time | Gives | Notes |
|--------|------|-------|-------|
| Count `gcd(k, n) = 1` directly | O(n log n) | one `phi(n)` | the definition; the tests use it |
| Trial division + product formula (here) | O(sqrt n) | one `phi(n)` and the factorization | fine up to about 10^12 in Python |
| Linear sieve (here) | O(n) | `phi`, `spf` and primes up to `n` | each composite crossed out once |
| Eratosthenes-style totient sieve | O(n log log n) | `phi` up to `n` | `phi[j] -= phi[j] / p` for every multiple `j` of every prime `p` |
| Pollard's rho + Miller-Rabin | about `n^(1/4)` | one `phi(n)` for huge `n` | not in this repository |
| Inverse by extended Euclid | O(log n) | the inverse only | no factoring; see Euclidean Algorithm |

## Common Pitfalls

- **`p * p <= n` in 64 bits.** It wraps around for `n` near 2^64; write `p <= n / p`.
- **`result * (p - 1) / p`.** Overflows for large `n`; use `result -= result / p` or `result / p * (p - 1)`.
- **Forgetting the last factor.** After the loop, what is left above 1 is a prime; without it `phi(2 * 101)` comes out as 101 instead of 100.
- **Calling `phi(0)`.** It is undefined; the code raises instead of returning 0 or 1.
- **The wrong rule in the sieve.** `phi(i * p) = phi(i) * phi(p)` only when `p` does not divide `i`; when it does, the factor is `p`, not `p - 1`.
- **Dropping the `p > spf[i]` break.** The tables stay right if later writes overwrite earlier ones, but composites are crossed out several times and the sieve is no longer linear.
- **Euler's theorem without `gcd(a, n) = 1`.** `2^phi(4) = 4 = 0 (mod 4)`, not 1. Reducing an exponent modulo `phi(n)` needs the gcd condition too.
- **`a^phi(n) = 1` for `n = 1`.** Every number is 0 modulo 1, so compare with `1 % n`.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `eulers_totient.py` | `prime_factors`, `phi`, `linear_sieve` (a `TotientSieve` named tuple), `mod_inverse_euler`; any `n`; the helpers `_divide_out` and `_cross_out` sit at module level so the tests can count the work |
| C++ | [C++/](C++/) | `eulers_totient.cpp` | `primeFactors`, `phi`, `linearSieve`, `modInverseEuler`, `mulMod`, `powMod`; `uint64_t` up to 2^64 - 1; `unsigned __int128` products |
| Go | [Go/](Go/) | `main.go` | `PrimeFactors`, `Phi`, `LinearSieve`, `ModInverseEuler`, `MulMod`, `PowMod`; `uint64`; errors instead of exceptions |

The three give the same answers on the same input: the factors come out with the primes increasing, and the C++ and Go tests pin 31 values of `phi`, 8 factorizations, 11 inverses and the tables of `linear_sieve(30)`, all computed by the Python code.

## Practice Problems

- [Euler Totient Function (SPOJ ETF)](https://www.spoj.com/problems/ETF/): `phi(n)` for many `n` up to 10^6, by trial division or from the sieve.
- [Exponentiation II (CSES 1712)](https://cses.fi/problemset/task/1712): `a^(b^c)` modulo a prime, reducing `b^c` modulo `phi(p) = p - 1`.
- [Same GCDs (Codeforces 1295D)](https://codeforces.com/problemset/problem/1295/D): the answer is `phi(m / gcd(a, m))` for `m` up to 10^10.
- [Sum of gcd of Tuples (Hard) (AtCoder ABC162 E)](https://atcoder.jp/contests/abc162/tasks/abc162_e): write each gcd as the sum of `phi(d)` over its divisors and count by `d`.
- [The Holmes Children (Codeforces 776E)](https://codeforces.com/problemset/problem/776/E): `f` is `phi`, the divisor sum `g(n)` is `n`, and `phi` is applied again and again to `n` up to 10^12.

## Related

- [Sieve of Eratosthenes](../Sieve_of_Eratosthenes/): the O(n log log n) sieve this one improves on; read first.
- [Euclidean Algorithm](../Euclidean_Algorithm/): gcd, and the extended form whose inverse needs no factoring.
- [Modular Exponentiation](../Modular_Exponentiation/): the square-and-multiply behind `a^(phi(n) - 1)`.
- [Modular Arithmetic](../Modular_Arithmetic/): inverses and products modulo `m`, with 128-bit products in C++ and Go.
- [Chinese Remainder Theorem](../Chinese_Remainder_Theorem/): why `phi` is multiplicative.
- [Precomputation](../../../../Utilities/Optimization_Techniques/Precomputation/): the smallest-prime-factor table and factorizing with it.
- [Modular Arithmetic Tricks](../../../../Utilities/Optimization_Techniques/Modular_Arithmetic_Tricks/): Fermat inverses, factorial tables and Lucas's theorem.
- [Inclusion-Exclusion Principle](../../../../Problem_Patterns/Inclusion_Exclusion_Principle/): the product formula as inclusion-exclusion over the primes.
- [Number Theory](../)
