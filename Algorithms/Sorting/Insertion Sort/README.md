# Insertion Sort

**Insertion Sort** is a simple sorting algorithm that builds the final sorted array one item at a time by inserting each element into its correct position.

---

## Overview

Insertion Sort works similarly to how you might sort playing cards in your hands. You pick one card and insert it into the correct position among the already sorted cards.

---

## Algorithm

1. Start with the second element (index 1)
2. Compare with previous elements
3. Shift larger elements to the right
4. Insert current element in correct position
5. Repeat for all elements

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(n) | O(1) |
| **Average Case** | O(n²) | O(1) |
| **Worst Case** | O(n²) | O(1) |

**Note**: Best case O(n) occurs when array is already sorted.

---

## Advantages

1. ✅ **Simple**: Easy to understand and implement
2. ✅ **Efficient for small arrays**: Often faster than O(n log n) algorithms for small n
3. ✅ **Stable**: Maintains relative order of equal elements
4. ✅ **Adaptive**: Efficient for nearly sorted arrays
5. ✅ **In-place**: O(1) extra space

---

## Disadvantages

1. ❌ **Slow for large arrays**: O(n²) time complexity
2. ❌ **Many comparisons**: Compares each element with many others

---

## When to Use

- ✅ Small arrays (< 50 elements)
- ✅ Nearly sorted arrays
- ✅ Educational purposes
- ✅ As part of hybrid algorithms (e.g., Timsort)
- ❌ Large unsorted arrays

---

## Implementations

- **Python** (`Python/`) - Standard and recursive versions
- **C++** (`C++/`) - Template-based implementation
- **Go** (`Go/`) - Clean implementation

---

## Related Algorithms

- **Bubble Sort**: Another O(n²) algorithm
- **Selection Sort**: Another simple sorting algorithm
- **Shell Sort**: Improved version using gaps

