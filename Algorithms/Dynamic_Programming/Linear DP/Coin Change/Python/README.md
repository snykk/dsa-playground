# Coin Change (Python)

**Coin Change** is a classic Dynamic Programming problem that finds the minimum number of coins needed to make a given amount, or counts the number of ways to make that amount.

---

## Overview

Given coins of different denominations and a total amount, we want to:
1. **Minimize coins**: Find minimum number of coins needed (unbounded knapsack variant)
2. **Count ways**: Count number of ways to make amount (unbounded)
3. **0/1 variant**: Each coin can be used at most once

This problem demonstrates the power of DP: the greedy approach doesn't work for minimum coins (consider coins=[3, 4], amount=6), but DP always finds the optimal solution.

**Example**:
- Coins: [1, 2, 5]
- Amount: 11
- Minimum coins: 3 (5 + 5 + 1)
- Number of ways: Multiple combinations possible

---

## Algorithm

### Minimum Coins (Unbounded)

1. **DP State**: `dp[i]` = minimum coins needed to make amount `i`
2. **Recurrence**: 
   - For each coin `c`: `dp[i] = min(dp[i], dp[i-c] + 1)`
   - Try all coins for each amount
3. **Base Case**: `dp[0] = 0` (0 coins for amount 0)
4. **Initialization**: `dp[i] = infinity` for i > 0

### Number of Ways (Unbounded)

1. **DP State**: `dp[i]` = number of ways to make amount `i`
2. **Recurrence**: 
   - For each coin `c`: `dp[i] += dp[i-c]`
   - Sum all ways from previous amounts
3. **Base Case**: `dp[0] = 1` (one way: use no coins)

### 0/1 Coin Change

1. Similar to minimum coins but iterate backwards
2. Prevents using same coin multiple times
3. Process coins one at a time, iterate amounts backwards

---

## Complexity Analysis

| Variant | Time | Space |
|---------|------|-------|
| **Minimum Coins** | O(n × amount) | O(amount) |
| **Number of Ways** | O(n × amount) | O(amount) |
| **0/1 Variant** | O(n × amount) | O(amount) |

Where:
- `n` = number of coin denominations
- `amount` = target amount

**Note**: Can be optimized to O(amount) space, but time remains O(n × amount).

---

## Implementation Details

### Functions

1. **`coin_change_min_coins(coins, amount)`**
   - Finds minimum number of coins (unbounded)
   - Returns minimum coins or -1 if impossible
   - Time: O(n × amount), Space: O(amount)

2. **`coin_change_ways(coins, amount)`**
   - Counts number of ways to make amount (unbounded)
   - Returns total number of combinations
   - Time: O(n × amount), Space: O(amount)

3. **`coin_change_01(coins, amount)`**
   - Minimum coins with 0/1 constraint
   - Each coin used at most once
   - Time: O(n × amount), Space: O(amount)

---

## Usage

```python
from coin_change import (
    coin_change_min_coins,
    coin_change_ways,
    coin_change_01
)

coins = [1, 2, 5]
amount = 11

# Minimum coins (unbounded)
min_coins = coin_change_min_coins(coins, amount)
print(min_coins)  # Output: 3 (5 + 5 + 1)

# Number of ways (unbounded)
ways = coin_change_ways(coins, amount)
print(ways)  # Output: 11 (multiple combinations)

# 0/1 variant (each coin once)
min_coins_01 = coin_change_01(coins, amount)
print(min_coins_01)  # Output: 3 (5 + 2 + 1 + 1 + 1 + 1, but only one of each)

# Impossible case
coins = [3, 4]
amount = 6
min_coins = coin_change_min_coins(coins, amount)
print(min_coins)  # Output: 2 (3 + 3)

# Impossible with 0/1
min_coins_01 = coin_change_01(coins, amount)
print(min_coins_01)  # Output: -1 (impossible with one of each)
```

---

## Important Notes

1. **Greedy doesn't work**: For minimum coins, greedy may not give optimal (e.g., coins=[3, 4], amount=6)
2. **Unbounded vs 0/1**: Unbounded allows multiple uses, 0/1 allows at most one use
3. **Order matters for ways**: Different orders count as same way in standard problem
4. **Impossible cases**: Return -1 when amount cannot be made
5. **Base cases**: dp[0] = 0 for min coins, dp[0] = 1 for ways

---

## Advantages

1. ✅ **Optimal**: DP guarantees optimal solution
2. ✅ **Efficient**: O(n × amount) time complexity
3. ✅ **Flexible**: Handles multiple variants
4. ✅ **Space efficient**: Can optimize to O(amount) space

---

## Disadvantages

1. ❌ **Pseudo-polynomial**: Time depends on amount value, not just input size
2. ❌ **Large amounts**: May be slow for very large amounts
3. ❌ **Memory**: O(amount) space may be large

---

## When to Use

- ✅ **DP Approach**: When greedy doesn't work or need optimal solution
- ✅ **Unbounded**: When coins can be used multiple times
- ✅ **0/1 Variant**: When each coin can be used at most once
- ❌ **Greedy**: Only works for specific coin systems (e.g., standard currency)

---

## Comparison: Greedy vs DP

| Aspect | Greedy | Dynamic Programming |
|--------|--------|---------------------|
| **Optimality** | May not be optimal | Always optimal |
| **Time** | O(n log n) | O(n × amount) |
| **Works For** | Specific coin systems | Any coin system |
| **Example** | US coins [1, 5, 10, 25] | coins=[3, 4], amount=6 |

---

## Testing

Run the test suite:

```bash
python coin_change_test.py
```

---

## Related Algorithms

- **0/1 Knapsack**: Similar DP structure with weight constraint
- **Unbounded Knapsack**: Same as unbounded coin change
- **Partition Problem**: Related subset sum problem

---

## Applications

1. **Vending Machines**: Make change with minimum coins
2. **Currency Exchange**: Convert amounts with different denominations
3. **Resource Allocation**: Allocate resources in discrete units
4. **Combinatorics**: Count combinations and permutations

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 16)
- "Algorithm Design Manual" by Steven Skiena
- LeetCode Problem 322: Coin Change

---

_Last Updated: December 2025_

