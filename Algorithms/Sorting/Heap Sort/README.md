# Heap Sort

**Heap Sort** is a comparison-based sorting algorithm that uses a binary heap data structure. It's similar to selection sort but uses a heap to find the maximum element.

---

## Overview

Heap Sort works by:
1. Building a max heap from the array
2. Repeatedly extracting the maximum element
3. Placing it at the end of the sorted portion

---

## Algorithm

1. **Build Heap**: Convert array into max heap
2. **Extract Max**: Remove root (max element)
3. **Heapify**: Restore heap property
4. **Repeat**: Continue until heap is empty

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(n log n) | O(1) |
| **Average Case** | O(n log n) | O(1) |
| **Worst Case** | O(n log n) | O(1) |

**Note**: Always O(n log n) regardless of input order.

---

## Advantages

1. ✅ **Consistent**: Always O(n log n) time
2. ✅ **In-place**: O(1) extra space
3. ✅ **Worst-case guarantee**: No worst-case degradation

---

## Disadvantages

1. ❌ **Not stable**: May change relative order of equal elements
2. ❌ **Slower than Quick Sort**: More comparisons in practice
3. ❌ **Cache inefficient**: Poor locality of reference

---

## When to Use

- ✅ When worst-case guarantee is needed
- ✅ When memory is limited
- ✅ Priority queue applications
- ❌ When stability is required
- ❌ When average performance is critical

---

## Implementations

- **Python** (`Python/`) - Standard implementation
- **C++** (`C++/`) - Template-based
- **Go** (`Go/`) - Clean implementation

---

## Related Algorithms

- **Selection Sort**: Similar concept but O(n²)
- **Quick Sort**: Faster average case but O(n²) worst case
- **Merge Sort**: Stable O(n log n) but requires extra space

