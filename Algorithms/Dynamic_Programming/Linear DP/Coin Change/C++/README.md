# Coin Change -- C++ Implementation

The minimum-coins table.

## Files

| File | Contents |
|------|----------|
| `coin_change.cpp` | `coinChangeMinCoins` |
| `coin_change_test.cpp` | `assert`-based tests; it `#include`s `coin_change.cpp` |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `int coinChangeMinCoins(const std::vector<int>& coins, int amount)` | fewest coins that make `amount`, or `-1` | O(n * amount) | O(amount) |

It throws `std::invalid_argument` for a negative `amount`. The ways and 0/1 variants are only in the Python folder.

## C++-Specific Notes

- `INT_MAX` marks unreachable amounts; the update is skipped when `dp[i - coin]` is unreachable, so `INT_MAX + 1` never happens.
- The table has `amount + 1` entries: a very large amount allocates a very large vector.
- The test file includes the `.cpp`, so compile only the test file.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD coin_change_test.cpp -o coin_change_test
./coin_change_test
```

## Key Takeaways

- The answer is `dp[amount]`, or `-1` when it is still the sentinel.
- Guard the sentinel before adding 1.
- A negative amount is an error, not an empty table.
