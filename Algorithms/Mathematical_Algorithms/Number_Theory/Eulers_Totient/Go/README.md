# Euler's Totient -- Go Implementation

`Phi(n)` by trial division for any `n` up to 2^64 - 1, the linear sieve, and the modular inverse from Euler's theorem with `math/bits` products. See the [topic README](../README.md) for the idea, a trace and the 64-bit limits.

## Files

| File | Contents |
|------|----------|
| `main.go` | `Factor`, `PrimeFactors`, `Phi`, `TotientSieve`, `LinearSieve`, `MulMod`, `PowMod`, `ModInverseEuler`, the errors `ErrZero`, `ErrNegativeLimit` and `ErrNotCoprime`, and a demo in `main` |
| `main_test.go` | the values the Python code computes (31 values of `Phi`, 8 factorizations, 11 inverses, the tables of `LinearSieve(30)`); `Phi` against a count of gcds up to 3000; primes, prime powers up to 2^64, 1 and 0; multiplicativity and the divisor sum, also at 64 bits; the sieve against `Phi` and one crossing per composite; Euler's theorem; the inverse against `math/big`'s `ModInverse`; the errors |
| `go.mod` | module file (Go 1.21) |

## API

| Function | Description |
|----------|-------------|
| `PrimeFactors(n uint64) ([]Factor, error)` | `Factor{Prime, Exp}` pairs, primes increasing; empty for 1; `ErrZero` for 0; O(sqrt n) |
| `Phi(n uint64) (uint64, error)` | Euler's totient; `ErrZero` for 0; O(sqrt n) |
| `LinearSieve(n int) (TotientSieve, error)` | `Phi`, `SPF`, `Primes` (`[]int`) and `Crossings` (`int`) for `0..n`; an error wrapping `ErrNegativeLimit` for `n < 0`; O(n) |
| `MulMod(a, b, m uint64) uint64` | `a * b mod m` for `m >= 1`, from `bits.Mul64` and `bits.Rem64` |
| `PowMod(base, exp, m uint64) uint64` | `base^exp mod m` for `m >= 1` by square and multiply; `1 % m` for `exp = 0` |
| `ModInverseEuler(a, n uint64) (uint64, error)` | `a^(Phi(n) - 1) mod n`, 0 for `n = 1`; `ErrZero` for `n = 0`, an error wrapping `ErrNotCoprime` when `gcd(a, n) != 1` |

## Go-Specific Notes

- **The largest n is 2^64 - 1.** The loop tests `p <= n/p`, because `p*p` in `uint64` wraps to 0 at `p = 2^32`. A prime near 2^64 needs about 2^32 candidates, about 8 s on the machine the timings were taken on.
- **128-bit products** come from `bits.Mul64` (the high and low words) and `bits.Rem64` (the remainder of that 128-bit number), so `MulMod` is exact for every modulus up to 2^64 - 1. `bits.Rem64` panics for `m = 0`; `ModInverseEuler` rejects `n = 0` before it gets there.
- **Errors, not panics.** Invalid input returns an error that wraps one of the three exported sentinels, so callers test it with `errors.Is`. The message names the numbers: `6 has no inverse modulo 9: gcd(6, 9) = 3: a and n are not coprime`.
- `int` is 64 bits on 64-bit platforms (amd64, arm64), where `i*p` cannot overflow for any limit that fits in memory; on a 32-bit platform it is 32 bits, like a C++ `int`, which is why the bound is written `p > n/i`.
- `PrimeFactors(1)` returns an empty, non-nil slice.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- Write `p*p <= n` as `p <= n/p` at 64 bits.
- `bits.Mul64` plus `bits.Rem64` is an overflow-free `a * b % m`.
- Each composite is crossed out once: `Crossings` equals the number of composites.
