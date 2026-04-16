# Coin Change (C++)

C++ implementation of the Coin Change problem using linear dynamic programming to find the minimum number of coins needed to make a given amount.

## Files

| File | Description |
|------|-------------|
| `coin_change.cpp` | Main implementation with 1D DP approach |
| `coin_change_test.cpp` | Test cases for coin change solver |

## How to Run

```bash
g++ -std=c++17 -DTESTING -o test coin_change_test.cpp
./test
```

## Key Functions

| Function | Description | Time Complexity |
|----------|-------------|-----------------|
| `coinChangeMinCoins(coins, amount)` | Finds the minimum number of coins to make the target amount, returns -1 if impossible | O(n * amount) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(n * amount) where n = number of coin denominations |
| Space | O(amount) for the 1D DP array |

## Notes

- Uses unbounded knapsack pattern: each coin denomination can be used multiple times.
- `dp[i]` stores the minimum coins needed to make amount `i`.
- Initializes `dp` values to `INT_MAX` to represent unreachable amounts.
- Returns -1 when the target amount cannot be formed with the given coins.

---

_Last Updated: April 2026_
