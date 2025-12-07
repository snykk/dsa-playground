# Quick Sort (Python)

**Quick Sort** is a divide and conquer algorithm that picks an element as pivot and partitions the array around the pivot.

---

## Complexity

- **Time**: O(n log n) average, O(n²) worst
- **Space**: O(log n) average

---

## Usage

```python
from quick_sort import quick_sort

arr = [64, 34, 25, 12, 22, 11, 90]
sorted_arr = quick_sort(arr.copy())
```

---

## Testing

```bash
python quick_sort_test.py
```

