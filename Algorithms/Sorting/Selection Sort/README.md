# Selection Sort

**Selection Sort** is a simple sorting algorithm that repeatedly finds the minimum element from the unsorted part and puts it at the beginning.

---

## Overview

Selection Sort maintains two subarrays: sorted and unsorted. In each iteration, it finds the minimum element from the unsorted subarray and moves it to the end of the sorted subarray.

---

## Algorithm

1. Find minimum element in unsorted array
2. Swap with first element of unsorted array
3. Move boundary between sorted and unsorted arrays
4. Repeat until array is sorted

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(n²) | O(1) |
| **Average Case** | O(n²) | O(1) |
| **Worst Case** | O(n²) | O(1) |

**Note**: Always O(n²) regardless of input order.

---

## Advantages

1. ✅ **Simple**: Easy to understand and implement
2. ✅ **In-place**: O(1) extra space
3. ✅ **Minimal swaps**: Only n swaps required

---

## Disadvantages

1. ❌ **Always O(n²)**: No best case optimization
2. ❌ **Not stable**: May change relative order of equal elements
3. ❌ **Not adaptive**: Performance doesn't improve for nearly sorted arrays

---

## When to Use

- ✅ Small arrays
- ✅ When memory writes are expensive
- ✅ Educational purposes
- ❌ Large arrays
- ❌ When stability is required

---

## Implementations

- **Python** (`Python/`) - Standard implementation
- **C++** (`C++/`) - Template-based
- **Go** (`Go/`) - Clean implementation

---

## Related Algorithms

- **Bubble Sort**: Another O(n²) algorithm
- **Insertion Sort**: Another simple sorting algorithm
- **Heap Sort**: Uses similar selection concept but O(n log n)

