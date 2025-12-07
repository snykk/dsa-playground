# Ternary Search

**Ternary Search** is a divide-and-conquer algorithm that finds the position of a target value in a sorted array by dividing the search space into three parts instead of two (like Binary Search).

---

## Overview

Ternary Search divides the search space into three equal parts and compares the target with values at two partition points. While it has the same asymptotic complexity as Binary Search, it typically performs more comparisons per iteration.

---

## Algorithm

1. Divide search space into three parts
2. Compare target with values at two partition points (mid1 and mid2)
3. If match found, return index
4. If target is in left third, search left
5. If target is in right third, search right
6. If target is in middle third, search middle
7. Repeat until found or search space is exhausted

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(1) | O(1) |
| **Average Case** | O(log₃ n) | O(1) |
| **Worst Case** | O(log₃ n) | O(1) |

**Note**: 
- O(log₃ n) = O(log n / log 3) ≈ O(0.63 log n)
- Ternary Search typically performs more comparisons than Binary Search

---

## Ternary Search vs Binary Search

| Aspect | Ternary Search | Binary Search |
|--------|----------------|---------------|
| **Comparisons per iteration** | 2 | 1 |
| **Time Complexity** | O(log₃ n) | O(log₂ n) |
| **Practical Performance** | Slower | Faster |
| **Use Case** | Unimodal functions | General searching |

---

## Advantages

1. ✅ **Useful for unimodal functions**: Can find maximum/minimum efficiently
2. ✅ **Divide-and-conquer**: Reduces search space by 2/3 each iteration

---

## Disadvantages

1. ❌ **More comparisons**: 2 comparisons vs 1 in Binary Search
2. ❌ **Slower in practice**: Despite same complexity class

---

## When to Use

- ✅ Finding maximum/minimum of unimodal functions
- ✅ Optimization problems with unimodal constraints
- ❌ General array searching (use Binary Search instead)

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - Standard, recursive, and unimodal function variants
- **C++** (`C++/`) - Template-based implementation
- **Go** (`Go/`) - Implementation with Go 1.21+

---

## Related Algorithms

- **Binary Search**: O(log₂ n) for sorted arrays
- **Linear Search**: O(n) for unsorted arrays
- **Interpolation Search**: O(log log n) for uniformly distributed data

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

