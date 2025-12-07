# Quick Sort (Divide and Conquer)

**Quick Sort** is a divide and conquer algorithm that picks an element as pivot and partitions the array around the pivot.

---

## Overview

Quick Sort demonstrates divide and conquer with a different strategy:
1. **Divide**: Partition array around pivot
2. **Conquer**: Recursively sort left and right partitions
3. **Combine**: Already sorted (no merge needed)

---

## Implementation

The complete implementation is available at:
**[Algorithms/Sorting/Quick Sort](../../Sorting/Quick%20Sort/)**

The implementation includes:
- Python, C++, and Go versions
- Multiple pivot selection strategies
- Comprehensive test suites
- Detailed documentation

---

## Divide and Conquer Analysis

### Recurrence Relation
```
T(n) = T(k) + T(n-k-1) + O(n)
```
Where k is the size of left partition.

### Best/Average Case
- **Time Complexity**: O(n log n)
- **Space Complexity**: O(log n)

### Worst Case
- **Time Complexity**: O(n²) when pivot is always smallest/largest
- **Space Complexity**: O(n)

---

## Key Characteristics

- ✅ **Fast average case**: O(n log n) average
- ✅ **In-place**: O(log n) extra space
- ✅ **Divide and Conquer**: Efficient partitioning strategy
- ❌ **Worst case O(n²)**: Can degrade with bad pivot

---

## Related Algorithms

- **Merge Sort**: Another divide and conquer sorting algorithm
- **Binary Search**: Divide and conquer for searching
- **Strassen's Matrix Multiplication**: Advanced divide and conquer

---

_See full implementation: [Algorithms/Sorting/Quick Sort](../../Sorting/Quick%20Sort/)_

