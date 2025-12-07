# Ternary Search (Python)

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
- Space complexity is O(log₃ n) for recursive version
- Ternary Search typically performs more comparisons than Binary Search

---

## Implementation Details

### Functions

1. **`ternary_search(arr, target)`**
   - Iterative implementation
   - O(1) space complexity
   - Returns index of target if found, -1 otherwise

2. **`ternary_search_recursive(arr, target, left=0, right=None)`**
   - Recursive implementation
   - O(log₃ n) space complexity
   - More intuitive but uses recursion stack

3. **`ternary_search_unimodal(func, left, right)`**
   - Finds maximum of unimodal function
   - Useful for optimization problems
   - Function must be strictly increasing then decreasing

---

## Usage

```python
from ternary_search import (
    ternary_search,
    ternary_search_recursive,
    ternary_search_unimodal
)

# Basic search
arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
index = ternary_search(arr, 5)
print(index)  # Output: 4

# Recursive search
index = ternary_search_recursive(arr, 7)
print(index)  # Output: 6

# Find maximum of unimodal function
def func(x):
    return -(x - 5) ** 2 + 25  # Maximum at x=5

max_x = ternary_search_unimodal(func, 0, 10)
print(max_x)  # Output: 5 (approximately)
```

---

## Ternary Search vs Binary Search

| Aspect | Ternary Search | Binary Search |
|--------|----------------|---------------|
| **Comparisons per iteration** | 2 | 1 |
| **Time Complexity** | O(log₃ n) | O(log₂ n) |
| **Practical Performance** | Slower (more comparisons) | Faster |
| **Use Case** | Unimodal functions | General searching |

**Note**: Binary Search is generally preferred for array searching due to fewer comparisons.

---

## Advantages

1. ✅ **Useful for unimodal functions**: Can find maximum/minimum efficiently
2. ✅ **Divide-and-conquer**: Reduces search space by 2/3 each iteration
3. ✅ **Same asymptotic complexity**: O(log n) class

---

## Disadvantages

1. ❌ **More comparisons**: 2 comparisons vs 1 in Binary Search
2. ❌ **Slower in practice**: Despite same complexity class
3. ❌ **Less common**: Binary Search is more widely used

---

## When to Use

- ✅ Finding maximum/minimum of unimodal functions
- ✅ Optimization problems with unimodal constraints
- ✅ When you need to divide into three parts
- ❌ General array searching (use Binary Search instead)

---

## Unimodal Functions

A unimodal function has a single peak (maximum) or valley (minimum). Examples:
- Parabolic functions: `f(x) = -(x - a)² + b`
- Functions with single maximum/minimum
- Bitonic sequences

---

## Testing

Run the test suite:

```bash
python ternary_search_test.py
```

---

## Related Algorithms

- **Binary Search**: O(log₂ n) for sorted arrays
- **Linear Search**: O(n) for unsorted arrays
- **Interpolation Search**: O(log log n) for uniformly distributed data

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena

