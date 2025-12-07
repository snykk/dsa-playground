# Binary Search (Python)

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

1. **`binary_search(arr, target)`**
   - Iterative implementation
   - O(1) space complexity
   - Returns index of target if found, -1 otherwise

2. **`binary_search_recursive(arr, target, left=0, right=None)`**
   - Recursive implementation
   - O(log n) space complexity
   - More intuitive but uses recursion stack

3. **`binary_search_first_occurrence(arr, target)`**
   - Finds first occurrence in array with duplicates
   - Useful for lower bound problems
   - O(log n) time complexity

4. **`binary_search_last_occurrence(arr, target)`**
   - Finds last occurrence in array with duplicates
   - Useful for upper bound problems
   - O(log n) time complexity

5. **`binary_search_closest(arr, target)`**
   - Finds index of element closest to target
   - Useful when exact match may not exist
   - O(log n) time complexity

---

## Usage

```python
from binary_search import (
    binary_search,
    binary_search_recursive,
    binary_search_first_occurrence,
    binary_search_last_occurrence,
    binary_search_closest
)

# Basic search
arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
index = binary_search(arr, 5)
print(index)  # Output: 4

# Not found
index = binary_search(arr, 11)
print(index)  # Output: -1

# Recursive search
index = binary_search_recursive(arr, 7)
print(index)  # Output: 6

# First occurrence (with duplicates)
arr = [1, 2, 2, 2, 3, 4, 5]
index = binary_search_first_occurrence(arr, 2)
print(index)  # Output: 1

# Last occurrence (with duplicates)
index = binary_search_last_occurrence(arr, 2)
print(index)  # Output: 3

# Closest element
arr = [1, 3, 5, 7, 9]
index = binary_search_closest(arr, 4)
print(index)  # Output: 2 (5 is closest)
```

---

## Important Notes

1. **Array must be sorted**: Binary Search only works on sorted arrays
2. **Use `left + (right - left) // 2`**: Prevents integer overflow
3. **Boundary conditions**: Always check `left <= right` in while loop
4. **First/Last occurrence**: Useful for problems with duplicate elements

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

## Testing

Run the test suite:

```bash
python binary_search_test.py
```

---

## Related Algorithms

- **Linear Search**: O(n) for unsorted arrays
- **Ternary Search**: O(log₃ n) for unimodal functions
- **Interpolation Search**: O(log log n) for uniformly distributed data
- **Binary Search Tree**: Data structure optimized for searching

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 3)
- "Algorithm Design Manual" by Steven Skiena

