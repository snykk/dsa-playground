# Problem Solving Patterns

A comprehensive collection of **Problem Solving Patterns** for competitive programming and algorithm design.

---

## Overview

This folder contains implementations of common problem-solving patterns in Python, C++, and Go. Each pattern includes:
- Complete implementation
- Comprehensive test suites
- Detailed documentation
- Complexity analysis

---

## Patterns

### 🔹 Sliding Window
- Fixed and variable window techniques
- Efficient substring/subarray problems
- Time: O(n) for most problems

### 🔹 Two Pointers
- Opposite ends and same direction traversal
- Optimizes from O(n²) to O(n)
- Common in sorted array problems

### 🔹 Binary Search on Answer
- Search on answer space rather than array
- Monotonic condition required
- Time: O(log(n) * f(n))

### 🔹 Prefix Sum / Difference Array
- Efficient range queries and updates
- O(1) range operations after preprocessing
- Useful for cumulative problems

### 🔹 Union-Find Applications
- Disjoint Set Union (DSU)
- Cycle detection, component counting
- Time: O(α(n)) per operation (amortized)

### 🔹 Graph Traversal Problems
- DFS and BFS patterns
- Path finding, component counting
- Time: O(V + E)

### 🔹 DP Problem Patterns
- Common dynamic programming patterns
- Fibonacci, Coin Change, LCS
- Optimization problems

### 🔹 Meet in the Middle
- Split problem into two halves
- Combine results efficiently
- Reduces exponential complexity

### 🔹 Coordinate Compression
- Map large coordinates to smaller indices
- Reduces space complexity
- Useful for sparse data

### 🔹 Inclusion-Exclusion Principle
- Count union of sets
- Combinatorial counting
- Set theory applications

---

## Comparison

| Pattern | Time Complexity | Space Complexity | Best For |
|----------|----------------|------------------|----------|
| **Sliding Window** | O(n) | O(1) or O(k) | Substring/subarray problems |
| **Two Pointers** | O(n) | O(1) | Sorted arrays, palindromes |
| **Binary Search on Answer** | O(log(n) * f(n)) | O(1) | Optimization problems |
| **Prefix Sum** | O(n) preprocessing, O(1) query | O(n) | Range sum queries |
| **Union-Find** | O(α(n)) per op | O(n) | Disjoint sets, cycles |
| **Graph Traversal** | O(V + E) | O(V) | Graph problems |
| **DP Patterns** | Varies | Varies | Optimization, counting |
| **Meet in Middle** | O(2^(n/2)) | O(2^(n/2)) | Exponential problems |
| **Coordinate Compression** | O(n log n) | O(n) | Sparse coordinates |
| **Inclusion-Exclusion** | O(2^n) | O(2^n) | Set counting |

---

## When to Use

- **Sliding Window**: Contiguous subarrays/substrings with constraints
- **Two Pointers**: Sorted arrays, palindrome problems
- **Binary Search on Answer**: Optimization with monotonic condition
- **Prefix Sum**: Multiple range sum queries
- **Union-Find**: Disjoint sets, cycle detection
- **Graph Traversal**: Path finding, component analysis
- **DP Patterns**: Overlapping subproblems, optimal substructure
- **Meet in Middle**: Exponential problems that can be split
- **Coordinate Compression**: Large sparse coordinate spaces
- **Inclusion-Exclusion**: Counting union of sets

---

## Implementations

Each pattern is implemented in:
- **Python** (`PatternName/Python/`)
- **C++** (`PatternName/C++/`)
- **Go** (`PatternName/Go/`)

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena
- "Competitive Programming" by Halim & Halim
- "Cracking the Coding Interview" by Gayle Laakmann McDowell

---

_Last Updated: December 2025_

