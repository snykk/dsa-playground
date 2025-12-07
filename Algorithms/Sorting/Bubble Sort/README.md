# Bubble Sort

**Bubble Sort** is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.

---

## Overview

Bubble Sort gets its name because smaller elements "bubble" to the top of the list (beginning) while larger elements "sink" to the bottom (end) with each pass through the array.

---

## Algorithm

1. Compare adjacent elements
2. Swap if they are in wrong order
3. Repeat for all pairs in the array
4. Continue until no swaps are needed

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(n) | O(1) |
| **Average Case** | O(n²) | O(1) |
| **Worst Case** | O(n²) | O(1) |

**Note**: Best case O(n) occurs when array is already sorted (with optimization).

---

## Visual Example

```
Initial: [64, 34, 25, 12, 22, 11, 90]

Pass 1: [34, 25, 12, 22, 11, 64, 90]  (64 bubbles to end)
Pass 2: [25, 12, 22, 11, 34, 64, 90]  (34 bubbles to position)
Pass 3: [12, 22, 11, 25, 34, 64, 90]  (25 bubbles to position)
Pass 4: [12, 11, 22, 25, 34, 64, 90]  (22 bubbles to position)
Pass 5: [11, 12, 22, 25, 34, 64, 90]  (12 bubbles to position)
Pass 6: [11, 12, 22, 25, 34, 64, 90]  (no swaps, sorted!)
```

---

## Advantages

1. ✅ **Simple**: Easy to understand and implement
2. ✅ **In-place**: O(1) extra space
3. ✅ **Stable**: Maintains relative order of equal elements
4. ✅ **Adaptive**: Can detect already sorted arrays

---

## Disadvantages

1. ❌ **Slow**: O(n²) time complexity
2. ❌ **Inefficient**: Many unnecessary comparisons
3. ❌ **Not practical**: Rarely used in real applications

---

## Optimizations

### Early Termination
Stop if no swaps occur in a pass (array is sorted).

### Cocktail Shaker Sort
Bidirectional bubble sort (bubble in both directions).

---

## When to Use

- ✅ Educational purposes
- ✅ Small datasets
- ✅ Nearly sorted arrays (with optimization)
- ❌ Large datasets
- ❌ Performance-critical applications

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - Standard, optimized, and recursive versions
- **C++** (`C++/`) - Template-based implementation
- **Go** (`Go/`) - Generic implementation with Go 1.21+

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Related Algorithms

- **Insertion Sort**: Another O(n²) algorithm, better for small arrays
- **Selection Sort**: Another simple O(n²) algorithm
- **Merge Sort**: O(n log n) divide and conquer algorithm
- **Quick Sort**: O(n log n) average case algorithm

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 2)
- "Algorithm Design Manual" by Steven Skiena

