# Inclusion-Exclusion Principle -- Go Implementation

Union counting over divisors and over explicit sets. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `main.go` | `gcd`, `countDivisible`, `countUnionSets` and a demo `main` |
| `main_test.go` | Tests with exact values, including the 11- and 12-prime cases and union-of-sets cases |
| `go.mod` | Module definition |

## API

- `gcd(a, b int) int`
- `countDivisible(n int, divisors []int) int`: numbers in `1..n` divisible by at least one divisor (divisors at least 1).
- `countUnionSets(sets [][]int) int`: size of the union.

## Go-Specific Notes

- The lcm is built as `lcm / gcd * d` and a subset is skipped once the lcm exceeds `n`, so `int` cannot overflow for realistic inputs.
- Sets are `map[int]bool`.
- The standard library `math/bits` offers `OnesCount` if you want to derive the sign from the mask directly; this code counts bits in its loop instead.
- Functions are unexported; use them from within the package.

## How to Run

```bash
go test ./...
go run main.go
```

## Key Takeaways

- Prune subsets whose lcm exceeds `n`.
- An empty `sets` slice returns 0.
- Keep k small: the work is 2^k.
