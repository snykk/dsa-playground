"""
Coin Change Problem Implementation

Given coins of different denominations and a total amount, find the minimum
number of coins needed to make that amount.
"""


def coin_change_min_coins(coins, amount):
    """
    Minimum number of coins to make amount (unbounded knapsack variant)
    
    Args:
        coins: List of coin denominations
        amount: Target amount
        
    Returns:
        Minimum number of coins, or -1 if impossible
        
    Time Complexity: O(n × amount)
    Space Complexity: O(amount)
    """
    if amount == 0:
        return 0
    
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    
    for coin in coins:
        for i in range(coin, amount + 1):
            dp[i] = min(dp[i], dp[i - coin] + 1)
    
    return dp[amount] if dp[amount] != float('inf') else -1


def coin_change_ways(coins, amount):
    """
    Number of ways to make amount (unbounded)
    
    Args:
        coins: List of coin denominations
        amount: Target amount
        
    Returns:
        Number of ways
        
    Time Complexity: O(n × amount)
    Space Complexity: O(amount)
    """
    dp = [0] * (amount + 1)
    dp[0] = 1
    
    for coin in coins:
        for i in range(coin, amount + 1):
            dp[i] += dp[i - coin]
    
    return dp[amount]


def coin_change_01(coins, amount):
    """
    Coin change with 0/1 constraint (each coin used at most once)
    
    Args:
        coins: List of coin denominations
        amount: Target amount
        
    Returns:
        Minimum number of coins
        
    Time Complexity: O(n × amount)
    Space Complexity: O(amount)
    """
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    
    for coin in coins:
        for i in range(amount, coin - 1, -1):
            dp[i] = min(dp[i], dp[i - coin] + 1)
    
    return dp[amount] if dp[amount] != float('inf') else -1

