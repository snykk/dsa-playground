# Bitmask DP -- Go Implementation

A Traveling Salesman Problem solver over subsets of cities encoded as bitmasks, ported from the Python version.

## Files

| File | Description |
|------|-------------|
| `main.go` | `TravelingSalesmanDP` (`package main`, no `main` function) |
| `main_test.go` | 3 tests: a table of the Python cases (4-city tour, no tour, empty and nil matrix, one and two cities, triangle), a table of values printed by the Python code, and 300 random matrices checked against a brute force over all city orders |
| `go.mod` | Module `bitmaskdp` (Go 1.21) |

## API

| Name | Description |
|------|-------------|
| `TravelingSalesmanDP(distances [][]float64) float64` | minimum cost of a tour that starts at city 0, visits every city once and returns to city 0; `0` for an empty matrix, `math.Inf(1)` when no tour exists |

A missing edge is `math.Inf(1)` in `distances`, as `float('inf')` is in Python.

```go
d := [][]float64{{0, 10, 15, 20}, {10, 0, 35, 25}, {15, 35, 0, 30}, {20, 25, 30, 0}}
cost := TravelingSalesmanDP(d) // 80
```

## Go-Specific Notes

- Distances and the result are `float64`, so `math.Inf(1)` survives additions and an impossible tour is never reported as free. Integer distances below 2^53 are added exactly.
- Masks are `int` (64 bits on the usual platforms), so `1 << n` does not overflow for any n that fits in memory.
- The minimum is taken with `<` (keep the old value on a tie), as Python's `min` does; `math.Min` would differ only for NaN and signed zeros. The result is the same value as Python's, bit for bit.
- The table is a `[][]float64` of `1 << n` rows of n cells: n = 20 needs about 168 MB.
- The package has no `func main`, so `go run .` does not work; use the tests.

## How to Run

```bash
cd "Algorithms/Dynamic_Programming/Advanced_DP/Bitmask_DP/Go"
go test ./...
```

## Key Takeaways

- A set of cities is an `int`, so `dp[mask][last]` is a plain slice of slices.
- Increasing mask order is a valid evaluation order because transitions only add bits.
- `math.Inf(1)` marks both a missing edge and "no tour".
