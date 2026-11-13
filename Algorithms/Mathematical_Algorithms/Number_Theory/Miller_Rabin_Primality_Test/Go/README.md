# Miller-Rabin Primality Test -- Go Implementation

## Files

- `main.go`: all functions plus a demo in `main`.
- `main_test.go`: tests (small primes and composites, edge cases, primes and composites near 2^32, 2^61 and 2^63, 2^64 - 59, strong pseudoprimes, Carmichael numbers, negative input, `ModPow` with a 60-bit modulus, agreement with trial division for 0..5000).
- `go.mod`: module file (Go 1.21).

## API

- `MillerRabin(n int64, k int) bool`: `k` random witnesses from `[2, n - 2]`; true means "probably prime".
- `IsPrimeMillerRabin(n int64, k int) bool`: handles `n < 2` and even `n`, then calls `MillerRabin`.
- `MillerRabinDeterministic(n int64) bool`: twelve fixed witnesses; exact for every `int64` (negative `n` is not prime).
- `MillerRabinDeterministicU64(n uint64) bool`: the same for the full range up to 2^64 - 1.
- `ModPow(base, exponent, modulus int64) int64`: `base^exponent mod modulus` with 128-bit products.

## Go-Specific Notes

- Products use `bits.Mul64` and `bits.Rem64`, so every 64-bit modulus is safe. No floating point.
- Witnesses come from the global `math/rand`, which Go seeds randomly at start-up (Go 1.20 and later). The old code re-seeded with the deprecated `rand.Seed` on every call.
- The `int64` functions accept `n` up to 2^63 - 1; use the `U64` variant above that.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- `bits.Mul64` plus `bits.Rem64` is an overflow-free `a * b % m`.
- Twelve fixed bases make the test deterministic for 64-bit inputs.
