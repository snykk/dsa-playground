# Linear Search (Python)

**Linear Search** is a simple searching algorithm that sequentially checks each element in a list until a match is found or the entire list has been searched.

---

## Overview

Linear Search, also known as Sequential Search, is the simplest searching algorithm. It works by checking each element one by one from the beginning until the target is found or the end is reached.

---

## Algorithm

1. Start from the first element
2. Compare current element with target
3. If match found, return index
4. If not, move to next element
5. Repeat until end of array
6. If not found, return -1

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(1) | O(1) |
| **Average Case** | O(n) | O(1) |
| **Worst Case** | O(n) | O(1) |

**Note**: Best case O(1) occurs when target is at the first position.

---

## Implementation Details

### Functions

1. **`linear_search(arr, target)`**
   - Iterative implementation
   - Returns index of first occurrence
   - Returns -1 if not found

2. **`linear_search_recursive(arr, target, index=0)`**
   - Recursive implementation
   - Uses recursion stack
   - Space complexity: O(n)

3. **`linear_search_all_occurrences(arr, target)`**
   - Finds all occurrences of target
   - Returns list of indices
   - Useful when duplicates exist

---

## Usage

```python
from linear_search import linear_search, linear_search_recursive, linear_search_all_occurrences

# Basic search
arr = [10, 20, 30, 40, 50]
index = linear_search(arr, 30)
print(index)  # Output: 2

# Not found
index = linear_search(arr, 25)
print(index)  # Output: -1

# Recursive search
index = linear_search_recursive(arr, 40)
print(index)  # Output: 3

# Find all occurrences
arr = [10, 20, 30, 20, 40, 20]
indices = linear_search_all_occurrences(arr, 20)
print(indices)  # Output: [1, 3, 5]
```

---

## Advantages

1. ✅ **Simple**: Easy to understand and implement
2. ✅ **No prerequisites**: Works on any data structure
3. ✅ **No sorting required**: Works on unsorted arrays
4. ✅ **Flexible**: Can find first, last, or all occurrences

---

## Disadvantages

1. ❌ **Slow**: O(n) time complexity
2. ❌ **Inefficient**: Must check every element in worst case
3. ❌ **Not optimal**: Better algorithms exist for sorted data

---

## When to Use

- ✅ Unsorted arrays
- ✅ Small datasets
- ✅ Simple implementation needed
- ✅ Need to find all occurrences
- ❌ Large sorted datasets (use Binary Search instead)

---

## Testing

Run the test suite:

```bash
python linear_search_test.py
```

---

## Related Algorithms

- **Binary Search**: O(log n) for sorted arrays
- **Interpolation Search**: O(log log n) for uniformly distributed sorted arrays
- **Hash Table**: O(1) average case searching

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena

