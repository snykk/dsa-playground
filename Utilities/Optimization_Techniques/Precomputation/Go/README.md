# Precomputation -- Go Implementation

Factorial tables, a prime sieve, smallest prime factors and 1D prefix sums.

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | the functions below and a small demo `main` |
| `main_test.go` | 9 tests: factorials, sieve (values, small limits, pi(10000) = 1229), SPF, prefix sums |
| `go.mod` | module definition |

## API

- `NewFactorials(n int, m int64) *Factorials`, `(*Factorials).NCr(n, r)`.
- `Sieve(n int) ([]int, []bool)`: primes up to `n` and a flag slice indexed by number; no primes for `n < 2`.
- `ComputeSPF(n int) []int`: smallest prime factor of every number up to `n`.
- `NewPrefixSum(arr []int) *PrefixSum`, `(*PrefixSum).Query(l, r)` (inclusive).

## Go-Specific Notes

- The Go version has no 2D prefix sums, sparse table, LCA or `factorize` function; use the Python or C++ version for those.
- `NCr` multiplies `int64` values below the modulus, so it is exact for moduli up to about 3e9.
- `Query` uses `int`, which is 64 bits on 64-bit platforms.
- `Sieve` returns `nil` for the primes when there are none.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

1. Slices of length `n + 1` make index-based tables simple.
2. Handle tiny inputs (`n < 2`) explicitly.
3. Know which of the other languages' tools this version lacks.
