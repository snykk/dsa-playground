# Coin Change -- Python Implementation

Three variants of Coin Change over a one-dimensional table.

## Files

| File | Contents |
|------|----------|
| `coin_change.py` | the functions below |
| `coin_change_test.py` | `unittest` cases |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `coin_change_min_coins(coins, amount)` | fewest coins that make `amount` (coins reusable), or `-1` | O(n * amount) | O(amount) |
| `coin_change_ways(coins, amount)` | number of combinations that make `amount` (order ignored) | O(n * amount) | O(amount) |
| `coin_change_01(coins, amount)` | fewest coins when each coin may be used at most once, or `-1` | O(n * amount) | O(amount) |

All three raise `ValueError` for a negative `amount`. Amount 0 gives 0 coins and 1 way.

```python
from coin_change import coin_change_min_coins, coin_change_ways, coin_change_01

print(coin_change_min_coins([1, 2, 5], 11))   # 3
print(coin_change_ways([1, 2, 5], 5))         # 4
print(coin_change_01([1, 2, 5], 11))          # -1 (all coins together make 8)
print(coin_change_01([1, 2, 5], 8))           # 3
```

## Python-Specific Notes

- `float('inf')` marks unreachable amounts, and the result is converted to `-1` at the end.
- Integers are unbounded, so `coin_change_ways` cannot overflow.
- The coins list is not validated: use positive integer values.

## How to Run

From this folder:

```bash
python3 -m unittest coin_change_test
```

## Key Takeaways

- Upward sweep reuses coins; downward sweep uses each coin once.
- For counting, coins go in the outer loop to count combinations.
- Unreachable is `-1`, never an exception.
