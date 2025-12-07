# Linear Search

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

## Visual Example

```
Array: [10, 20, 30, 40, 50]
Target: 30

Step 1: Check arr[0] = 10 ≠ 30, continue
Step 2: Check arr[1] = 20 ≠ 30, continue
Step 3: Check arr[2] = 30 = 30, found! Return 2
```

---

## Advantages

1. ✅ **Simple**: Easy to understand and implement
2. ✅ **No prerequisites**: Works on any data structure
3. ✅ **No sorting required**: Works on unsorted arrays
4. ✅ **Flexible**: Can find first, last, or all occurrences
5. ✅ **In-place**: O(1) extra space

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

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - Standard, recursive, and all-occurrences versions
- **C++** (`C++/`) - Template-based implementation
- **Go** (`Go/`) - Generic implementation with Go 1.21+

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Related Algorithms

- **Binary Search**: O(log n) for sorted arrays
- **Interpolation Search**: O(log log n) for uniformly distributed sorted arrays
- **Ternary Search**: O(log₃ n) for unimodal functions
- **Hash Table**: O(1) average case searching

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 2)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

