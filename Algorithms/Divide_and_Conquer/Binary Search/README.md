# Binary Search (Divide and Conquer)

**Binary Search** is a divide and conquer algorithm that finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.

---

## Overview

Binary Search is a simple but powerful divide and conquer algorithm:
1. **Divide**: Compare target with middle element
2. **Conquer**: Recursively search in the appropriate half
3. **Combine**: Return the index (no combination needed)

---

## Implementation

The complete implementation is available at:
**[Algorithms/Searching/Binary Search](../../Searching/Binary%20Search/)**

The implementation includes:
- Python, C++, and Go versions
- Iterative and recursive approaches
- First/last occurrence variants
- Comprehensive test suites
- Detailed documentation

---

## Divide and Conquer Analysis

### Recurrence Relation
```
T(n) = T(n/2) + O(1)
```

### Master Theorem
- a = 1 (1 subproblem)
- b = 2 (half the size)
- f(n) = O(1) (comparison cost)

**Case 2**: f(n) = Θ(n^log_b(a)) = Θ(1)
- **Time Complexity**: O(log n)
- **Space Complexity**: O(1) iterative, O(log n) recursive

---

## Key Characteristics

- ✅ **Efficient**: O(log n) time complexity
- ✅ **Simple**: Easy to understand and implement
- ✅ **Divide and Conquer**: Classic example of the paradigm
- ❌ **Requires sorted array**: Must sort first

---

## Related Algorithms

- **Merge Sort**: Divide and conquer for sorting
- **Quick Sort**: Another divide and conquer sorting
- **Ternary Search**: Divide into three parts instead of two

---

_See full implementation: [Algorithms/Searching/Binary Search](../../Searching/Binary%20Search/)_

