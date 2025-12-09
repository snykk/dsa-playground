"""
Fibonacci Numbers Implementation

Fibonacci sequence: F(n) = F(n-1) + F(n-2)
Base cases: F(0) = 0, F(1) = 1
"""


def fibonacci_naive(n):
    """
    Naive recursive implementation (inefficient)
    
    Args:
        n: Index in Fibonacci sequence
        
    Returns:
        nth Fibonacci number
        
    Time Complexity: O(2^n)
    Space Complexity: O(n)
    """
    if n <= 1:
        return n
    return fibonacci_naive(n - 1) + fibonacci_naive(n - 2)


def fibonacci_memoization(n, memo=None):
    """
    Fibonacci using memoization (top-down DP)
    
    Args:
        n: Index in Fibonacci sequence
        memo: Dictionary for memoization
        
    Returns:
        nth Fibonacci number
        
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    if memo is None:
        memo = {}
    
    if n in memo:
        return memo[n]
    
    if n <= 1:
        return n
    
    memo[n] = fibonacci_memoization(n - 1, memo) + fibonacci_memoization(n - 2, memo)
    return memo[n]


def fibonacci_tabulation(n):
    """
    Fibonacci using tabulation (bottom-up DP)
    
    Args:
        n: Index in Fibonacci sequence
        
    Returns:
        nth Fibonacci number
        
    Time Complexity: O(n)
    Space Complexity: O(n)
    """
    if n <= 1:
        return n
    
    dp = [0] * (n + 1)
    dp[0] = 0
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    
    return dp[n]


def fibonacci_optimized(n):
    """
    Space-optimized Fibonacci (O(1) space)
    
    Args:
        n: Index in Fibonacci sequence
        
    Returns:
        nth Fibonacci number
        
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    if n <= 1:
        return n
    
    prev2 = 0
    prev1 = 1
    
    for i in range(2, n + 1):
        current = prev1 + prev2
        prev2 = prev1
        prev1 = current
    
    return prev1


def fibonacci_matrix(n):
    """
    Fibonacci using matrix exponentiation (O(log n))
    
    Args:
        n: Index in Fibonacci sequence
        
    Returns:
        nth Fibonacci number
        
    Time Complexity: O(log n)
    Space Complexity: O(1)
    """
    if n <= 1:
        return n
    
    def matrix_multiply(A, B):
        return [
            [A[0][0] * B[0][0] + A[0][1] * B[1][0],
             A[0][0] * B[0][1] + A[0][1] * B[1][1]],
            [A[1][0] * B[0][0] + A[1][1] * B[1][0],
             A[1][0] * B[0][1] + A[1][1] * B[1][1]]
        ]
    
    def matrix_power(matrix, power):
        if power == 1:
            return matrix
        if power % 2 == 0:
            half = matrix_power(matrix, power // 2)
            return matrix_multiply(half, half)
        else:
            return matrix_multiply(matrix, matrix_power(matrix, power - 1))
    
    # Transformation matrix: [[1,1],[1,0]]
    base_matrix = [[1, 1], [1, 0]]
    result_matrix = matrix_power(base_matrix, n)
    
    return result_matrix[0][1]


def fibonacci_sequence(n):
    """
    Generate first n Fibonacci numbers
    
    Args:
        n: Number of Fibonacci numbers to generate
        
    Returns:
        List of first n Fibonacci numbers
    """
    if n <= 0:
        return []
    if n == 1:
        return [0]
    if n == 2:
        return [0, 1]
    
    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[i - 1] + sequence[i - 2])
    
    return sequence

