# Insertion Sort (Python)

**Insertion Sort** builds the final sorted array one item at a time by inserting each element into its correct position.

---

## Complexity

- **Time**: O(n²) worst/average, O(n) best (already sorted)
- **Space**: O(1)

---

## Usage

```python
from insertion_sort import insertion_sort

arr = [64, 34, 25, 12, 22, 11, 90]
sorted_arr = insertion_sort(arr.copy())
```

---

## Testing

```bash
python insertion_sort_test.py
```

