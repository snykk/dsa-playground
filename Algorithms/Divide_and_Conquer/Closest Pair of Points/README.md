# Closest Pair of Points

**Closest Pair of Points** is a divide and conquer algorithm that finds the closest pair of points in a 2D plane.

---

## Overview

Given n points in a 2D plane, find the pair of points with the smallest Euclidean distance. The divide and conquer approach achieves O(n log n) time complexity.

---

## Algorithm

1. **Divide**: Sort by x-coordinate, split into left/right halves
2. **Conquer**: Recursively find closest in each half
3. **Combine**: Check strip near dividing line

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Optimized** | O(n log n) | O(n) |
| **Basic** | O(n log² n) | O(n log n) |

---

## Key Insight

For points in the strip (within δ of dividing line), each point needs to check at most 6 other points due to geometric properties.

---

## Implementations

- **Python** (`Python/`) - Complete implementation
- **C++** (`C++/`) - Basic structure
- **Go** (`Go/`) - Basic structure

---

## When to Use

- ✅ Finding closest points in 2D
- ✅ Computational geometry
- ✅ Large point sets

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 33)

---

_Last Updated: December 2025_

