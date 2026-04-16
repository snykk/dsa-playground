# 0/1 Knapsack (C++)

C++ implementation of the 0/1 Knapsack problem using a 2D dynamic programming table to maximize total value without exceeding a given weight capacity.

## Files

| File | Description |
|------|-------------|
| `knapsack_01.cpp` | Main implementation with DP table approach |
| `knapsack_01_test.cpp` | Test cases for knapsack solver |

## How to Run

```bash
g++ -std=c++17 -DTESTING -o test knapsack_01_test.cpp
./test
```

## Key Functions

| Function | Description | Time Complexity |
|----------|-------------|-----------------|
| `knapsack01(weights, values, capacity)` | Solves 0/1 knapsack using bottom-up DP over items and capacities | O(n * W) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(n * W) where n = number of items, W = capacity |
| Space | O(n * W) for the 2D DP table |

## Notes

- Each item can be either taken or skipped (0/1 choice).
- The DP table `dp[i][w]` stores the maximum value achievable using the first `i` items with capacity `w`.
- Uses `std::vector<std::vector<int>>` for the DP table.

---

_Last Updated: April 2026_
