"""
Python Competitive Programming Boilerplate

This template provides a complete starting point for competitive programming
with commonly used imports, utility functions, and data structures.
"""

import sys
import math
import heapq
from collections import defaultdict, deque, Counter
from functools import lru_cache, reduce
from itertools import permutations, combinations, accumulate
from bisect import bisect_left, bisect_right
from typing import List, Tuple, Dict, Set, Optional

# Fast I/O
input = sys.stdin.readline
print = sys.stdout.write

def inp():
    """Read single integer."""
    return int(sys.stdin.readline())

def inlt():
    """Read list of integers."""
    return list(map(int, sys.stdin.readline().split()))

def insr():
    """Read string."""
    return sys.stdin.readline().strip()

def invr():
    """Read space-separated integers as list."""
    return map(int, sys.stdin.readline().split())

def out(x):
    """Print with newline."""
    sys.stdout.write(str(x) + "\n")

def outl(lst):
    """Print list with spaces."""
    sys.stdout.write(" ".join(map(str, lst)) + "\n")

# Constants
MOD = 10**9 + 7
MOD2 = 998244353
INF = float('inf')
IINF = 10**18

# Math Utilities
def gcd(a: int, b: int) -> int:
    """Greatest Common Divisor."""
    while b:
        a, b = b, a % b
    return a

def lcm(a: int, b: int) -> int:
    """Least Common Multiple."""
    return a // gcd(a, b) * b

def power(base: int, exp: int, mod: int = MOD) -> int:
    """Fast modular exponentiation."""
    result = 1
    base %= mod
    while exp > 0:
        if exp & 1:
            result = result * base % mod
        base = base * base % mod
        exp >>= 1
    return result

def mod_inverse(a: int, mod: int = MOD) -> int:
    """Modular multiplicative inverse using Fermat's little theorem."""
    return power(a, mod - 2, mod)

def is_prime(n: int) -> bool:
    """Check if n is prime."""
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    for i in range(3, int(n**0.5) + 1, 2):
        if n % i == 0:
            return False
    return True

def sieve(n: int) -> List[int]:
    """Sieve of Eratosthenes."""
    is_prime_arr = [True] * (n + 1)
    is_prime_arr[0] = is_prime_arr[1] = False
    for i in range(2, int(n**0.5) + 1):
        if is_prime_arr[i]:
            for j in range(i*i, n + 1, i):
                is_prime_arr[j] = False
    return [i for i in range(n + 1) if is_prime_arr[i]]

# Combinatorics
class Combinatorics:
    """Precomputed factorials for fast nCr and nPr."""
    
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

# Graph Utilities
def build_graph(n: int, edges: List[Tuple[int, int]], directed: bool = False) -> Dict[int, List[int]]:
    """Build adjacency list from edge list."""
    graph = defaultdict(list)
    for u, v in edges:
        graph[u].append(v)
        if not directed:
            graph[v].append(u)
    return graph

def bfs(graph: Dict[int, List[int]], start: int) -> Dict[int, int]:
    """BFS returning distances from start."""
    dist = {start: 0}
    queue = deque([start])
    while queue:
        u = queue.popleft()
        for v in graph[u]:
            if v not in dist:
                dist[v] = dist[u] + 1
                queue.append(v)
    return dist

def dfs(graph: Dict[int, List[int]], start: int) -> Set[int]:
    """DFS returning visited nodes."""
    visited = set()
    stack = [start]
    while stack:
        u = stack.pop()
        if u not in visited:
            visited.add(u)
            for v in graph[u]:
                if v not in visited:
                    stack.append(v)
    return visited

# Union Find (DSU)
class DSU:
    """Disjoint Set Union with path compression and union by rank."""
    
    def __init__(self, n: int):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.size = [1] * n
    
    def find(self, x: int) -> int:
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
    
    def unite(self, x: int, y: int) -> bool:
        px, py = self.find(x), self.find(y)
        if px == py:
            return False
        if self.rank[px] < self.rank[py]:
            px, py = py, px
        self.parent[py] = px
        self.size[px] += self.size[py]
        if self.rank[px] == self.rank[py]:
            self.rank[px] += 1
        return True
    
    def connected(self, x: int, y: int) -> bool:
        return self.find(x) == self.find(y)
    
    def get_size(self, x: int) -> int:
        return self.size[self.find(x)]

# Segment Tree
class SegTree:
    """Segment Tree for range sum queries with point updates."""
    
    def __init__(self, n: int):
        self.n = n
        self.tree = [0] * (4 * n)
    
    def update(self, node: int, start: int, end: int, idx: int, val: int):
        if start == end:
            self.tree[node] = val
        else:
            mid = (start + end) // 2
            if idx <= mid:
                self.update(2*node, start, mid, idx, val)
            else:
                self.update(2*node+1, mid+1, end, idx, val)
            self.tree[node] = self.tree[2*node] + self.tree[2*node+1]
    
    def query(self, node: int, start: int, end: int, l: int, r: int) -> int:
        if r < start or end < l:
            return 0
        if l <= start and end <= r:
            return self.tree[node]
        mid = (start + end) // 2
        return self.query(2*node, start, mid, l, r) + self.query(2*node+1, mid+1, end, l, r)
    
    def point_update(self, idx: int, val: int):
        self.update(1, 0, self.n-1, idx, val)
    
    def range_query(self, l: int, r: int) -> int:
        return self.query(1, 0, self.n-1, l, r)

# Binary Search
def binary_search(arr: List[int], target: int) -> int:
    """Binary search returning index of target, or -1 if not found."""
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

def lower_bound(arr: List[int], target: int) -> int:
    """Find first index where arr[i] >= target."""
    return bisect_left(arr, target)

def upper_bound(arr: List[int], target: int) -> int:
    """Find first index where arr[i] > target."""
    return bisect_right(arr, target)

# Main Solution
def solve():
    """Main solution function."""
    n = inp()
    a = inlt()
    
    # Process and output
    ans = sum(a)
    out(ans)

def main():
    """Main function with optional multiple test cases."""
    t = 1
    # t = inp()  # Uncomment for multiple test cases
    
    for _ in range(t):
        solve()

if __name__ == "__main__":
    main()

