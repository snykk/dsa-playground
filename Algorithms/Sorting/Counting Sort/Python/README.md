# Counting Sort (Python)

**Counting Sort** sorts elements by counting occurrences of each unique element.

---

## Complexity

- **Time**: O(n + k) where k is the range
- **Space**: O(k)

---

## Usage

```python
from counting_sort import counting_sort

arr = [4, 2, 2, 8, 3, 3, 1]
sorted_arr = counting_sort(arr)
```

---

## Testing

```bash
python counting_sort_test.py
```

