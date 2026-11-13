"""
0/1 Knapsack Problem Implementation

Given items with weights and values, fill a knapsack of capacity W to maximize
total value. Each item can be used at most once.
"""


def knapsack_01(weights, values, capacity):
    """
    0/1 Knapsack using DP
    
    Args:
        weights: List of item weights
        values: List of item values
        capacity: Maximum weight capacity
        
    Returns:
        Maximum value achievable
        
    Time Complexity: O(n x W)
    Space Complexity: O(n x W)
    """
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            if weights[i - 1] <= w:
                dp[i][w] = max(
                    dp[i - 1][w],
                    dp[i - 1][w - weights[i - 1]] + values[i - 1]
                )
            else:
                dp[i][w] = dp[i - 1][w]
    
    return dp[n][capacity]


def knapsack_01_optimized(weights, values, capacity):
    """
    Space-optimized 0/1 Knapsack (O(W) space)
    
    Args:
        weights: List of item weights
        values: List of item values
        capacity: Maximum weight capacity
        
    Returns:
        Maximum value achievable
        
    Time Complexity: O(n x W)
    Space Complexity: O(W)
    """
    n = len(weights)
    dp = [0] * (capacity + 1)
    
    for i in range(n):
        for w in range(capacity, weights[i] - 1, -1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
    
    return dp[capacity]

