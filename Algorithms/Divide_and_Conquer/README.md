# Divide and Conquer Algorithms

This folder contains implementations of **Divide and Conquer Algorithms** - algorithms that solve problems by breaking them into smaller subproblems, solving them recursively, and combining the results.

---

## Overview

Divide and Conquer is a fundamental algorithmic paradigm that works by:
1. **Divide**: Break the problem into smaller subproblems
2. **Conquer**: Solve the subproblems recursively
3. **Combine**: Merge the solutions to form the final answer

---

## Algorithms

### 1. Merge Sort
- **Time Complexity**: O(n log n)
- **Space Complexity**: O(n)
- **Location**: [Algorithms/Sorting/Merge_Sort](../Sorting/Merge_Sort/)
- **Description**: Divides array into halves, sorts recursively, then merges

### 2. Quick Sort
- **Time Complexity**: O(n log n) average, O(n²) worst
- **Space Complexity**: O(log n)
- **Location**: [Algorithms/Sorting/Quick_Sort](../Sorting/Quick_Sort/)
- **Description**: Partitions array around pivot, sorts recursively

### 3. Binary Search
- **Time Complexity**: O(log n)
- **Space Complexity**: O(1) iterative, O(log n) recursive
- **Location**: [Algorithms/Searching/Binary_Search](../Searching/Binary_Search/)
- **Description**: Divides search space in half repeatedly

### 4. Strassen's Matrix Multiplication
- **Time Complexity**: O(n^log₂ 7) ≈ O(n^2.81)
- **Space Complexity**: O(n²)
- **Description**: Faster matrix multiplication using divide and conquer

### 5. Closest Pair of Points
- **Time Complexity**: O(n log² n) or O(n log n) with optimization
- **Space Complexity**: O(n log n)
- **Description**: Finds the closest pair of points in 2D plane

---

## Comparison

| Algorithm | Time Complexity | Space Complexity | Application |
|-----------|----------------|------------------|-------------|
| **Merge Sort** | O(n log n) | O(n) | Sorting |
| **Quick Sort** | O(n log n) avg | O(log n) | Sorting |
| **Binary Search** | O(log n) | O(1) | Searching |
| **Strassen's** | O(n^2.81) | O(n²) | Matrix multiplication |
| **Closest Pair** | O(n log² n) | O(n log n) | Computational geometry |

---

## Divide and Conquer Pattern

### General Structure

```python
def divide_and_conquer(problem):
    # Base case
    if problem is small enough:
        return solve_directly(problem)
    
    # Divide
    subproblems = divide(problem)
    
    # Conquer
    solutions = [divide_and_conquer(sub) for sub in subproblems]
    
    # Combine
    return combine(solutions)
```

### When to Use

- ✅ Problem can be divided into similar subproblems
- ✅ Subproblems are independent
- ✅ Combining solutions is efficient
- ✅ Recursive structure is natural

---

## Master Theorem

For recurrence relations of the form:
```
T(n) = aT(n/b) + f(n)
```

Where:
- `a` = number of subproblems
- `b` = size reduction factor
- `f(n)` = cost of dividing and combining

### Cases

1. **f(n) = O(n^c)** where c < log_b(a): T(n) = Θ(n^log_b(a))
2. **f(n) = Θ(n^log_b(a))**: T(n) = Θ(n^log_b(a) log n)
3. **f(n) = Ω(n^c)** where c > log_b(a): T(n) = Θ(f(n))

---

## Examples

### Merge Sort
- a = 2, b = 2, f(n) = O(n)
- T(n) = 2T(n/2) + O(n)
- Case 2: T(n) = O(n log n)

### Binary Search
- a = 1, b = 2, f(n) = O(1)
- T(n) = T(n/2) + O(1)
- Case 2: T(n) = O(log n)

### Strassen's
- a = 7, b = 2, f(n) = O(n²)
- T(n) = 7T(n/2) + O(n²)
- Case 1: T(n) = O(n^log₂ 7) ≈ O(n^2.81)

---

## Implementations

Each algorithm is implemented in three languages:
- **Python** (`[algorithm]/Python/`)
- **C++** (`[algorithm]/C++/`)
- **Go** (`[algorithm]/Go/`)

All implementations include:
- Complete source code
- Comprehensive test suites
- Detailed README documentation
- Usage examples

---

## Learning Path

1. **Start with Merge Sort**: Understand basic divide and conquer
2. **Learn Quick Sort**: See different partitioning strategy
3. **Study Binary Search**: Simple divide and conquer search
4. **Explore Strassen's**: Advanced matrix operations
5. **Master Closest Pair**: Complex geometric algorithm

---

## Related Topics

- **Recursion**: Foundation of divide and conquer
- **Dynamic Programming**: Similar but with overlapping subproblems
- **Greedy Algorithms**: Alternative problem-solving paradigm
- **Backtracking**: Another recursive approach

---

_Last Updated: December 2025_

