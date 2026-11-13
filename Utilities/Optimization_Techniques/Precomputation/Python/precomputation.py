"""
Precomputation Techniques for Competitive Programming (Python)
"""

from typing import List, Tuple
from math import log2

MOD = 10**9 + 7
MAXN = 200005

# ==================== Factorial Precomputation ====================

def power(base: int, exp: int, mod: int = MOD) -> int:
    """Fast modular exponentiation."""
    result = 1
    while exp > 0:
        if exp & 1:
            result = result * base % mod
        base = base * base % mod
        exp >>= 1
    return result


class Factorials:
    """Precomputed factorials and inverse factorials."""
    
    def __init__(self, n: int, mod: int = MOD):
        self.mod = mod
        self.fact = [1] * (n + 1)
        self.inv_fact = [1] * (n + 1)
        
        for i in range(1, n + 1):
            self.fact[i] = self.fact[i-1] * i % mod
        
        self.inv_fact[n] = power(self.fact[n], mod - 2, mod)
        for i in range(n - 1, -1, -1):
            self.inv_fact[i] = self.inv_fact[i+1] * (i+1) % mod
    
    def nCr(self, n: int, r: int) -> int:
        if r < 0 or r > n:
            return 0
        return self.fact[n] * self.inv_fact[r] % self.mod * self.inv_fact[n-r] % self.mod
    
    def nPr(self, n: int, r: int) -> int:
        if r < 0 or r > n:
            return 0
        return self.fact[n] * self.inv_fact[n-r] % self.mod


# ==================== Prime Sieve ====================

def sieve(n: int) -> Tuple[List[int], List[bool]]:
    """Sieve of Eratosthenes. Returns (primes list, is_prime array).

    is_prime has n + 1 entries (index = number); for n < 2 there are no primes.
    """
    if n < 2:
        return [], [False] * max(n + 1, 0)
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    
    for i in range(2, int(n**0.5) + 1):
        if is_prime[i]:
            for j in range(i*i, n + 1, i):
                is_prime[j] = False
    
    primes = [i for i in range(n + 1) if is_prime[i]]
    return primes, is_prime


# ==================== Smallest Prime Factor ====================

def compute_spf(n: int) -> List[int]:
    """Compute smallest prime factor for each number."""
    spf = list(range(n + 1))
    
    for i in range(2, int(n**0.5) + 1):
        if spf[i] == i:  # i is prime
            for j in range(i*i, n + 1, i):
                if spf[j] == j:
                    spf[j] = i
    
    return spf


def factorize(n: int, spf: List[int]) -> List[Tuple[int, int]]:
    """Factorize n using precomputed SPF. Returns list of (prime, count)."""
    factors = []
    while n > 1:
        p = spf[n]
        cnt = 0
        while n % p == 0:
            n //= p
            cnt += 1
        factors.append((p, cnt))
    return factors


# ==================== Prefix Sums ====================

class PrefixSum:
    """1D prefix sum array."""
    
    def __init__(self, arr: List[int]):
        n = len(arr)
        self.prefix = [0] * (n + 1)
        for i in range(n):
            self.prefix[i + 1] = self.prefix[i] + arr[i]
    
    def range_sum(self, l: int, r: int) -> int:
        """Sum of arr[l:r+1]."""
        return self.prefix[r + 1] - self.prefix[l]


class PrefixSum2D:
    """2D prefix sum for grid."""
    
    def __init__(self, grid: List[List[int]]):
        n, m = len(grid), len(grid[0])
        self.prefix = [[0] * (m + 1) for _ in range(n + 1)]
        
        for i in range(1, n + 1):
            for j in range(1, m + 1):
                self.prefix[i][j] = (grid[i-1][j-1] 
                                   + self.prefix[i-1][j] 
                                   + self.prefix[i][j-1] 
                                   - self.prefix[i-1][j-1])
    
    def rect_sum(self, r1: int, c1: int, r2: int, c2: int) -> int:
        """Sum of subgrid from (r1,c1) to (r2,c2)."""
        return (self.prefix[r2+1][c2+1] 
              - self.prefix[r1][c2+1] 
              - self.prefix[r2+1][c1] 
              + self.prefix[r1][c1])


# ==================== Sparse Table (Range Minimum Query) ====================

class SparseTable:
    """Sparse table for O(1) range queries.

    func must be idempotent (func(x, x) == x), such as min, max or math.gcd:
    the O(1) query combines two overlapping blocks, so a non-idempotent
    function such as addition would count the overlap twice. Use a prefix sum
    for sums.
    """
    
    def __init__(self, arr: List[int], func=min):
        n = len(arr)
        self.func = func
        self.log = [0] * (n + 1)
        for i in range(2, n + 1):
            self.log[i] = self.log[i // 2] + 1
        
        k = self.log[n] + 1
        self.table = [[0] * k for _ in range(n)]
        
        for i in range(n):
            self.table[i][0] = arr[i]
        
        for j in range(1, k):
            for i in range(n - (1 << j) + 1):
                self.table[i][j] = func(
                    self.table[i][j-1],
                    self.table[i + (1 << (j-1))][j-1]
                )
    
    def query(self, l: int, r: int) -> int:
        """Query range [l, r]."""
        k = self.log[r - l + 1]
        return self.func(
            self.table[l][k],
            self.table[r - (1 << k) + 1][k]
        )


# ==================== LCA Precomputation ====================

class LCA:
    """Lowest Common Ancestor with binary lifting."""
    
    def __init__(self, n: int, adj: List[List[int]], root: int = 0):
        self.n = n
        self.LOG = max(1, int(log2(n)) + 1)
        self.parent = [[-1] * self.LOG for _ in range(n)]
        self.depth = [0] * n
        
        # Build tree using DFS
        visited = [False] * n
        stack = [(root, -1, 0)]
        
        while stack:
            u, p, d = stack.pop()
            if visited[u]:
                continue
            visited[u] = True
            self.parent[u][0] = p
            self.depth[u] = d
            
            for v in adj[u]:
                if not visited[v]:
                    stack.append((v, u, d + 1))
        
        # Build binary lifting table
        for j in range(1, self.LOG):
            for i in range(n):
                if self.parent[i][j-1] != -1:
                    self.parent[i][j] = self.parent[self.parent[i][j-1]][j-1]
    
    def query(self, u: int, v: int) -> int:
        """Find LCA of u and v."""
        if self.depth[u] < self.depth[v]:
            u, v = v, u
        
        diff = self.depth[u] - self.depth[v]
        for i in range(self.LOG):
            if (diff >> i) & 1:
                u = self.parent[u][i]
        
        if u == v:
            return u
        
        for i in range(self.LOG - 1, -1, -1):
            if self.parent[u][i] != self.parent[v][i]:
                u = self.parent[u][i]
                v = self.parent[v][i]
        
        return self.parent[u][0]


# ==================== Powers of 2 ====================

POW2 = [1 << i for i in range(64)]


if __name__ == "__main__":
    # Example usage
    fact = Factorials(1000)
    print(f"5! = {fact.fact[5]}")
    print(f"C(10, 3) = {fact.nCr(10, 3)}")
    
    primes, is_prime = sieve(100)
    print(f"Primes < 100: {primes}")
    
    spf = compute_spf(100)
    print(f"SPF[12] = {spf[12]}")
    print(f"Factors of 12: {factorize(12, spf)}")
    
    print(f"2^10 = {POW2[10]}")

