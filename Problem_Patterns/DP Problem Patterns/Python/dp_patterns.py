"""
Dynamic Programming Patterns Implementation

This module contains implementations of common DP patterns:
1. 0/1 Knapsack
2. Longest Common Subsequence (LCS)
3. Longest Increasing Subsequence (LIS)
"""

from typing import List

def knapsack_01(weights: List[int], values: List[int], capacity: int) -> int:
    """
    Solve 0/1 Knapsack problem.
    Time Complexity: O(N * W)
    Space Complexity: O(W) (optimized)
    
    Args:
        weights: List of item weights
        values: List of item values
        capacity: Maximum weight capacity
        
    Returns:
        Maximum value possible
    """
    n = len(weights)
    # Using 1D array for space optimization
    dp = [0] * (capacity + 1)
    
    for i in range(n):
        # Iterate backwards to avoid using same item multiple times
        for w in range(capacity, weights[i] - 1, -1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
            
    return dp[capacity]


def lcs(text1: str, text2: str) -> int:
    """
    Find length of Longest Common Subsequence.
    Time Complexity: O(N * M)
    Space Complexity: O(min(N, M)) (optimized)
    
    Args:
        text1: First string
        text2: Second string
        
    Returns:
        Length of LCS
    """
    if len(text1) < len(text2):
        text1, text2 = text2, text1
        
    m, n = len(text1), len(text2)
    # Previous and current row
    prev = [0] * (n + 1)
    curr = [0] * (n + 1)
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                curr[j] = 1 + prev[j-1]
            else:
                curr[j] = max(prev[j], curr[j-1])
        # Move current to previous for next iteration
        prev[:] = curr[:]
        
    return prev[n]


def lis(nums: List[int]) -> int:
    """
    Find length of Longest Increasing Subsequence.
    Time Complexity: O(N^2) (Standard DP) -> Optimized to O(N log N) using patience sorting
    Space Complexity: O(N)
    
    Args:
        nums: List of integers
        
    Returns:
        Length of LIS
    """
    if not nums:
        return 0
        
    n = len(nums)
    # tails[i] stores the smallest tail of all increasing subsequences of length i+1.
    tails = []
    
    for num in nums:
        # Binary search for num in tails
        import bisect
        idx = bisect.bisect_left(tails, num)
        
        if idx < len(tails):
            tails[idx] = num
        else:
            tails.append(num)
            
    return len(tails)


def main():
    print("=== 0/1 Knapsack ===")
    weights = [10, 20, 30]
    values = [60, 100, 120]
    cap = 50
    print(f"Max Value: {knapsack_01(weights, values, cap)}") # Expected: 220 (20+30)
    
    print("\n=== Longest Common Subsequence ===")
    s1 = "abcde"
    s2 = "ace"
    print(f"LCS of '{s1}' and '{s2}': {lcs(s1, s2)}") # Expected: 3 ("ace")
    
    print("\n=== Longest Increasing Subsequence ===")
    nums = [10, 9, 2, 5, 3, 7, 101, 18]
    print(f"LIS of {nums}: {lis(nums)}") # Expected: 4 ([2, 3, 7, 18] or [2, 5, 7, 101] etc)


if __name__ == "__main__":
    main()
