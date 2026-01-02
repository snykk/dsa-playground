# DP Problem Patterns

**Dynamic Programming (DP)** is a method for solving complex problems by breaking them down into simpler subproblems. It stores the results of subproblems to avoid recomputing them, significantly improving efficiency for problems with overlapping subproblems.

---

## Overview

Dynamic Programming is applicable when a problem has:
- **Overlapping Subproblems**: Same subproblems are solved multiple times
- **Optimal Substructure**: Optimal solution contains optimal solutions to subproblems

This folder contains implementations of common DP patterns that appear frequently in competitive programming and interviews:
- **Fibonacci Numbers**: Classic DP introduction
- **Coin Change**: Unbounded knapsack variant
- **Longest Common Subsequence (LCS)**: String DP pattern

These patterns form the foundation for more complex DP problems.

---

## Key Characteristics

1. **Memoization**: Store results of subproblems
2. **Tabulation**: Build solution bottom-up
3. **State Definition**: Clearly define what dp[i] represents
4. **Transition**: Define how to compute current state from previous states

---

## Operations

| Pattern | Description | Time Complexity | Space Complexity |
|---------|-------------|----------------|------------------|
| `fibonacci(n)` | Compute n-th Fibonacci number | O(n) | O(n) or O(1) |
| `coin_change(coins, amount)` | Minimum coins to make amount | O(n × m) | O(m) |
| `longest_common_subsequence(s1, s2)` | Length of LCS | O(m × n) | O(m × n) or O(min(m,n)) |

Where n, m are input sizes.

---

## Implementation Approaches

### 1. Top-Down (Memoization)
- **Pros**: Intuitive, follows recursive thinking
- **Cons**: Function call overhead, stack space
- **Use Case**: When recursion is natural

### 2. Bottom-Up (Tabulation)
- **Pros**: No recursion overhead, space optimizable
- **Cons**: Less intuitive, need to determine order
- **Use Case**: Most competitive programming problems

### 3. Space-Optimized
- **Pros**: Reduces space complexity
- **Cons**: May lose ability to reconstruct solution
- **Use Case**: When only need optimal value, not solution

---

## Applications

1. **Fibonacci Numbers**: Classic DP introduction problem
2. **Coin Change**: Unbounded knapsack, making change
3. **Longest Common Subsequence**: String similarity, diff algorithms
4. **Longest Increasing Subsequence**: Sequence problems
5. **Edit Distance**: String transformation problems
6. **0/1 Knapsack**: Resource allocation problems

---

## Example Use Cases

### Fibonacci
```python
result = fibonacci(10)  # Returns 55
```

### Coin Change
```python
coins = [1, 3, 4]
amount = 6
result = coin_change(coins, amount)  # Returns 2 (3+3)
```

### Longest Common Subsequence
```python
s1 = "ABCDGH"
s2 = "AEDFHR"
result = longest_common_subsequence(s1, s2)  # Returns 3 (ADH)
```

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - List-based implementation
- **C++** (`C++/`) - Vector-based implementation
- **Go** (`Go/`) - Slice-based implementation

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Complexity Summary

| Pattern | Time | Space | Optimized Space |
|---------|------|-------|----------------|
| **Fibonacci** | O(n) | O(n) | O(1) |
| **Coin Change** | O(n × m) | O(m) | O(m) |
| **LCS** | O(m × n) | O(m × n) | O(min(m,n)) |

---

## When to Use

- **Overlapping Subproblems**: When same subproblems appear multiple times
- **Optimal Substructure**: When optimal solution uses optimal subproblems
- **Optimization Problems**: Finding minimum/maximum values
- **Counting Problems**: Counting ways to achieve something
- **Sequence Problems**: Problems involving sequences or strings

---

## Related Patterns

- **Greedy Algorithms**: Sometimes alternative to DP
- **Divide and Conquer**: Similar but no overlapping subproblems
- **Backtracking**: Can be optimized with DP (memoization)

---

## Further Reading

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena
- "Competitive Programming" by Halim & Halim
- LeetCode DP problems

---

**Note**: DP requires practice to identify subproblems and state transitions. Start with simple patterns like Fibonacci and gradually move to more complex problems. Always verify overlapping subproblems and optimal substructure properties.

---

_Last Updated: December 2025_
