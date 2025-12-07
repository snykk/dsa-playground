# Ternary Search (C++)

**Ternary Search** is a divide-and-conquer algorithm that finds the position of a target value in a sorted array by dividing the search space into three parts.

---

## Overview

Ternary Search divides the search space into three equal parts and compares the target with values at two partition points. While it has the same asymptotic complexity as Binary Search, it typically performs more comparisons per iteration.

---

## Algorithm

1. Divide search space into three parts
2. Compare target with values at two partition points
3. If match found, return index
4. Eliminate two-thirds of search space
5. Repeat until found or exhausted

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(1) | O(1) |
| **Average Case** | O(log₃ n) | O(1) |
| **Worst Case** | O(log₃ n) | O(1) |

**Note**: O(log₃ n) ≈ O(0.63 log n), but performs more comparisons than Binary Search.

---

## Implementation Details

### Functions

1. **`ternarySearch(arr, target)`**
   - Iterative implementation
   - O(1) space complexity
   - Template-based for generic types

2. **`ternarySearchRecursive(arr, target, left, right)`**
   - Recursive implementation
   - O(log₃ n) space complexity

---

## Usage

```cpp
#include <vector>
#include "ternary_search.cpp"

std::vector<int> arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
int index = ternarySearch(arr, 5);
// index = 4
```

---

## Compilation

```bash
g++ -std=c++11 ternary_search.cpp ternary_search_test.cpp -o test
./test
```

---

## When to Use

- ✅ Finding maximum/minimum of unimodal functions
- ✅ Optimization problems
- ❌ General array searching (use Binary Search instead)

---

## Related Algorithms

- **Binary Search**: O(log₂ n) for sorted arrays
- **Linear Search**: O(n) for unsorted arrays

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena

