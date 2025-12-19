"""
Matrix Exponentiation Implementation

Matrix exponentiation computes A^k efficiently using binary exponentiation,
where A is a square matrix and k is a non-negative integer.
"""


def matrix_multiply(A, B, mod=None):
    """
    Multiply two matrices A and B
    
    Args:
        A: First matrix (n × m)
        B: Second matrix (m × p)
        mod: Optional modulus for modular arithmetic
        
    Returns:
        Result matrix (n × p)
        
    Time Complexity: O(n × m × p)
    Space Complexity: O(n × p)
    """
    n = len(A)
    m = len(B)
    p = len(B[0])
    
    result = [[0] * p for _ in range(n)]
    
    for i in range(n):
        for j in range(p):
            for k in range(m):
                if mod:
                    result[i][j] = (result[i][j] + A[i][k] * B[k][j]) % mod
                else:
                    result[i][j] += A[i][k] * B[k][j]
    
    return result


def matrix_identity(n):
    """
    Create n × n identity matrix
    
    Args:
        n: Size of matrix
        
    Returns:
        Identity matrix of size n × n
    """
    return [[1 if i == j else 0 for j in range(n)] for i in range(n)]


def matrix_power(A, k, mod=None):
    """
    Compute A^k using binary exponentiation
    
    Args:
        A: Square matrix (n × n)
        k: Non-negative integer exponent
        mod: Optional modulus for modular arithmetic
        
    Returns:
        A^k (n × n matrix)
        
    Time Complexity: O(n³ log k)
    Space Complexity: O(n²)
    """
    n = len(A)
    
    # Base case: A^0 = I
    if k == 0:
        return matrix_identity(n)
    
    # Base case: A^1 = A
    if k == 1:
        if mod:
            return [[A[i][j] % mod for j in range(n)] for i in range(n)]
        return [row[:] for row in A]
    
    # Recursive case: A^k = (A^(k/2))^2 if k is even
    if k % 2 == 0:
        half_power = matrix_power(A, k // 2, mod)
        return matrix_multiply(half_power, half_power, mod)
    else:
        # A^k = A × A^(k-1)
        return matrix_multiply(A, matrix_power(A, k - 1, mod), mod)


def matrix_power_iterative(A, k, mod=None):
    """
    Compute A^k using iterative binary exponentiation
    
    Args:
        A: Square matrix (n × n)
        k: Non-negative integer exponent
        mod: Optional modulus for modular arithmetic
        
    Returns:
        A^k (n × n matrix)
        
    Time Complexity: O(n³ log k)
    Space Complexity: O(n²)
    """
    n = len(A)
    result = matrix_identity(n)
    base = [row[:] for row in A]
    
    if mod:
        base = [[base[i][j] % mod for j in range(n)] for i in range(n)]
    
    while k > 0:
        if k % 2 == 1:
            result = matrix_multiply(result, base, mod)
        base = matrix_multiply(base, base, mod)
        k //= 2
    
    return result


def fibonacci_matrix(n, mod=None):
    """
    Compute nth Fibonacci number using matrix exponentiation
    
    Uses the relation: [F(n+1), F(n)]^T = [[1,1],[1,0]]^n × [F(1), F(0)]^T
    
    Args:
        n: Index of Fibonacci number (non-negative)
        mod: Optional modulus
        
    Returns:
        nth Fibonacci number
        
    Time Complexity: O(log n)
    Space Complexity: O(1)
    """
    if n == 0:
        return 0
    if n == 1:
        return 1
    
    # Transformation matrix
    T = [[1, 1], [1, 0]]
    T_power = matrix_power(T, n - 1, mod)
    
    # Initial vector [F(1), F(0)]
    initial = [[1], [0]]
    result = matrix_multiply(T_power, initial, mod)
    
    return result[0][0]


if __name__ == "__main__":
    # Example usage
    print("Matrix Exponentiation Examples:")
    
    # Example 1: Compute 2x2 matrix to power 5
    A = [[1, 1], [1, 0]]
    A_5 = matrix_power(A, 5)
    print(f"A^5 where A = [[1,1],[1,0]]:")
    for row in A_5:
        print(row)
    
    # Example 2: Fibonacci using matrix exponentiation
    print(f"\nFibonacci numbers using matrix exponentiation:")
    for i in range(10):
        fib = fibonacci_matrix(i)
        print(f"F({i}) = {fib}")
    
    # Example 3: Matrix power with modulus
    print(f"\nMatrix power with modulus:")
    A_10_mod = matrix_power_iterative(A, 10, mod=1000)
    for row in A_10_mod:
        print(row)
