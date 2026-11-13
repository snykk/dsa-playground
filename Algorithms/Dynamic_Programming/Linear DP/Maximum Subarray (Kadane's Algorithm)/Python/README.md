# Kadane's Algorithm (Python)

**Kadane's Algorithm** is an efficient O(n) algorithm to find the maximum sum of a contiguous subarray in a given array of integers. It's a classic example of dynamic programming and greedy algorithms.

---

## Overview

Kadane's Algorithm solves the Maximum Subarray Problem: find the contiguous subarray (containing at least one number) which has the largest sum. The algorithm uses a simple but powerful insight: if the current sum becomes negative, we should start fresh from the next element.

**Example**: 
- Array: [-2, 1, -3, 4, -1, 2, 1, -5, 4]
- Maximum subarray: [4, -1, 2, 1] with sum = 6
- Note: The subarray [4, -1, 2, 1] has the maximum sum among all contiguous subarrays

---

## Algorithm

1. **Initialize**: 
   - `current_sum = 0`
   - `max_sum = -infinity` (or first element for arrays with all negatives)
2. **Iterate** through array:
   - Add current element to `current_sum`
   - If `current_sum > max_sum`: update `max_sum`
   - If `current_sum < 0`: reset `current_sum = 0` (start fresh)
3. **Return**: `max_sum`

**Key Insight**: If the current sum becomes negative, it's better to start fresh from the next element because a negative sum will only reduce future sums.

---

## Complexity Analysis

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| **Naive (All Subarrays)** | O(n³) | O(1) | Check all possible subarrays |
| **Optimized Naive** | O(n²) | O(1) | Use prefix sums |
| **Kadane's Algorithm** | O(n) | O(1) | Optimal, single pass |
| **DP Approach** | O(n) | O(n) | More explicit DP formulation (`kadane_dp` keeps the whole dp array) |

**Note**: Kadane's Algorithm is optimal - cannot be improved beyond O(n) time and O(1) space.

---

## Implementation Details

### Functions

1. **`kadane_algorithm(arr)`**
   - Standard Kadane's algorithm
   - Returns maximum subarray sum
   - Time: O(n), Space: O(1)
   - Handles all-negative arrays

2. **`kadane_with_indices(arr)`**
   - Returns maximum sum with start and end indices
   - Returns (max_sum, start_index, end_index)
   - Time: O(n), Space: O(1)
   - Useful for finding actual subarray

3. **`kadane_dp(arr)`**
   - More explicit DP formulation
   - `dp[i]` = maximum sum ending at index `i`
   - Returns maximum subarray sum
   - Time: O(n), Space: O(n) for the dp array (`kadane_algorithm` is the O(1)-space version)

---

## Usage

```python
from kadane import (
    kadane_algorithm,
    kadane_with_indices,
    kadane_dp
)

arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4]

# Standard approach
max_sum = kadane_algorithm(arr)
print(max_sum)  # Output: 6

# With indices (find actual subarray)
max_sum, start, end = kadane_with_indices(arr)
print(max_sum)  # Output: 6
print(start)    # Output: 3
print(end)      # Output: 6
print(arr[start:end+1])  # Output: [4, -1, 2, 1]

# DP approach
max_sum = kadane_dp(arr)
print(max_sum)  # Output: 6

# All positive array
arr = [1, 2, 3, 4, 5]
max_sum = kadane_algorithm(arr)  # Output: 15 (entire array)

# All negative array: the best subarray is the single largest element
arr = [-5, -2, -1, -3]
max_sum = kadane_algorithm(arr)  # Output: -1 (least negative)
```

---

## Important Notes

1. **At least one element**: Subarray must contain at least one element
2. **Contiguous**: Subarray must be contiguous (not subsequence)
3. **Negative reset**: Reset sum to 0 when it becomes negative
4. **All negatives**: Special handling when all elements are negative
5. **Empty subarray**: Usually not allowed (sum would be 0)

---

## Advantages

1. ✅ **Optimal**: O(n) time, O(1) space - cannot be improved
2. ✅ **Simple**: Easy to understand and implement
3. ✅ **Single pass**: Only one iteration through array
4. ✅ **Space efficient**: O(1) space complexity

---

## Disadvantages

1. ❌ **Only for sum**: Works for sum, not for product or other operations
2. ❌ **Contiguous only**: Only finds contiguous subarrays
3. ❌ **All negatives**: Need special handling

---

## When to Use

- ✅ **Maximum sum**: Finding maximum sum of contiguous subarray
- ✅ **Large arrays**: Optimal for any size array
- ✅ **Real-time**: Single pass makes it suitable for streaming data
- ❌ **Maximum product**: Different algorithm needed
- ❌ **Non-contiguous**: Need different approach for subsequences

---

## Variations

1. **Maximum Product Subarray**: Similar approach but track both min and max product
2. **Circular Array**: Maximum subarray in circular array (two passes)
3. **2D Maximum Subarray**: Extend to 2D arrays (more complex)

---

## Testing

Run the test suite:

```bash
python kadane_test.py
```

---

## Related Algorithms

- **Maximum Product Subarray**: Similar approach for product
- **Longest Increasing Subsequence**: Different DP pattern
- **Prefix Sums**: Related technique for range queries

---

## Applications

1. **Stock Trading**: Find best time to buy and sell (maximum profit)
2. **Signal Processing**: Find maximum signal strength
3. **Data Analysis**: Find maximum sum in time series
4. **Image Processing**: Find maximum intensity region

---

## References

- Bentley, J. (1984). "Programming Pearls: Algorithm Design Techniques". Communications of the ACM 27(9) (the column that published Kadane's linear-time algorithm)
- "Introduction to Algorithms" by CLRS (Chapter 4)
- LeetCode Problem 53: Maximum Subarray

---

_Last Updated: December 2025_
