# Counting Sort

**Counting Sort** is a sorting algorithm that sorts the elements of an array by counting the number of occurrences of each unique element.

---

## Overview

Counting Sort works by:
1. Counting occurrences of each element
2. Calculating cumulative counts
3. Placing elements in correct positions

---

## Algorithm

1. **Count**: Count occurrences of each element
2. **Cumulate**: Calculate cumulative counts
3. **Place**: Place elements in sorted order

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(n + k) | O(n + k) |
| **Average Case** | O(n + k) | O(n + k) |
| **Worst Case** | O(n + k) | O(n + k) |

Where k is the range of input (max - min + 1).

---

## Advantages

1. ✅ **Fast**: O(n + k) time complexity
2. ✅ **Stable**: Maintains relative order of equal elements
3. ✅ **Linear time**: When k is O(n)

---

## Disadvantages

1. ❌ **Limited range**: Only works with integers in small range
2. ❌ **Extra space**: Requires O(n + k) additional memory (count array plus output)
3. ❌ **Not comparison-based**: Can't sort arbitrary data types

---

## When to Use

- ✅ Small range of integers
- ✅ When range is O(n)
- ✅ Negative integers too: value x is counted at index x - min
- ❌ Large range of values
- ❌ Floating point numbers

---

## Implementations

- **Python** (`Python/`) - Standard and simplified versions
- **C++** (`C++/`) - `countingSort(const std::vector<int>&, int maxVal)` (throws if a value exceeds `maxVal`)
- **Go** (`Go/`) - Clean implementation

---

## Related Algorithms

- **Radix Sort**: Uses counting sort as subroutine
- **Bucket Sort**: Similar concept for larger ranges

