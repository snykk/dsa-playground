"""
Edit Distance (Levenshtein Distance) Implementation

Minimum number of operations (insert, delete, replace) to convert
one string into another.
"""


def edit_distance(s1, s2):
    """
    Compute edit distance using DP
    
    Args:
        s1: First string
        s2: Second string
        
    Returns:
        Minimum edit distance
        
    Time Complexity: O(mn)
    Space Complexity: O(mn)
    """
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    # Base cases
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(
                    dp[i - 1][j],      # Delete
                    dp[i][j - 1],      # Insert
                    dp[i - 1][j - 1]   # Replace
                )
    
    return dp[m][n]

