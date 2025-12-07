# Searching Algorithms

This folder contains implementations of **Searching Algorithms** - algorithms used to find elements in data structures.

---

## Overview

Searching algorithms are fundamental operations in computer science, used to locate specific elements within a collection of data. The choice of algorithm depends on the data structure and whether the data is sorted.

---

## Algorithms

### 1. Linear Search
- **Time Complexity**: O(n)
- **Space Complexity**: O(1)
- **Requirement**: Works on any data structure
- **Best for**: Unsorted arrays, small datasets

### 2. Binary Search
- **Time Complexity**: O(log n)
- **Space Complexity**: O(1) iterative, O(log n) recursive
- **Requirement**: Sorted array
- **Best for**: Sorted arrays, large datasets

### 3. Ternary Search
- **Time Complexity**: O(log₃ n)
- **Space Complexity**: O(1) iterative, O(log₃ n) recursive
- **Requirement**: Sorted array, unimodal function
- **Best for**: Finding maximum/minimum in unimodal functions

### 4. Interpolation Search
- **Time Complexity**: O(log log n) average, O(n) worst case
- **Space Complexity**: O(1)
- **Requirement**: Sorted array, uniformly distributed data
- **Best for**: Uniformly distributed sorted arrays

---

## Comparison

| Algorithm | Best Case | Average Case | Worst Case | Space | Requirement |
|-----------|-----------|--------------|------------|-------|-------------|
| **Linear Search** | O(1) | O(n) | O(n) | O(1) | None |
| **Binary Search** | O(1) | O(log n) | O(log n) | O(1) | Sorted |
| **Ternary Search** | O(1) | O(log₃ n) | O(log₃ n) | O(1) | Sorted, Unimodal |
| **Interpolation Search** | O(1) | O(log log n) | O(n) | O(1) | Sorted, Uniform |

---

## When to Use

### Linear Search
- ✅ Unsorted data
- ✅ Small datasets
- ✅ Simple implementation needed
- ❌ Large sorted datasets

### Binary Search
- ✅ Sorted arrays
- ✅ Large datasets
- ✅ Need guaranteed O(log n)
- ❌ Unsorted data

### Ternary Search
- ✅ Unimodal functions (finding peak/valley)
- ✅ Sorted arrays with specific patterns
- ❌ General searching (slower than binary)

### Interpolation Search
- ✅ Uniformly distributed sorted data
- ✅ Very large datasets
- ❌ Non-uniform distribution (can degrade to O(n))

---

## Implementations

Each algorithm is implemented in three languages:
- **Python** (`[algorithm]/Python/`)
- **C++** (`[algorithm]/C++/`)
- **Go** (`[algorithm]/Go/`)

All implementations include:
- Source code with multiple variants (iterative, recursive)
- Comprehensive test suites
- Detailed README documentation
- Usage examples

---

## Learning Path

1. **Start with Linear Search**: Understand basic searching concept
2. **Learn Binary Search**: Most important searching algorithm
3. **Explore Ternary Search**: Understand divide-and-conquer with three parts
4. **Study Interpolation Search**: Learn adaptive searching techniques

---

## Related Topics

- **Sorting Algorithms**: Often needed before searching
- **Binary Search Tree**: Data structure optimized for searching
- **Hash Tables**: O(1) average case searching
- **Divide and Conquer**: Pattern used in binary/ternary search



