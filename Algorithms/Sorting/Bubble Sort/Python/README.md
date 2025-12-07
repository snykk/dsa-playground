# Bubble Sort (Python)

**Bubble Sort** is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.

---

## Overview

Bubble Sort gets its name because smaller elements "bubble" to the top of the list (beginning) while larger elements "sink" to the bottom (end) with each pass.

---

## Algorithm

1. Compare adjacent elements
2. Swap if they are in wrong order
3. Repeat for all pairs
4. Continue until no swaps are needed

---

## Complexity

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(n) | O(1) |
| **Average Case** | O(n²) | O(1) |
| **Worst Case** | O(n²) | O(1) |

---

## Usage

```python
from bubble_sort import bubble_sort

arr = [64, 34, 25, 12, 22, 11, 90]
sorted_arr = bubble_sort(arr.copy())
print(sorted_arr)  # [11, 12, 22, 25, 34, 64, 90]
```

---

## Variants

- **Standard**: Basic implementation
- **Optimized**: Early termination when no swaps occur
- **Recursive**: Recursive implementation

---

## Testing

```bash
python bubble_sort_test.py
```

---

## Related Algorithms

- **Insertion Sort**: Another O(n²) algorithm
- **Selection Sort**: Another simple sorting algorithm

