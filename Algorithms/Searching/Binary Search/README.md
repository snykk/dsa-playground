# Binary Search

**Binary Search** is an efficient searching algorithm that finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.

---

## Overview

Binary Search is a divide-and-conquer algorithm that works on sorted arrays. It compares the target value to the middle element and eliminates half of the search space in each iteration.

---

## Algorithm

1. Compare target with middle element
2. If match found, return index
3. If target is greater, search right half
4. If target is smaller, search left half
5. Repeat until found or search space is exhausted

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(1) | O(1) |
| **Average Case** | O(log n) | O(1) |
| **Worst Case** | O(log n) | O(1) |

**Note**: Space complexity is O(log n) for recursive version due to recursion stack.

---

## Visual Example

```
Array: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
Target: 7

Step 1: mid = 4, arr[4] = 5 < 7, search right [6, 7, 8, 9, 10]
Step 2: mid = 7, arr[7] = 8 > 7, search left [6, 7]
Step 3: mid = 5, arr[5] = 6 < 7, search right [7]
Step 4: mid = 6, arr[6] = 7 = 7, found! Return 6
```

---

## Advantages

1. ✅ **Efficient**: O(log n) time complexity
2. ✅ **Optimal**: Best possible for comparison-based search on sorted arrays
3. ✅ **Space efficient**: O(1) space for iterative version
4. ✅ **Versatile**: Can find first, last, or closest occurrence

---

## Disadvantages

1. ❌ **Requires sorted array**: Must sort first (O(n log n))
2. ❌ **Not suitable for unsorted data**: Use Linear Search instead
3. ❌ **Random access required**: Doesn't work well with linked lists

---

## When to Use

- ✅ Sorted arrays
- ✅ Large datasets
- ✅ Need guaranteed O(log n) performance
- ✅ Multiple searches on same array
- ❌ Unsorted data (sort first or use Linear Search)
- ❌ Small datasets (overhead may not be worth it)

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - Standard, recursive, first/last occurrence, and closest variants
- **C++** (`C++/`) - Template-based implementation
- **Go** (`Go/`) - Implementation with Go 1.21+

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Related Algorithms

- **Linear Search**: O(n) for unsorted arrays
- **Ternary Search**: O(log₃ n) for unimodal functions
- **Interpolation Search**: O(log log n) for uniformly distributed sorted arrays
- **Binary Search Tree**: Data structure optimized for searching

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 3)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

