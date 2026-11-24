# Sieve of Eratosthenes

The Sieve of Eratosthenes lists all primes up to `n`. It starts with every number marked prime, then for each prime `p` crosses out its multiples, starting at `p * p`. Whatever is not crossed out is prime. It runs in `O(n log log n)` time and `O(n)` memory, and afterwards "is `k` prime?" is an `O(1)` lookup.

## Intuition

A composite number has a prime factor at most its square root, so it is crossed out by a prime `p <= sqrt(n)`. The smallest multiple of `p` that no smaller prime has already crossed out is `p * p` (anything `p * k` with `k < p` has the smaller factor `k`). So the outer loop stops at `sqrt(n)` and the inner loop starts at `p * p`.

Invariant: when the outer loop reaches `i`, every composite that has a prime factor below `i` is already crossed out, so `i` is prime exactly when it is still marked.

## Visual

Numbers 1 to 50. Each composite is shown with the first prime that crosses it out; the rest are the primes.

```text
  1   2   3   4*  5   6*  7   8*  9^  10*
 11  12*  13  14* 15^ 16*  17  18*  19  20*
 21^ 22*  23  24* 25+ 26*  27^ 28*  29  30*
 31  32*  33^ 34* 35+ 36*  37  38*  39^ 40*
 41  42*  43  44* 45^ 46*  47  48*  49# 50*

 *  crossed out by 2      ^  by 3      +  by 5      #  by 7      1 is not prime
```

## How It Works

1. Create a list of `n + 1` flags, all true; set 0 and 1 to false.
2. For `i = 2, 3, ...` while `i * i <= n`:
   1. If `i` is still marked prime, set the flags of `i*i, i*i + i, i*i + 2i, ...` (up to `n`) to false.
3. The indices that are still true are the primes.

The functions: `sieve_of_eratosthenes(n)` returns the list of primes, `sieve_boolean(n)` returns the flag list, and `is_prime_sieve(k, sieve)` looks up `k` (false for a negative `k` or one beyond the sieve).

## Step-by-Step Trace

`n = 50`: the outer loop runs for `i = 2 .. 7`.

| Prime `i` | Starts at | Crosses out (first time) | Count |
|-----------|-----------|--------------------------|-------|
| 2 | 4 | 4, 6, 8, ..., 50 | 24 |
| 3 | 9 | 9, 15, 21, 27, 33, 39, 45 | 7 |
| 5 | 25 | 25, 35 | 2 |
| 7 | 49 | 49 | 1 |

Of the numbers 2..50, 34 are crossed out and the 15 survivors are the primes 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47. (`i = 4` and `i = 6` are skipped because they were crossed out.)

## Complexity

| Version | Time | Space |
|---------|------|-------|
| build the sieve | O(n log log n) | O(n) |
| `is_prime_sieve` lookup | O(1) | O(1) |
| collect the primes into a list | O(n) | O(pi(n)) |

Why `n log log n`: prime `p` does about `n / p` crossings, and the sum of `1 / p` over primes up to `n` grows like `log log n`. For `n = 100` the inner loop writes 104 flags to find 25 primes.

## When to Use

- You need all primes up to a limit of a few million to a few hundred million, or many primality queries below the limit.
- Counting primes, listing divisors, smallest prime factors (with a small change) and totient tables.
- Not for testing one huge number: use Miller-Rabin. Not for a range far from zero with a huge upper bound: use a segmented sieve (not implemented here).

## Sieve of Eratosthenes vs. Alternatives

| Method | Time | Notes |
|--------|------|-------|
| Trial division per number | O(n sqrt n) | no memory, far slower |
| Sieve of Eratosthenes | O(n log log n) | simple, cache friendly, this code |
| Linear sieve | O(n) | each composite crossed out exactly once; also gives smallest prime factors; implemented in [Euler's Totient](../Eulers_Totient/README.md) |
| Segmented sieve | O(n log log n) | O(sqrt n) memory per block |
| Miller-Rabin | O(log n) per number | one number at a time |

## Common Pitfalls

- Starting the inner loop at `2 * i` instead of `i * i`: correct but about twice the work.
- Looping the outer index to `n` instead of `sqrt(n)`.
- Negative indexes: Python `sieve[-1]` wraps around to the last element, and in C++ it reads out of bounds. `is_prime_sieve` returns false for negative `k`.
- 32-bit overflow in C++: `i * i` and `j += i` overflow an `int` when `n` is near 2^31 - 1. This code uses `long long` counters.
- Forgetting that 0 and 1 are not prime.
- Memory: a Python list takes 8 bytes per entry, a Go `[]bool` 1 byte, a C++ `vector<bool>` 1 bit.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `sieve_of_eratosthenes.py` | list of bools, `math.isqrt` |
| C++ | [C++](C++/) | `sieve_of_eratosthenes.cpp` | `vector<bool>` (1 bit per number), `long long` counters |
| Go | [Go](Go/) | `main.go` | `[]bool`, `int` is 64-bit |

## Practice Problems

- [Count Primes (LeetCode 204)](https://leetcode.com/problems/count-primes/)
- [Closest Prime Numbers in Range (LeetCode 2523)](https://leetcode.com/problems/closest-prime-numbers-in-range/)
- [Counting Divisors (CSES 1713)](https://cses.fi/problemset/task/1713)
- [Prime Generator (SPOJ PRIME1)](https://www.spoj.com/problems/PRIME1/)
- [Largest Component Size by Common Factor (LeetCode 952)](https://leetcode.com/problems/largest-component-size-by-common-factor/)
- Exercise: change the sieve to store the smallest prime factor of every number, then factor 360 with it.

## Related

- [Miller-Rabin Primality Test](../Miller_Rabin_Primality_Test/README.md)
- [Euclidean Algorithm](../Euclidean_Algorithm/README.md)
- [Modular Arithmetic](../Modular_Arithmetic/README.md)
- [Euler's Totient](../Eulers_Totient/README.md) - the linear sieve, which also computes phi
