# Digit DP -- Go Implementation

Counts the numbers in `0..n` whose decimal digit sum equals a target, with a memoized recursion over `(position, tight, sum)`, ported from the Python version.

## Files

| File | Description |
|------|-------------|
| `main.go` | `CountNumbersWithDigitSum` (`package main`, no `main` function) |
| `main_test.go` | 3 tests: a table of the Python cases and of values printed by the Python code up to `math.MaxInt64`, the Python brute-force grid, and 400 random bounds up to 5000 checked against counting one by one |
| `go.mod` | Module `digitdp` (Go 1.21) |

## API

| Name | Description |
|------|-------------|
| `CountNumbersWithDigitSum(n int64, targetSum int) int64` | the count of `x` with `0 <= x <= n` and digit sum `targetSum`; `0` when `n < 0` (so `count(R) - count(L - 1)` works for `L = 0`) and when `targetSum < 0`, as in Python |

```go
CountNumbersWithDigitSum(100, 5)                                // 6: 5, 14, 23, 32, 41, 50
CountNumbersWithDigitSum(100, 5) - CountNumbersWithDigitSum(9, 5) // 5
```

## Go-Specific Notes

- `n` is an `int64`, so bounds up to `math.MaxInt64` (about 9.2 * 10^18) work; Python has no upper limit. Counts are `int64` and cannot overflow because a count is at most `n + 1`.
- The memo is a slice indexed by `[pos][tight][sum]` with `-1` for "not computed", created inside each call. Its sum dimension is `min(targetSum, 9 * digits) + 1`, the sums that can be stored, so a huge target does not allocate a huge table.
- The digits come from `strconv.FormatInt`; the recursive closure goes at most 19 levels deep.
- The package has no `func main`, so `go run .` does not work; use the tests.

## How to Run

```bash
cd "Algorithms/Dynamic_Programming/Advanced_DP/Digit_DP/Go"
go test ./...
```

## Key Takeaways

- The tight flag is part of the memo key because a tight state and a free state differ.
- Prune on `sum + d <= target` to keep the state space small.
- Subtracting `count(L - 1)` gives range counts, and `count(-1)` is 0.
