# Bitmask DP (C++)

C++ scaffold for Bitmask Dynamic Programming, a technique that uses bitmasks to represent subsets of elements as DP states. The full implementation is in the Python directory.

## Files

| File | Description |
|------|-------------|
| `bitmask_dp.cpp` | Placeholder structure (see Python for full implementation) |
| `bitmask_dp_test.cpp` | Basic structure test |

## How to Run

```bash
g++ -std=c++17 -DTESTING -o test bitmask_dp_test.cpp
./test
```

## Key Concepts

| Concept | Description | Typical Complexity |
|---------|-------------|-------------------|
| Traveling Salesman (TSP) | Visit all cities with minimum cost using bitmask to track visited set | O(n^2 * 2^n) |
| Subset enumeration | Iterate over all subsets of n elements via bitmask | O(2^n) |
| State: `dp[mask][i]` | Minimum cost to reach city `i` having visited the cities in `mask` | -- |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(n^2 * 2^n) for TSP-style problems |
| Space | O(n * 2^n) for the DP table |

## Notes

- Bitmask DP is used when the state space involves subsets of a small set (typically n <= 20).
- Each bit in the mask represents whether an element is included in the current subset.
- The Python implementation contains a complete Traveling Salesman Problem solver.
- See `../Python/bitmask_dp.py` for the full working implementation.

---

_Last Updated: April 2026_
