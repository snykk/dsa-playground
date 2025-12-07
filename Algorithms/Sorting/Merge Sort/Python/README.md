# Merge Sort (Python)

**Merge Sort** is a divide and conquer algorithm that divides the array into two halves, sorts them, and merges them.

---

## Complexity

- **Time**: O(n log n)
- **Space**: O(n)

---

## Usage

```python
from merge_sort import merge_sort

arr = [64, 34, 25, 12, 22, 11, 90]
sorted_arr = merge_sort(arr.copy())
```

---

## Testing

```bash
python merge_sort_test.py
```

