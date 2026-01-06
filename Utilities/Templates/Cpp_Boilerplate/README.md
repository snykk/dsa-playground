# C++ Competitive Programming Boilerplate

A comprehensive C++ template for competitive programming that includes commonly used macros, data types, utility functions, and data structures.

## Features

### Type Definitions
- `ll`, `ull`, `ld` - Long long, unsigned long long, long double
- `pii`, `pll` - Pair of integers and long longs
- `vi`, `vll` - Vector of integers and long longs
- `vvi`, `vvll` - 2D vectors

### Macros
- `pb`, `mp`, `fi`, `se` - push_back, make_pair, first, second
- `all(x)`, `rall(x)` - Begin/end and reverse iterators
- `sz(x)` - Size as integer
- `rep(i, a, b)`, `per(i, a, b)` - Forward and reverse loops
- `each(x, a)` - Range-based for loop

### Constants
- `MOD` - 10^9 + 7
- `MOD2` - 998244353
- `INF` - 10^18
- `PI`, `EPS` - Mathematical constants

### Utility Functions
- `gcd(a, b)`, `lcm(a, b)` - GCD and LCM
- `power(base, exp, mod)` - Modular exponentiation
- `modInverse(a, mod)` - Modular multiplicative inverse
- `nCr(n, r)`, `nPr(n, r)` - Combinatorics

### Data Structures
- **DSU (Disjoint Set Union)** - Union-Find with path compression
- **Segment Tree** - Range sum queries with point updates

## Usage

```cpp
#include <bits/stdc++.h>
using namespace std;

// Copy the boilerplate here or include it

void solve() {
    int n;
    cin >> n;
    // Your solution
}

int main() {
    fastIO();
    int t = 1;
    // cin >> t;
    while (t--) solve();
    return 0;
}
```

## Complexity

| Function | Time | Space |
|----------|------|-------|
| gcd | O(log(min(a,b))) | O(1) |
| power | O(log n) | O(1) |
| modInverse | O(log MOD) | O(1) |
| nCr | O(1)* | O(n)* |
| DSU.find | O(α(n)) | O(n) |
| DSU.unite | O(α(n)) | O(n) |
| SegTree.update | O(log n) | O(n) |
| SegTree.query | O(log n) | O(n) |

*After O(n) precomputation

## Best Practices

1. **Always use fastIO()** at the start of main
2. **Use appropriate types** - ll for large numbers
3. **Watch for overflow** - use 1LL for multiplication
4. **Debug locally** - use LOCAL flag for debug output
5. **Precompute factorials** if using combinatorics

