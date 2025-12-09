# 0/1 Knapsack (Python)

**0/1 Knapsack** is a classic Dynamic Programming problem that maximizes the value of items in a knapsack with a weight constraint, where each item can be used at most once.

---

## Overview

Given n items with weights and values, fill a knapsack of capacity W to maximize total value. The "0/1" means each item can either be taken (1) or not taken (0) - no fractions allowed. This is different from Fractional Knapsack where items can be split.

**Example**:
- Items: (weight, value) = [(1, 1), (3, 4), (4, 5), (5, 7)]
- Capacity: 7
- Optimal: Items 1 and 3 (weights 3 and 4, values 4 and 5)
- Maximum value: 9

---

## Algorithm

1. **DP State**: `dp[i][w]` = maximum value using first `i` items with capacity `w`
2. **Recurrence**:
   - If `weight[i-1] <= w`: 
     - `dp[i][w] = max(take, skip)`
     - `take = value[i-1] + dp[i-1][w - weight[i-1]]`
     - `skip = dp[i-1][w]`
   - Else: `dp[i][w] = dp[i-1][w]` (item too heavy)
3. **Base Case**: `dp[0][w] = 0` for all `w` (no items, no value)
4. **Result**: `dp[n][W]`

**Intuition**: For each item, decide whether to take it or skip it, choosing the option that maximizes value.

---

## Complexity Analysis

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| **Naive Recursive** | O(2^n) | O(n) | Exponential, not practical |
| **Standard DP** | O(n × W) | O(n × W) | 2D DP table |
| **Space-Optimized** | O(n × W) | O(W) | Use 1D array, iterate backwards |

Where:
- `n` = number of items
- `W` = knapsack capacity

**Note**: This is pseudo-polynomial time. If W is large, it becomes slow.

---

## Implementation Details

### Functions

1. **`knapsack_01(weights, values, capacity)`**
   - Standard 2D DP approach
   - Returns maximum value
   - Time: O(n × W), Space: O(n × W)

2. **`knapsack_01_optimized(weights, values, capacity)`**
   - Space-optimized version
   - Uses 1D array, iterates backwards
   - Returns maximum value
   - Time: O(n × W), Space: O(W)

3. **`knapsack_01_with_items(weights, values, capacity)`**
   - Returns maximum value and selected items
   - Uses backtracking through DP table
   - Returns (max_value, selected_indices)
   - Time: O(n × W), Space: O(n × W)

---

## Usage

```python
from knapsack_01 import (
    knapsack_01,
    knapsack_01_optimized,
    knapsack_01_with_items
)

weights = [1, 3, 4, 5]
values = [1, 4, 5, 7]
capacity = 7

# Standard approach
max_value = knapsack_01(weights, values, capacity)
print(max_value)  # Output: 9

# Space-optimized
max_value = knapsack_01_optimized(weights, values, capacity)
print(max_value)  # Output: 9

# Get selected items
max_value, selected = knapsack_01_with_items(weights, values, capacity)
print(max_value)  # Output: 9
print(selected)   # Output: [1, 2] (indices of selected items)

# Edge cases
weights = [10, 20, 30]
values = [60, 100, 120]
capacity = 50
max_value = knapsack_01(weights, values, capacity)  # Output: 220
```

---

## Important Notes

1. **0/1 constraint**: Each item can be used at most once
2. **No fractions**: Unlike fractional knapsack, cannot take partial items
3. **Pseudo-polynomial**: Time depends on W value, not just input size
4. **Space optimization**: Can reduce to O(W) by iterating backwards
5. **Item reconstruction**: Need full DP table to find which items were selected

---

## Advantages

1. ✅ **Optimal**: DP guarantees optimal solution
2. ✅ **Efficient**: O(n × W) time complexity
3. ✅ **Space optimizable**: Can reduce to O(W) space
4. ✅ **Versatile**: Can get value or actual items selected

---

## Disadvantages

1. ❌ **Pseudo-polynomial**: Slow when W is very large
2. ❌ **Memory**: O(n × W) space for full table
3. ❌ **Large capacity**: May be impractical for very large W

---

## When to Use

- ✅ **Small-medium capacity**: When W is reasonable (< 10^6)
- ✅ **Need optimal solution**: When exact maximum is required
- ✅ **Item selection**: When need to know which items were selected
- ❌ **Very large capacity**: May need approximation algorithms
- ❌ **Fractional items**: Use greedy for fractional knapsack

---

## Comparison: 0/1 vs Fractional Knapsack

| Aspect | 0/1 Knapsack | Fractional Knapsack |
|--------|--------------|---------------------|
| **Items** | Whole items only | Can take fractions |
| **Approach** | Dynamic Programming | Greedy |
| **Time** | O(n × W) | O(n log n) |
| **Optimality** | Always optimal | Always optimal (greedy works) |

---

## Testing

Run the test suite:

```bash
python knapsack_01_test.py
```

---

## Related Algorithms

- **Fractional Knapsack**: Greedy approach (can take fractions)
- **Unbounded Knapsack**: Can use items multiple times
- **Subset Sum**: Special case (values = weights)
- **Partition Problem**: Related subset problem

---

## Applications

1. **Resource Allocation**: Allocate limited resources optimally
2. **Portfolio Optimization**: Select investments with budget constraint
3. **Cutting Stock**: Optimize material cutting
4. **Cryptography**: Some encryption schemes use knapsack

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 16)
- "Algorithm Design Manual" by Steven Skiena
- LeetCode Problem 416: Partition Equal Subset Sum (related)

---

_Last Updated: December 2025_
