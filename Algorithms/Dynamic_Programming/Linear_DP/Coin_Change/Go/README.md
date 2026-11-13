# Coin Change -- Go Implementation

The minimum-coins table.

## Files

| File | Contents |
|------|----------|
| `main.go` | `CoinChangeMinCoins` |
| `main_test.go` | table-driven test and a check that a negative amount panics |
| `go.mod` | module `coinchange` (Go 1.21) |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `CoinChangeMinCoins(coins []int, amount int) int` | fewest coins that make `amount`, or `-1` | O(n * amount) | O(amount) |

It panics with `CoinChangeMinCoins: amount must be non-negative` for a negative `amount`. The ways and 0/1 variants are only in the Python folder.

## Go-Specific Notes

- `amount + 1` serves as the "unreachable" sentinel: no valid answer can need more than `amount` coins of value at least 1.
- Unreachable entries are skipped, so there is no overflow.
- The package is `main` with no `main` function, so only `go test` runs it.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- The sentinel `amount + 1` is larger than any real answer.
- Unreachable is `-1`; a negative amount panics.
- The sweep goes upward so coins can repeat.
