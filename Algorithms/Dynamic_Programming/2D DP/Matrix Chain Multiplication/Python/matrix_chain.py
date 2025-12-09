"""
Matrix Chain Multiplication Implementation

Find the minimum number of scalar multiplications needed to multiply
a chain of matrices.
"""


def matrix_chain_multiplication(dims):
    """
    Find minimum scalar multiplications
    
    Args:
        dims: List of matrix dimensions [p0, p1, p2, ..., pn]
              where matrix i has dimensions dims[i] × dims[i+1]
        
    Returns:
        Minimum number of scalar multiplications
        
    Time Complexity: O(n³)
    Space Complexity: O(n²)
    """
    n = len(dims) - 1
    dp = [[0] * (n + 1) for _ in range(n + 1)]
    
    # l is chain length
    for l in range(2, n + 1):
        for i in range(1, n - l + 2):
            j = i + l - 1
            dp[i][j] = float('inf')
            
            for k in range(i, j):
                cost = (dp[i][k] + dp[k + 1][j] + 
                       dims[i - 1] * dims[k] * dims[j])
                dp[i][j] = min(dp[i][j], cost)
    
    return dp[1][n]

