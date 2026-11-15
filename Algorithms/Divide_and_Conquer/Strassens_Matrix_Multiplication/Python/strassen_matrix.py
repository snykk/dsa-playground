"""
Strassen's Matrix Multiplication Implementation

Strassen's algorithm is a divide and conquer algorithm for matrix multiplication
that reduces the time complexity from O(n^3) to O(n^log2(7)) ~ O(n^2.81).
"""


def matrix_multiply_naive(A, B):
    """
    Naive matrix multiplication for comparison
    
    Args:
        A: First matrix (n x n)
        B: Second matrix (n x n)
        
    Returns:
        Product matrix C = A x B
        
    Time Complexity: O(n^3)
    Space Complexity: O(n^2)
    """
    n = len(A)
    C = [[0 for _ in range(n)] for _ in range(n)]
    
    for i in range(n):
        for j in range(n):
            for k in range(n):
                C[i][j] += A[i][k] * B[k][j]
    
    return C


def matrix_add(A, B):
    """Add two matrices"""
    n = len(A)
    return [[A[i][j] + B[i][j] for j in range(n)] for i in range(n)]


def matrix_subtract(A, B):
    """Subtract two matrices"""
    n = len(A)
    return [[A[i][j] - B[i][j] for j in range(n)] for i in range(n)]


def split_matrix(matrix):
    """Split matrix into 4 quadrants"""
    n = len(matrix)
    mid = n // 2
    
    A11 = [row[:mid] for row in matrix[:mid]]
    A12 = [row[mid:] for row in matrix[:mid]]
    A21 = [row[:mid] for row in matrix[mid:]]
    A22 = [row[mid:] for row in matrix[mid:]]
    
    return A11, A12, A21, A22


def combine_matrices(C11, C12, C21, C22):
    """Combine 4 quadrants into single matrix"""
    n = len(C11)
    C = [[0 for _ in range(2 * n)] for _ in range(2 * n)]
    
    for i in range(n):
        for j in range(n):
            C[i][j] = C11[i][j]
            C[i][j + n] = C12[i][j]
            C[i + n][j] = C21[i][j]
            C[i + n][j + n] = C22[i][j]
    
    return C


def strassen_multiply(A, B, cutoff=64):
    """
    Multiply two matrices using Strassen's algorithm
    
    Args:
        A: First matrix (n x n)
        B: Second matrix (n x n)
        cutoff: sizes n <= cutoff use the naive triple loop instead of
            splitting again (default 64; must be at least 1)
        
    Returns:
        Product matrix C = A x B
        
    Raises:
        ValueError: if cutoff is below 1
        
    Time Complexity: O(n^log2(7)) ~ O(n^2.81)
    Space Complexity: O(n^2)
    """
    if cutoff < 1:
        raise ValueError("cutoff must be at least 1")
    n = len(A)
    
    # Base case: if matrix is 1x1
    if n == 1:
        return [[A[0][0] * B[0][0]]]
    
    # For small matrices, use naive multiplication
    if n <= cutoff:
        return matrix_multiply_naive(A, B)
    
    # An odd size cannot be split into equal quadrants: pad by one zero row and
    # column, multiply, and cut the padding off again.
    if n % 2 == 1:
        C = strassen_multiply(pad_matrix(A, n + 1), pad_matrix(B, n + 1), cutoff)
        return [row[:n] for row in C[:n]]
    
    # Split matrices into quadrants
    A11, A12, A21, A22 = split_matrix(A)
    B11, B12, B21, B22 = split_matrix(B)
    
    # Calculate 7 products (Strassen's key insight)
    # P1 = A11 x (B12 - B22)
    P1 = strassen_multiply(A11, matrix_subtract(B12, B22), cutoff)
    
    # P2 = (A11 + A12) x B22
    P2 = strassen_multiply(matrix_add(A11, A12), B22, cutoff)
    
    # P3 = (A21 + A22) x B11
    P3 = strassen_multiply(matrix_add(A21, A22), B11, cutoff)
    
    # P4 = A22 x (B21 - B11)
    P4 = strassen_multiply(A22, matrix_subtract(B21, B11), cutoff)
    
    # P5 = (A11 + A22) x (B11 + B22)
    P5 = strassen_multiply(matrix_add(A11, A22), matrix_add(B11, B22), cutoff)
    
    # P6 = (A12 - A22) x (B21 + B22)
    P6 = strassen_multiply(matrix_subtract(A12, A22), matrix_add(B21, B22), cutoff)
    
    # P7 = (A11 - A21) x (B11 + B12)
    P7 = strassen_multiply(matrix_subtract(A11, A21), matrix_add(B11, B12), cutoff)
    
    # Calculate result quadrants
    # C11 = P5 + P4 - P2 + P6
    C11 = matrix_add(matrix_subtract(matrix_add(P5, P4), P2), P6)
    
    # C12 = P1 + P2
    C12 = matrix_add(P1, P2)
    
    # C21 = P3 + P4
    C21 = matrix_add(P3, P4)
    
    # C22 = P5 + P1 - P3 - P7
    C22 = matrix_subtract(matrix_subtract(matrix_add(P5, P1), P3), P7)
    
    # Combine quadrants
    return combine_matrices(C11, C12, C21, C22)


def pad_matrix(matrix, target_size):
    """Pad matrix to target size (power of 2) with zeros"""
    rows = len(matrix)
    cols = len(matrix[0]) if rows > 0 else 0
    
    if rows == target_size and cols == target_size:
        return matrix
    
    padded = [[0 for _ in range(target_size)] for _ in range(target_size)]
    for i in range(min(rows, target_size)):
        for j in range(min(cols, target_size)):
            padded[i][j] = matrix[i][j]
    return padded


def next_power_of_2(n):
    """Find next power of 2 >= n"""
    power = 1
    while power < n:
        power *= 2
    return power


def strassen_multiply_general(A, B, cutoff=64):
    """
    Multiply matrices of any size using Strassen's algorithm
    Automatically pads to power of 2 if needed
    
    Args:
        A: First matrix (m x n)
        B: Second matrix (n x p)
        cutoff: passed to strassen_multiply (default 64; must be at least 1)
        
    Returns:
        Product matrix C = A x B (m x p)
        
    Raises:
        ValueError: if cutoff is below 1, or if the inner dimensions differ
    """
    m, n1 = len(A), len(A[0])
    n2, p = len(B), len(B[0])
    
    if cutoff < 1:
        raise ValueError("cutoff must be at least 1")
    if n1 != n2:
        raise ValueError("Matrix dimensions incompatible for multiplication")
    
    # Find maximum dimension and next power of 2
    max_dim = max(m, n1, p)
    size = next_power_of_2(max_dim)
    
    # Pad matrices
    A_padded = pad_matrix(A, size)
    B_padded = pad_matrix(B, size)
    
    # Multiply using Strassen's
    C_padded = strassen_multiply(A_padded, B_padded, cutoff)
    
    # Extract result (remove padding)
    C = [[C_padded[i][j] for j in range(p)] for i in range(m)]
    
    return C

