# Dynamic Programming Algorithms

This folder contains implementations of **Dynamic Programming (DP)** algorithms - optimization technique that solves problems by breaking them into overlapping subproblems and storing results.

---

## Overview

Dynamic Programming is a powerful technique for solving optimization problems by:
1. **Breaking down** problems into overlapping subproblems
2. **Storing** results of subproblems (memoization/tabulation)
3. **Reusing** stored results to avoid recomputation
4. **Building up** solution from smaller subproblems

---

## Key Characteristics

1. **Overlapping Subproblems**: Same subproblems appear multiple times
2. **Optimal Substructure**: Optimal solution contains optimal solutions to subproblems
3. **Memoization/Tabulation**: Store results to avoid recomputation

---

## DP vs Greedy vs Divide and Conquer

| Aspect | Dynamic Programming | Greedy | Divide and Conquer |
|--------|---------------------|--------|-------------------|
| **Subproblems** | Overlapping | Independent | Independent |
| **Storage** | Store results | No storage | No storage |
| **Optimality** | Always optimal | May not be optimal | Always optimal |
| **Examples** | Fibonacci, LCS | Activity Selection | Merge Sort |

---

## Categories

### 1. Basic DP
- **Fibonacci Numbers**: Classic DP example
- **Climbing Stairs**: Simple DP problem

### 2. Linear DP (1D)
- **Longest Increasing Subsequence (LIS)**: O(n²) or O(n log n)
- **Maximum Subarray (Kadane's)**: O(n)
- **Coin Change**: Unbounded/0-1 variants

### 3. 2D DP
- **Longest Common Subsequence (LCS)**: O(mn)
- **0/1 Knapsack**: O(nW)
- **Edit Distance**: O(mn)
- **Matrix Chain Multiplication**: O(n³)

### 4. Advanced DP
- **DP on Trees**: Tree DP problems
- **DP on Graphs**: Graph DP problems
- **Bitmask DP**: State compression with bits
- **Digit DP**: Number theory DP

---

## Implementation Approaches

### 1. Memoization (Top-Down)
```python
def dp_function(n, memo={}):
    if n in memo:
        return memo[n]
    # Compute and store
    memo[n] = result
    return result
```

### 2. Tabulation (Bottom-Up)
```python
def dp_function(n):
    dp = [0] * (n + 1)
    dp[0] = base_case
    for i in range(1, n + 1):
        dp[i] = compute_from_previous(dp)
    return dp[n]
```

---

## Complexity Analysis

| Category | Typical Time | Typical Space |
|----------|--------------|---------------|
| **Basic DP** | O(n) | O(n) or O(1) |
| **Linear DP** | O(n) to O(n²) | O(n) |
| **2D DP** | O(mn) to O(n³) | O(mn) |
| **Advanced DP** | Varies | Varies |

---

## When to Use DP

- ✅ Overlapping subproblems
- ✅ Optimal substructure
- ✅ Need optimal solution
- ✅ Can break into smaller problems
- ❌ When greedy works (simpler)
- ❌ When subproblems don't overlap

---

## Implementations

Each algorithm is implemented in three languages:
- **Python** (`[algorithm]/Python/`)
- **C++** (`[algorithm]/C++/`)
- **Go** (`[algorithm]/Go/`)

All implementations include:
- Memoization and tabulation approaches
- Comprehensive test suites
- Detailed README documentation
- Complexity analysis

---

## Learning Path

1. **Start with Basic DP**: Fibonacci, Climbing Stairs
2. **Learn Linear DP**: LIS, Kadane's, Coin Change
3. **Master 2D DP**: LCS, Knapsack, Edit Distance
4. **Explore Advanced DP**: Tree DP, Bitmask DP

---

## Related Topics

- **Greedy Algorithms**: Alternative when DP is overkill
- **Recursion**: Foundation of memoization
- **Graph Algorithms**: Many DP problems on graphs

---

_Last Updated: December 2025_

