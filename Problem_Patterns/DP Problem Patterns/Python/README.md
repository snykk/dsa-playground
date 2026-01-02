# DP Patterns in Python

Implementation of common Dynamic Programming patterns in Python3.

## Features

1.  **0/1 Knapsack**: Space-optimized O(W) implementation.
2.  **LCS**: Space-optimized O(min(N, M)) implementation.
3.  **LIS**: O(N log N) implementation using patience sorting / binary search.

## Usage

```python
from dp_patterns import knapsack_01, lcs, lis

# Knapsack
val = knapsack_01([10, 20], [60, 100], 30) # 160

# LCS
length = lcs("abc", "ac") # 2

# LIS
length = lis([10, 9, 2, 5, 3]) # 3
```

## Testing

Run the written unit tests:

```bash
python dp_patterns_test.py
```
