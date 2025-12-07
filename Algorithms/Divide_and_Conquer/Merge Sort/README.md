# Merge Sort (Divide and Conquer)

**Merge Sort** is a classic divide and conquer algorithm that divides the array into two halves, sorts them recursively, and then merges them.

---

## Overview

Merge Sort is a perfect example of the divide and conquer paradigm:
1. **Divide**: Split array into two halves
2. **Conquer**: Recursively sort both halves
3. **Combine**: Merge the sorted halves

---

## Implementation

The complete implementation is available at:
**[Algorithms/Sorting/Merge Sort](../../Sorting/Merge%20Sort/)**

The implementation includes:
- Python, C++, and Go versions
- Recursive and iterative approaches
- Comprehensive test suites
- Detailed documentation

---

## Divide and Conquer Analysis

### Recurrence Relation
```
T(n) = 2T(n/2) + O(n)
```

### Master Theorem
- a = 2 (2 subproblems)
- b = 2 (each subproblem is half size)
- f(n) = O(n) (merging cost)

**Case 2**: f(n) = Θ(n^log_b(a)) = Θ(n)
- **Time Complexity**: O(n log n)
- **Space Complexity**: O(n)

---

## Key Characteristics

- ✅ **Always O(n log n)**: Consistent performance
- ✅ **Stable**: Maintains relative order
- ✅ **Divide and Conquer**: Classic example of the paradigm
- ❌ **Not in-place**: Requires O(n) extra space

---

## Related Algorithms

- **Quick Sort**: Another divide and conquer sorting algorithm
- **Binary Search**: Divide and conquer for searching
- **Strassen's Matrix Multiplication**: Advanced divide and conquer

---

_See full implementation: [Algorithms/Sorting/Merge Sort](../../Sorting/Merge%20Sort/)_

