# Miller-Rabin Primality Test

Miller-Rabin decides whether a large integer is prime by checking a property that every prime has and almost every composite fails. With `k` random witnesses a composite is accepted with probability at most `4^-k`; with a fixed set of twelve witnesses the answer is exact for every `n < 2^64`. Each witness costs one modular exponentiation, `O(log n)` multiplications.

## Intuition

For a prime `p`, the only square roots of 1 modulo `p` are 1 and `p - 1`, and Fermat says `a^(p-1) = 1 (mod p)`. Write `n - 1 = d * 2^r` with `d` odd and look at the chain `a^d, a^(2d), a^(4d), ..., a^((n-1)/2)`, each term the square of the previous one. If `n` is prime the chain either starts at 1, or contains `n - 1` (and then every later square is 1). If it does neither, `n` is composite, and `a` is called a witness.

Invariant: a prime passes for every base `a`. A composite that passes for a base `a` is a "strong liar" for it, and at most one quarter of the bases can be liars.

## Visual

The chain for `n = 561` (a Carmichael number: composite, yet it fools the plain Fermat test) with base 2. Here `560 = 35 * 2^4`:

```text
a^d     = 2^35  = 263
a^(2d)  = 2^70  = 166
a^(4d)  = 2^140 =  67        67 is neither 1 nor 560
a^(8d)  = 2^280 =   1        ... and 67^2 = 1: a non-trivial square root of 1
        -> n - 1 = 560 never appears: 561 is composite
```

## How It Works

1. Reject `n < 2` and even `n > 2`. Treat 2 and 3 as prime.
2. Write `n - 1 = d * 2^r` with `d` odd.
3. For each witness `a` (random in `[2, n - 2]`, or a fixed small prime):
   1. `x = a^d mod n`. If `x` is 1 or `n - 1`, this witness passes.
   2. Square `x` up to `r - 1` times. If it becomes `n - 1`, the witness passes.
   3. Otherwise `n` is composite: stop and return false.
4. If every witness passes, return true ("probably prime").

`millerRabinDeterministic` uses the witnesses 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37. No composite below 318,665,857,834,031,151,167,461 passes all twelve, which covers every 64-bit integer. The first composite that does pass them all is `399165290221 * 798330580441 = 318665857834031151167461`, so the test is only probabilistic beyond that bound.

## Step-by-Step Trace

| `n` | `a` | `d`, `r` | chain `a^d, a^2d, ...` | verdict |
|-----|-----|----------|------------------------|---------|
| 97 | 2 | 3, 5 | 8, 64, 22, 96 | passes (96 = n - 1) |
| 561 | 2 | 35, 4 | 263, 166, 67, 1 | witness: composite |
| 2047 | 2 | 1023, 1 | 1 | passes: 2 is a strong liar for 2047 = 23 * 89 |
| 2047 | 3 | 1023, 1 | 1565 | witness: composite |

The 2047 rows show why one base is not enough: base 2 is fooled, base 3 is not.

## Complexity

| Version | Time | Space |
|---------|------|-------|
| `k` random witnesses | O(k log n) modular multiplications, O(k log^3 n) bit operations | O(1) |
| Deterministic (12 witnesses) | O(log n) modular multiplications | O(1) |

Error: a composite survives one random witness with probability at most 1/4, so `k` witnesses give at most `4^-k`. In practice much less: only 8 of the 558 bases are strong liars for 561 (about 1.4 percent).

## When to Use

- Testing whether a single large number (above a few million) is prime, such as key generation or hashing parameters.
- Not for listing all primes up to `n`: use a sieve.
- Not when you need a proof of primality for adversarial numbers beyond 2^64 with a fixed base set; use random witnesses or a proving test.

## Miller-Rabin vs. Alternatives

| Method | Time | Notes |
|--------|------|-------|
| Trial division | O(sqrt n) | exact; hopeless above about 10^12 |
| Fermat test | O(log n) per base | fooled by Carmichael numbers such as 561 for every coprime base |
| Miller-Rabin | O(log n) per base | at most 1/4 liars; exact with the fixed bases below 2^64 |
| Sieve of Eratosthenes | O(n log log n) | all primes up to `n`, not one number |

## Common Pitfalls

- Computing `(a * b) % n` in 64-bit signed arithmetic: for `n` above about 3.04e9 the product overflows and primes are reported composite. This code multiplies in 128 bits.
- Claiming the 12-base test is exact for any `n`: it is exact below 318,665,857,834,031,151,167,461.
- Seeding the random generator badly (a fixed `rand()` sequence, or only small witnesses) voids the `4^-k` bound.
- Forgetting that the chain stops at the first `n - 1`, and that only `r - 1` squarings are needed.
- Passing negative or even `n` to the core loop.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `miller_rabin.py` | built-in `pow(a, d, n)`; big integers |
| C++ | [C++](C++/) | `miller_rabin.cpp` | `unsigned __int128` products; `millerRabinDeterministicU64` for the full 64-bit range |
| Go | [Go](Go/) | `main.go` | `math/bits` products; `MillerRabinDeterministicU64` for the full 64-bit range |

## Practice Problems

- [Count Primes (LeetCode 204)](https://leetcode.com/problems/count-primes/): compare a sieve with per-number tests.
- [Miller-Rabin primality test on cp-algorithms](https://cp-algorithms.com/algebra/primality_tests.html): theory and the deterministic base sets.
- Exercise: find the smallest strong liar bases for 2047 and 3215031751.
- Exercise: run `miller_rabin_deterministic(2**64 - 59)` and check it against a sieve-based method on smaller primes.

## Related

- [Modular Exponentiation](../Modular_Exponentiation/README.md)
- [Modular Arithmetic](../Modular_Arithmetic/README.md)
- [Sieve of Eratosthenes](../Sieve_of_Eratosthenes/README.md)
