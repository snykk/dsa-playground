"""
Climbing Stairs Problem Implementation

You are climbing a staircase. It takes n steps to reach the top.
Each time you can either climb 1 or 2 steps. In how many distinct ways
can you climb to the top?
"""


def climbing_stairs_naive(n):
    """
    Naive recursive solution
    
    Args:
        n: Number of steps
        
    Returns:
        Number of distinct ways to climb
        
    Time Complexity: O(2^n)
    Space Complexity: O(n)
    """
    if n <= 2:
        return n
    return climbing_stairs_naive(n - 1) + climbing_stairs_naive(n - 2)


def climbing_stairs_memoization(n, memo=None):
    """
    Climbing stairs using memoization
    
    Args:
        n: Number of steps
        memo: Dictionary for memoization
        
    Returns:
        Number of distinct ways
        
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    if memo is None:
        memo = {}
    
    if n in memo:
        return memo[n]
    
    if n <= 2:
        return n
    
    memo[n] = (climbing_stairs_memoization(n - 1, memo) + 
               climbing_stairs_memoization(n - 2, memo))
    return memo[n]


def climbing_stairs_tabulation(n):
    """
    Climbing stairs using tabulation
    
    Args:
        n: Number of steps
        
    Returns:
        Number of distinct ways
        
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    if n <= 2:
        return n
    
    dp = [0] * (n + 1)
    dp[1] = 1
    dp[2] = 2
    
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    
    return dp[n]


def climbing_stairs_optimized(n):
    """
    Space-optimized climbing stairs
    
    Args:
        n: Number of steps
        
    Returns:
        Number of distinct ways
        
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    if n <= 2:
        return n
    
    prev2 = 1
    prev1 = 2
    
    for i in range(3, n + 1):
        current = prev1 + prev2
        prev2 = prev1
        prev1 = current
    
    return prev1


def climbing_stairs_variable_steps(n, steps):
    """
    Climbing stairs with variable step sizes
    
    Args:
        n: Number of steps
        steps: List of allowed step sizes
        
    Returns:
        Number of distinct ways
        
    Time Complexity: O(n × k) where k is number of step sizes
    Space Complexity: O(n)
    """
    if n == 0:
        return 1
    if n < 0:
        return 0
    
    dp = [0] * (n + 1)
    dp[0] = 1
    
    for i in range(1, n + 1):
        for step in steps:
            if i >= step:
                dp[i] += dp[i - step]
    
    return dp[n]

