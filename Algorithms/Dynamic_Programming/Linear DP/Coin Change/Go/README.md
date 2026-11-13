# Coin Change (Go)

Go implementation of the Coin Change problem using linear dynamic programming to find the minimum number of coins needed to make a given amount.

## Files

| File | Description |
|------|-------------|
| `main.go` | Main implementation with 1D DP approach |
| `main_test.go` | Test cases for coin change solver |
| `go.mod` | Go module definition (`coinchange`) |

## How to Run

```bash
go test ./...
```

## Key Functions

| Function | Description | Time Complexity |
|----------|-------------|-----------------|
| `CoinChangeMinCoins(coins []int, amount int) int` | Finds the minimum number of coins to make the target amount, returns -1 if impossible | O(n * amount) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(n * amount) where n = number of coin denominations |
| Space | O(amount) for the 1D DP array |

## Notes

- Uses unbounded knapsack pattern: each coin denomination can be used multiple times.
- `dp[i]` stores the minimum coins needed to make amount `i`.
- Initializes `dp` values to `amount + 1` as a sentinel for unreachable amounts.
- Returns -1 when the target amount cannot be formed with the given coins.
- Panics for a negative amount.

---

_Last Updated: April 2026_
