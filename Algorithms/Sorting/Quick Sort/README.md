# Quick Sort

**Quick Sort** is a divide and conquer algorithm that picks an element as pivot and partitions the array around the pivot.

---

## Overview

Quick Sort works by:
1. Choosing a pivot element
2. Partitioning the array around the pivot
3. Recursively sorting the subarrays

---

## Algorithm

1. **Choose Pivot**: Select an element as pivot
2. **Partition**: Rearrange array so elements < pivot are on left, > pivot on right
3. **Recurse**: Apply Quick Sort to left and right subarrays

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(n log n) | O(log n) |
| **Average Case** | O(n log n) | O(log n) |
| **Worst Case** | O(n²) | O(n) |

**Note**: Worst case occurs when pivot is always smallest/largest element.

---

## Pivot Selection Strategies

1. **Last Element**: Simple but can lead to worst case
2. **First Element**: Similar to last element
3. **Random**: Reduces chance of worst case
4. **Median of Three**: Better pivot selection

---

## Advantages

1. ✅ **Fast average case**: O(n log n) average
2. ✅ **In-place**: O(log n) extra space
3. ✅ **Cache efficient**: Good locality of reference

---

## Disadvantages

1. ❌ **Worst case O(n²)**: Can degrade with bad pivot selection
2. ❌ **Not stable**: May change relative order of equal elements
3. ❌ **Performance varies**: Depends on pivot selection

---

## When to Use

- ✅ Large arrays
- ✅ When average performance matters
- ✅ General-purpose sorting
- ❌ When worst-case guarantee is needed
- ❌ When stability is required

---

## Implementations

- **Python** (`Python/`) - Lomuto and Hoare partition schemes
- **C++** (`C++/`) - Template-based implementation
- **Go** (`Go/`) - Clean implementation

---

## Related Algorithms

- **Merge Sort**: Another divide and conquer, always O(n log n)
- **Heap Sort**: O(n log n) worst case guarantee
- **Intro Sort**: Hybrid of Quick Sort and Heap Sort

