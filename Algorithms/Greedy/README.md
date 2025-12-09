# Greedy Algorithms

This folder contains implementations of **Greedy Algorithms** - algorithms that make locally optimal choices at each step with the hope of finding a global optimum.

---

## Overview

Greedy algorithms build solutions step by step, always choosing the option that looks best at the moment. They don't reconsider previous choices, which makes them efficient but doesn't always guarantee optimal solutions.

---

## Key Characteristics

1. **Greedy Choice Property**: A global optimum can be reached by making locally optimal choices
2. **Optimal Substructure**: Optimal solution contains optimal solutions to subproblems
3. **No Backtracking**: Once a choice is made, it's never reconsidered

---

## Algorithms

### 1. Activity Selection
- **Time Complexity**: O(n log n)
- **Space Complexity**: O(1)
- **Description**: Select maximum number of non-overlapping activities

### 2. Huffman Coding
- **Time Complexity**: O(n log n)
- **Space Complexity**: O(n)
- **Description**: Optimal prefix-free encoding for data compression

### 3. Fractional Knapsack
- **Time Complexity**: O(n log n)
- **Space Complexity**: O(1)
- **Description**: Maximize value with fractional items allowed

### 4. Job Scheduling
- **Time Complexity**: O(n log n)
- **Space Complexity**: O(n)
- **Description**: Schedule jobs to maximize profit or minimize completion time

### 5. Minimum Spanning Tree (MST)
- **Kruskal's Algorithm**: O(E log E) or O(E log V)
- **Prim's Algorithm**: O(E log V) with binary heap
- **Description**: Find minimum weight spanning tree

---

## Comparison

| Algorithm | Time Complexity | Space Complexity | Application |
|-----------|----------------|------------------|-------------|
| **Activity Selection** | O(n log n) | O(1) | Scheduling |
| **Huffman Coding** | O(n log n) | O(n) | Compression |
| **Fractional Knapsack** | O(n log n) | O(1) | Optimization |
| **Job Scheduling** | O(n log n) | O(n) | Scheduling |
| **Kruskal's MST** | O(E log E) | O(V) | Graph |
| **Prim's MST** | O(E log V) | O(V) | Graph |

---

## When to Use Greedy

- ✅ Problem has greedy choice property
- ✅ Optimal substructure exists
- ✅ Need efficient solution
- ❌ When global optimum is critical and greedy doesn't guarantee it
- ❌ When choices affect future options significantly

---

## Greedy vs Dynamic Programming

| Aspect | Greedy | Dynamic Programming |
|--------|--------|---------------------|
| **Choices** | Make best choice now | Consider all choices |
| **Subproblems** | One subproblem | Multiple overlapping subproblems |
| **Optimality** | May not be optimal | Always optimal |
| **Efficiency** | Usually faster | Usually slower |

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

1. **Start with Activity Selection**: Simple greedy problem
2. **Learn Fractional Knapsack**: Understand value/weight ratio
3. **Study Huffman Coding**: Tree-based greedy algorithm
4. **Explore MST Algorithms**: Graph-based greedy problems
5. **Master Job Scheduling**: Complex greedy optimization

---

## Related Topics

- **Dynamic Programming**: Alternative approach when greedy fails
- **Graph Algorithms**: Many greedy algorithms work on graphs
- **Sorting**: Often needed as preprocessing for greedy algorithms

---

_Last Updated: December 2025_

