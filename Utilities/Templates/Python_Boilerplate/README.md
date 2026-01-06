# Python Competitive Programming Boilerplate

A comprehensive Python template for competitive programming that includes commonly used imports, utility functions, and data structures.

## Features

### Fast I/O
- `inp()` - Read single integer
- `inlt()` - Read list of integers
- `insr()` - Read string
- `invr()` - Read space-separated integers as iterator
- `out(x)` - Print with newline
- `outl(lst)` - Print list with spaces

### Constants
- `MOD` - 10^9 + 7
- `MOD2` - 998244353
- `INF` - float('inf')
- `IINF` - 10^18

### Math Utilities
- `gcd(a, b)`, `lcm(a, b)` - GCD and LCM
- `power(base, exp, mod)` - Modular exponentiation
- `mod_inverse(a, mod)` - Modular multiplicative inverse
- `is_prime(n)` - Primality test
- `sieve(n)` - Sieve of Eratosthenes

### Data Structures
- **Combinatorics** - Precomputed factorials for nCr/nPr
- **DSU (Disjoint Set Union)** - Union-Find with path compression
- **SegTree** - Segment Tree for range queries

### Graph Utilities
- `build_graph(n, edges, directed)` - Build adjacency list
- `bfs(graph, start)` - BFS returning distances
- `dfs(graph, start)` - DFS returning visited set

## Usage

```python
import sys
from python_boilerplate import *

def solve():
    n = inp()
    a = inlt()
    
    # Your solution here
    ans = sum(a)
    out(ans)

def main():
    t = 1
    # t = inp()
    for _ in range(t):
        solve()

if __name__ == "__main__":
    main()
```

## Complexity

| Function | Time | Space |
|----------|------|-------|
| gcd | O(log(min(a,b))) | O(1) |
| power | O(log n) | O(1) |
| mod_inverse | O(log MOD) | O(1) |
| is_prime | O(√n) | O(1) |
| sieve | O(n log log n) | O(n) |
| DSU.find | O(α(n)) | O(n) |
| DSU.unite | O(α(n)) | O(n) |
| SegTree.update | O(log n) | O(n) |
| SegTree.query | O(log n) | O(n) |

## Best Practices

1. **Use sys.stdin.readline** for fast input
2. **Use sys.stdout.write** for fast output
3. **Import only what you need** in actual contests
4. **Use @lru_cache** for memoization in recursion
5. **Set recursion limit** with `sys.setrecursionlimit(10**6)`

