"""
Bitmask Dynamic Programming

DP using bitmasks to represent state (often for subset problems).
"""


def traveling_salesman_dp(distances):
    """
    Traveling Salesman Problem using bitmask DP
    
    Args:
        distances: 2D matrix of distances between cities
        
    Returns:
        Minimum cost to visit all cities and return to start; float('inf')
        if no tour exists (every tour uses a missing edge); 0 for no cities
        
    Time Complexity: O(n^2 * 2^n)
    Space Complexity: O(n * 2^n)
    """
    n = len(distances)
    if n == 0:
        return 0
    
    # dp[mask][last] = minimum cost to visit cities in mask ending at last
    dp = [[float('inf')] * n for _ in range(1 << n)]
    dp[1][0] = 0  # Start at city 0
    
    for mask in range(1, 1 << n):
        if not (mask & 1):
            continue  # every tour starts at city 0
        for last in range(n):
            if not (mask & (1 << last)):
                continue
            
            for next_city in range(n):
                if mask & (1 << next_city):
                    continue
                
                new_mask = mask | (1 << next_city)
                dp[new_mask][next_city] = min(
                    dp[new_mask][next_city],
                    dp[mask][last] + distances[last][next_city]
                )
    
    # Return to start
    result = float('inf')
    for last in range(n):
        result = min(result, dp[(1 << n) - 1][last] + distances[last][0])
    
    return result

