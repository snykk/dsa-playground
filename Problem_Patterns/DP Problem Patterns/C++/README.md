# DP Patterns in C++

Implementation of 0/1 Knapsack, LCS, and LIS in C++.

## Usage

```cpp
#include "dp_patterns.cpp"

// Knapsack
int val = DPPatterns::knapsack01({10, 20}, {60, 100}, 30);

// LCS
int len = DPPatterns::lcs("abc", "ac");

// LIS
int lis = DPPatterns::lis({10, 9, 2});
```

## Compilation and Testing

Compile the test file:

```bash
g++ dp_patterns_test.cpp -o test
./test
```
