# Bitmasking Techniques

Bitmasking is a powerful technique for representing sets as integers and performing set operations efficiently.

## Basic Operations

| Operation | Code | Description |
|-----------|------|-------------|
| Get bit i | `(mask >> i) & 1` | Check if bit i is set |
| Set bit i | `mask \| (1 << i)` | Set bit i to 1 |
| Clear bit i | `mask & ~(1 << i)` | Set bit i to 0 |
| Toggle bit i | `mask ^ (1 << i)` | Flip bit i |
| Count bits | `__builtin_popcount(mask)` | Number of set bits |
| Lowest bit | `mask & (-mask)` | Get lowest set bit |
| Clear lowest | `mask & (mask - 1)` | Clear lowest set bit |

## Subset Enumeration

```cpp
// All subsets of a set
for (int sub = mask; sub > 0; sub = (sub - 1) & mask) {
    // process sub
}

// Gosper's hack: subsets of size k
int mask = (1 << k) - 1;
while (mask < (1 << n)) {
    // process mask
    int c = mask & -mask;
    int r = mask + c;
    mask = (((r ^ mask) >> 2) / c) | r;
}
```

## Bitmask DP

### Traveling Salesman Problem

```cpp
// dp[mask][last] = min cost to visit all cities in mask, ending at last
dp[1][0] = 0;  // Start at city 0

for (int mask = 1; mask < (1 << n); mask++) {
    for (int last = 0; last < n; last++) {
        for (int next = 0; next < n; next++) {
            if (!(mask & (1 << next))) {
                int newMask = mask | (1 << next);
                dp[newMask][next] = min(dp[newMask][next],
                                        dp[mask][last] + dist[last][next]);
            }
        }
    }
}
```

## Useful Tricks

```cpp
// Check power of 2
bool isPow2 = n > 0 && (n & (n-1)) == 0;

// Next power of 2
int nextPow2(int n) {
    n--; n |= n >> 1; n |= n >> 2;
    n |= n >> 4; n |= n >> 8; n |= n >> 16;
    return n + 1;
}

// XOR swap
a ^= b; b ^= a; a ^= b;
```

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Basic bit ops | O(1) | O(1) |
| Enumerate subsets | O(2^k) | O(1) |
| Bitmask DP (TSP) | O(n² × 2^n) | O(n × 2^n) |
| SOS DP | O(n × 2^n) | O(2^n) |

## Applications

- **Set representation**: Each bit represents element presence
- **Dynamic Programming**: States with subset constraints
- **Graph algorithms**: Hamiltonian path, TSP
- **Game theory**: Nim, Sprague-Grundy
- **Optimization**: Subset sum variants

