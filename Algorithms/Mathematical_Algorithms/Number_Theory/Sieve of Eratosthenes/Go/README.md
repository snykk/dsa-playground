# Sieve of Eratosthenes -- Go Implementation

## Files

- `main.go`: the three functions below plus a demo in `main`.
- `main_test.go`: tests (small and medium limits, counts, empty cases, the boolean sieve, lookups, negative and out-of-range lookups, negative limits, agreement with trial division up to 20,000, prime counts).
- `go.mod`: module file (Go 1.21).

## API

- `SieveOfEratosthenes(n int) []int`: the primes up to and including `n`; empty for `n < 2`.
- `SieveBoolean(n int) []bool`: `n + 1` flags, true at the primes; empty for `n < 0`.
- `IsPrimeSieve(n int, sieve []bool) bool`: `sieve[n]` for `0 <= n < len(sieve)`, otherwise false.

## Go-Specific Notes

- `[]bool` uses one byte per number.
- `int` is 64 bits on common platforms, so `i * i` cannot overflow for any `n` whose sieve fits in memory.
- The old code panicked on a negative limit or a negative index; both now return an empty result or false.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- Start crossing out at `p * p` and stop at `sqrt(n)`.
- Guard lookups against negative indexes.
