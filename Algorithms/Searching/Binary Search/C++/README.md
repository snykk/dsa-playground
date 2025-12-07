# Binary Search (C++)

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

## Implementation Details

### Functions

1. **`binarySearch(arr, target)`**
   - Iterative implementation
   - O(1) space complexity
   - Template-based for generic types

2. **`binarySearchRecursive(arr, target, left, right)`**
   - Recursive implementation
   - O(log n) space complexity
   - More intuitive but uses recursion stack

3. **`binarySearchFirstOccurrence(arr, target)`**
   - Finds first occurrence in array with duplicates
   - Useful for lower bound problems

4. **`binarySearchLastOccurrence(arr, target)`**
   - Finds last occurrence in array with duplicates
   - Useful for upper bound problems

---

## Usage

```cpp
#include <vector>
#include "binary_search.cpp"

// Basic search
std::vector<int> arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
int index = binarySearch(arr, 5);
// index = 4

// Recursive search
int index = binarySearchRecursive(arr, 7, 0, arr.size() - 1);
// index = 6

// First occurrence (with duplicates)
std::vector<int> arr = {1, 2, 2, 2, 3, 4, 5};
int index = binarySearchFirstOccurrence(arr, 2);
// index = 1

// Last occurrence (with duplicates)
int index = binarySearchLastOccurrence(arr, 2);
// index = 3
```

---

## Compilation

```bash
g++ -std=c++11 binary_search.cpp binary_search_test.cpp -o test
./test
```

---

## Important Notes

1. **Array must be sorted**: Binary Search only works on sorted arrays
2. **Use `left + (right - left) / 2`**: Prevents integer overflow
3. **Boundary conditions**: Always check `left <= right` in while loop

---

## Advantages

1. ✅ **Efficient**: O(log n) time complexity
2. ✅ **Optimal**: Best possible for comparison-based search
3. ✅ **Space efficient**: O(1) space for iterative version
4. ✅ **Generic**: Template-based for any comparable type

---

## Disadvantages

1. ❌ **Requires sorted array**: Must sort first (O(n log n))
2. ❌ **Not suitable for unsorted data**: Use Linear Search instead

---

## When to Use

- ✅ Sorted arrays
- ✅ Large datasets
- ✅ Need guaranteed O(log n) performance
- ❌ Unsorted data

---

## Related Algorithms

- **Linear Search**: O(n) for unsorted arrays
- **Ternary Search**: O(log₃ n) for unimodal functions
- **Interpolation Search**: O(log log n) for uniformly distributed data

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 3)
- "Algorithm Design Manual" by Steven Skiena

