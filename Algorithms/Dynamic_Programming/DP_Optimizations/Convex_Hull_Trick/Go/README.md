# Convex Hull Trick -- Go Implementation

`MonotonicCHT` and `LiChaoTree` for minimum queries, with `int64` coefficients.

## Files

| File | Description |
|------|-------------|
| `main.go` | `Line`, `MonotonicCHT`, `LiChaoTree` and a small demo `main` |
| `main_test.go` | Tests (5): classic examples, equal slopes, random stress against a brute-force minimum |
| `go.mod` | Module `cht` |

## API

- `NewMonotonicCHT() *MonotonicCHT`, `AddLine(m, b int64)` (slopes non-increasing; equal slopes keep the lower intercept) and `Query(x int64) int64` (x non-decreasing). `Query` on an empty structure panics.
- `NewLiChaoTree(lo, hi int64) *LiChaoTree`, `AddLine(m, b int64)` in any order and `Query(x int64) int64`. `Query` panics when `x` is outside `[lo, hi]` and returns `math.MaxInt64` on an empty tree.

## Go-Specific Notes

- Go has no 128-bit integer, so the redundancy test computes the differences and products with `math/big`. It is slower than C++ `__int128` but exact. The line value `m * x + b` is still computed in `int64` and must fit.
- Pop-front is `lines = lines[1:]`, which keeps the old backing array alive; that is fine for one-shot use.
- Goroutine stacks grow dynamically, so the Li Chao recursion (about log2 of the range) needs no tuning.
- The demo `main` prints three queries for the lines `(2,5)`, `(1,3)`, `(-1,7)`.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- `math/big` gives exact cross-multiplication where C++ would use `__int128`.
- Random stress tests against a brute-force minimum catch the subtle cases, such as equal slopes.
- Panics signal precondition violations (empty structure, out-of-range query).
