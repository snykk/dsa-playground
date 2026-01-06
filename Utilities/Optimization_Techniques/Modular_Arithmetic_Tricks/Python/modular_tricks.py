"""
Modular Arithmetic Tricks for Competitive Programming (Python)
"""

from typing import Tuple, List

MOD = 10**9 + 7

# ==================== Basic Operations ====================

def mod(x: int, m: int = MOD) -> int:
    """Safe modulo operation."""
    return ((x % m) + m) % m

def add(a: int, b: int, m: int = MOD) -> int:
    """Modular addition."""
    return (a % m + b % m) % m

def sub(a: int, b: int, m: int = MOD) -> int:
    """Modular subtraction."""
    return ((a % m - b % m) % m + m) % m

def mul(a: int, b: int, m: int = MOD) -> int:
    """Modular multiplication."""
    return (a % m * b % m) % m

# ==================== Fast Exponentiation ====================

def power(base: int, exp: int, m: int = MOD) -> int:
    """Fast modular exponentiation using binary exponentiation."""
    result = 1
    base = base % m
    while exp > 0:
        if exp & 1:
            result = result * base % m
        base = base * base % m
        exp >>= 1
    return result

# ==================== Modular Inverse ====================

def mod_inverse(a: int, m: int = MOD) -> int:
    """Modular inverse using Fermat's Little Theorem (m must be prime)."""
    return power(a, m - 2, m)

def ext_gcd(a: int, b: int) -> Tuple[int, int, int]:
    """Extended Euclidean Algorithm. Returns (gcd, x, y) where ax + by = gcd."""
    if b == 0:
        return a, 1, 0
    g, x1, y1 = ext_gcd(b, a % b)
    x = y1
    y = x1 - (a // b) * y1
    return g, x, y

def mod_inverse_ext_gcd(a: int, m: int = MOD) -> int:
    """Modular inverse using Extended GCD (works for any coprime a, m)."""
    g, x, _ = ext_gcd(a, m)
    if g != 1:
        return -1  # Inverse doesn't exist
    return mod(x, m)

def div_mod(a: int, b: int, m: int = MOD) -> int:
    """Modular division: a / b mod m."""
    return mul(a, mod_inverse(b, m), m)

# ==================== Precomputed Factorials ====================

class Factorials:
    """Precomputed factorials for fast nCr and nPr."""
    
    def __init__(self, n: int, m: int = MOD):
        self.m = m
        self.fact = [1] * (n + 1)
        self.inv_fact = [1] * (n + 1)
        
        for i in range(1, n + 1):
            self.fact[i] = self.fact[i-1] * i % m
        
        self.inv_fact[n] = power(self.fact[n], m - 2, m)
        for i in range(n - 1, -1, -1):
            self.inv_fact[i] = self.inv_fact[i+1] * (i+1) % m
    
    def nCr(self, n: int, r: int) -> int:
        """Combinations: n choose r."""
        if r < 0 or r > n:
            return 0
        return self.fact[n] * self.inv_fact[r] % self.m * self.inv_fact[n-r] % self.m
    
    def nPr(self, n: int, r: int) -> int:
        """Permutations: n permute r."""
        if r < 0 or r > n:
            return 0
        return self.fact[n] * self.inv_fact[n-r] % self.m

# ==================== Lucas Theorem ====================

def lucas_nCr(n: int, r: int, p: int, fact_obj: Factorials) -> int:
    """nCr mod p for large n using Lucas' theorem."""
    if r == 0:
        return 1
    return mul(
        lucas_nCr(n // p, r // p, p, fact_obj),
        fact_obj.nCr(n % p, r % p),
        p
    )

# ==================== Chinese Remainder Theorem ====================

def chinese_remainder(remainders: List[int], moduli: List[int]) -> int:
    """Solve system of congruences using CRT."""
    M = 1
    for m in moduli:
        M *= m
    
    result = 0
    for r, m in zip(remainders, moduli):
        Mi = M // m
        result += r * Mi * mod_inverse_ext_gcd(Mi, m)
    
    return result % M

# ==================== Matrix Exponentiation ====================

def matrix_mult(A: List[List[int]], B: List[List[int]], m: int = MOD) -> List[List[int]]:
    """Matrix multiplication mod m."""
    n = len(A)
    C = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            for k in range(n):
                C[i][j] = (C[i][j] + A[i][k] * B[k][j]) % m
    return C

def matrix_power(M: List[List[int]], exp: int, m: int = MOD) -> List[List[int]]:
    """Matrix exponentiation."""
    n = len(M)
    result = [[1 if i == j else 0 for j in range(n)] for i in range(n)]  # Identity
    
    while exp > 0:
        if exp & 1:
            result = matrix_mult(result, M, m)
        M = matrix_mult(M, M, m)
        exp >>= 1
    
    return result

def fibonacci(n: int, m: int = MOD) -> int:
    """Calculate nth Fibonacci using matrix exponentiation."""
    if n <= 1:
        return n
    M = [[1, 1], [1, 0]]
    result = matrix_power(M, n - 1, m)
    return result[0][0]


if __name__ == "__main__":
    # Example usage
    fact = Factorials(1000)
    
    print(f"5! mod MOD = {fact.fact[5]}")
    print(f"C(10, 3) = {fact.nCr(10, 3)}")
    print(f"P(10, 3) = {fact.nPr(10, 3)}")
    print(f"2^10 mod MOD = {power(2, 10)}")
    print(f"Inverse of 3 = {mod_inverse(3)}")
    print(f"Fibonacci(10) = {fibonacci(10)}")

