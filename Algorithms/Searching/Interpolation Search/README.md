# Interpolation Search

**Interpolation Search** is an improved variant of Binary Search for uniformly distributed sorted arrays. It uses the value of the target to estimate its position, similar to how humans search in a phone book.

---

## Overview

Interpolation Search estimates the position of the target value based on the values at the boundaries. It works best when the data is uniformly distributed, achieving O(log log n) average time complexity.

---

## Algorithm

1. Check if target is within array bounds
2. Calculate position using interpolation formula:
   `pos = left + ((target - arr[left]) * (right - left)) / (arr[right] - arr[left])`
3. Compare target with element at calculated position
4. If match found, return index
5. If target is smaller, search left
6. If target is larger, search right
7. Repeat until found or exhausted

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(1) | O(1) |
| **Average Case** | O(log log n) | O(1) |
| **Worst Case** | O(n) | O(1) |

**Note**: 
- Best case: O(1) when target is at calculated position
- Average case: O(log log n) for uniformly distributed data
- Worst case: O(n) when distribution is highly non-uniform

---

## Interpolation Formula

The position is calculated as:
```
pos = left + ((target - arr[left]) * (right - left)) / (arr[right] - arr[left])
```

This formula estimates where the target should be based on the value distribution.

---

## Advantages

1. ✅ **Very fast**: O(log log n) average case for uniform distribution
2. ✅ **Intuitive**: Similar to how humans search
3. ✅ **Better than Binary Search**: For uniformly distributed data
4. ✅ **Adaptive**: Adjusts position based on value distribution

---

## Disadvantages

1. ❌ **Requires uniform distribution**: Performance degrades with non-uniform data
2. ❌ **Worst case O(n)**: Can be slower than Binary Search for bad distributions
3. ❌ **More complex**: Requires additional calculations
4. ❌ **Only for sorted arrays**: Like Binary Search

---

## When to Use

- ✅ Uniformly distributed sorted arrays
- ✅ Large datasets with uniform distribution
- ✅ Phone book style data (names, IDs with uniform gaps)
- ❌ Non-uniformly distributed data (use Binary Search instead)
- ❌ Small datasets (overhead may not be worth it)

---

## Comparison with Binary Search

| Aspect | Interpolation Search | Binary Search |
|--------|---------------------|---------------|
| **Average Case** | O(log log n) | O(log n) |
| **Worst Case** | O(n) | O(log n) |
| **Requirement** | Uniform distribution | Any sorted array |
| **Practical Use** | Specific cases | General purpose |

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - Standard and recursive versions
- **C++** (`C++/`) - Template-based implementation
- **Go** (`Go/`) - Implementation with Go 1.21+

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Related Algorithms

- **Binary Search**: O(log n) for any sorted array
- **Linear Search**: O(n) for unsorted arrays
- **Ternary Search**: O(log₃ n) for unimodal functions

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

