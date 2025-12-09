# Longest Increasing Subsequence (Python)

**Longest Increasing Subsequence (LIS)** finds the longest subsequence of a given sequence such that all elements of the subsequence are sorted in strictly increasing order.

---

## Overview

LIS is a fundamental problem in dynamic programming and binary search. A subsequence is obtained by deleting some (or no) elements from the original sequence, without changing the order of remaining elements. The problem has two main approaches: O(n²) DP and O(n log n) binary search.

**Example**:
- Array: [10, 9, 2, 5, 3, 7, 101, 18]
- LIS: [2, 3, 7, 18] or [2, 5, 7, 101]
- Length: 4

---

## Algorithm

### DP Approach (O(n²))

1. **DP State**: `dp[i]` = length of LIS ending at index `i`
2. **Recurrence**: 
   - `dp[i] = max(dp[j] + 1)` for all `j < i` where `arr[j] < arr[i]`
   - For each position, check all previous positions
3. **Base Case**: `dp[i] = 1` for all `i` (each element is LIS of length 1)
4. **Result**: `max(dp)` over all indices

### Binary Search Approach (O(n log n))

1. **Maintain array `tails`**: `tails[i]` = smallest tail of all increasing subsequences of length `i+1`
2. **For each element**:
   - Use binary search to find position in `tails`
   - If element is larger than all tails, append it
   - Otherwise, replace first element >= current element
3. **Result**: Length of `tails` array

**Key Insight**: We only care about the smallest tail for each length, allowing binary search optimization.

---

## Complexity Analysis

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| **Naive Recursive** | O(2^n) | O(n) | Exponential, not practical |
| **DP Tabulation** | O(n²) | O(n) | Standard DP approach |
| **Binary Search** | O(n log n) | O(n) | Optimal for length only |
| **With Sequence** | O(n²) | O(n) | Need DP to reconstruct |

**Note**: Binary search approach is optimal for finding length, but DP is needed to reconstruct the actual sequence.

---

## Implementation Details

### Functions

1. **`lis_dp(arr)`**
   - Standard DP approach
   - Returns length of LIS
   - Time: O(n²), Space: O(n)

2. **`lis_binary_search(arr)`**
   - Optimized binary search approach
   - Returns length of LIS
   - Time: O(n log n), Space: O(n)
   - Best for large arrays when only length is needed

3. **`lis_with_sequence(arr)`**
   - Returns both length and actual LIS sequence
   - Uses DP with backtracking
   - Returns (length, sequence)
   - Time: O(n²), Space: O(n)

4. **`lis_naive_recursive(arr, prev=-1, curr=0)`**
   - Naive recursive implementation
   - O(2^n) time complexity
   - For educational purposes only

---

## Usage

```python
from lis import (
    lis_dp,
    lis_binary_search,
    lis_with_sequence,
    lis_naive_recursive
)

arr = [10, 9, 2, 5, 3, 7, 101, 18]

# DP approach (standard)
length = lis_dp(arr)
print(length)  # Output: 4

# Binary search (faster for large arrays)
length = lis_binary_search(arr)
print(length)  # Output: 4

# Get actual sequence
length, sequence = lis_with_sequence(arr)
print(length)   # Output: 4
print(sequence) # Output: [2, 3, 7, 18] or [2, 5, 7, 101]

# Edge cases
arr = [1, 2, 3, 4, 5]
length = lis_dp(arr)  # Output: 5 (entire array is increasing)

arr = [5, 4, 3, 2, 1]
length = lis_dp(arr)  # Output: 1 (each element is LIS of length 1)
```

---

## Important Notes

1. **Subsequence vs Subarray**: 
   - Subsequence: non-contiguous (LIS)
   - Subarray: contiguous (different problem)
2. **Strictly increasing**: Usually means `arr[i] < arr[j]` (can be modified to `<=`)
3. **Multiple LIS**: There may be multiple LIS of same length
4. **Binary search optimization**: Only works for length, not sequence reconstruction
5. **Patience sorting**: Binary search approach is related to patience card game

---

## Advantages

1. ✅ **Optimal**: Binary search gives O(n log n) for length
2. ✅ **Efficient**: DP gives O(n²) which is acceptable for most cases
3. ✅ **Flexible**: Can get length or actual sequence
4. ✅ **Educational**: Great for learning DP and binary search

---

## Disadvantages

1. ❌ **Quadratic time**: DP approach is O(n²) which can be slow for large n
2. ❌ **Sequence reconstruction**: Need O(n²) DP to get actual sequence
3. ❌ **Memory**: O(n) space for both approaches

---

## When to Use

- ✅ **Binary Search**: When only length is needed and n is large
- ✅ **DP Approach**: When actual sequence is needed or n is moderate
- ✅ **Large arrays**: Binary search is better for n > 10^4
- ❌ **Naive Recursive**: Never in production, only for learning

---

## Comparison: DP vs Binary Search

| Aspect | DP Approach | Binary Search |
|--------|------------|---------------|
| **Time** | O(n²) | O(n log n) |
| **Space** | O(n) | O(n) |
| **Sequence** | Can reconstruct | Length only |
| **Best For** | Small-medium n, need sequence | Large n, length only |

---

## Testing

Run the test suite:

```bash
python lis_test.py
```

---

## Related Algorithms

- **Longest Common Subsequence**: Similar DP structure
- **Longest Decreasing Subsequence**: Reverse the problem
- **Longest Bitonic Subsequence**: Combination of LIS and LDS
- **Russian Doll Envelopes**: 2D version of LIS

---

## Applications

1. **Stock Market**: Find longest period of increasing prices
2. **Scheduling**: Optimize task scheduling with dependencies
3. **Bioinformatics**: Find longest increasing subsequence in DNA
4. **Data Analysis**: Find trends in time series data

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 15)
- "Algorithm Design Manual" by Steven Skiena
- LeetCode Problem 300: Longest Increasing Subsequence

---

_Last Updated: December 2025_
