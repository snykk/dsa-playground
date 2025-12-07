# Merge Sort

**Merge Sort** is a divide and conquer algorithm that divides the array into two halves, sorts them, and then merges them.

---

## Overview

Merge Sort works by:
1. Dividing the array into two halves
2. Recursively sorting both halves
3. Merging the two sorted halves

---

## Algorithm

1. **Divide**: Split array into two halves
2. **Conquer**: Recursively sort both halves
3. **Combine**: Merge the sorted halves

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(n log n) | O(n) |
| **Average Case** | O(n log n) | O(n) |
| **Worst Case** | O(n log n) | O(n) |

**Note**: Always O(n log n) regardless of input order.

---

## Advantages

1. ✅ **Consistent**: Always O(n log n) time
2. ✅ **Stable**: Maintains relative order of equal elements
3. ✅ **Predictable**: Performance doesn't depend on input

---

## Disadvantages

1. ❌ **Extra space**: Requires O(n) additional memory
2. ❌ **Not in-place**: Needs temporary arrays
3. ❌ **Slower for small arrays**: Overhead of recursion

---

## When to Use

- ✅ Large arrays
- ✅ When stability is required
- ✅ When consistent performance is needed
- ✅ External sorting (sorting data on disk)
- ❌ Small arrays (use insertion sort)
- ❌ When memory is limited

---

## Implementations

- **Python** (`Python/`) - Recursive and iterative versions
- **C++** (`C++/`) - Template-based implementation
- **Go** (`Go/`) - Clean implementation

---

## Related Algorithms

- **Quick Sort**: Another divide and conquer, O(n log n) average
- **Heap Sort**: O(n log n) in-place sorting
- **Tim Sort**: Hybrid algorithm using merge sort

