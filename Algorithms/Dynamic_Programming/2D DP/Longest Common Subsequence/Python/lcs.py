"""
Longest Common Subsequence (LCS) Implementation

Find the length of the longest subsequence common to two strings.
A subsequence is a sequence that appears in the same relative order,
but not necessarily contiguous.
"""


def lcs_length(s1, s2):
    """
    Find length of LCS using DP
    
    Args:
        s1: First string
        s2: Second string
        
    Returns:
        Length of LCS
        
    Time Complexity: O(mn)
    Space Complexity: O(mn)
    """
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    
    return dp[m][n]


def lcs_sequence(s1, s2):
    """
    Find actual LCS sequence
    
    Args:
        s1: First string
        s2: Second string
        
    Returns:
        LCS string
        
    Time Complexity: O(mn)
    Space Complexity: O(mn)
    """
    m, n = len(s1), len(s2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    # Build DP table
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    
    # Reconstruct sequence
    i, j = m, n
    result = []
    
    while i > 0 and j > 0:
        if s1[i - 1] == s2[j - 1]:
            result.append(s1[i - 1])
            i -= 1
            j -= 1
        elif dp[i - 1][j] > dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    
    return ''.join(reversed(result))


def lcs_optimized(s1, s2):
    """
    Space-optimized LCS (O(min(m,n)) space)
    
    Args:
        s1: First string
        s2: Second string
        
    Returns:
        Length of LCS
        
    Time Complexity: O(mn)
    Space Complexity: O(min(m,n))
    """
    if len(s1) < len(s2):
        s1, s2 = s2, s1
    
    m, n = len(s1), len(s2)
    prev = [0] * (n + 1)
    curr = [0] * (n + 1)
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                curr[j] = prev[j - 1] + 1
            else:
                curr[j] = max(prev[j], curr[j - 1])
        prev, curr = curr, prev
    
    return prev[n]

