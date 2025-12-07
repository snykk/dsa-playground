# Radix Sort (Python)

**Radix Sort** sorts numbers by processing individual digits using counting sort.

---

## Complexity

- **Time**: O(d × (n + k)) where d is number of digits
- **Space**: O(n + k)

---

## Usage

```python
from radix_sort import radix_sort

arr = [170, 45, 75, 90, 802, 24, 2, 66]
sorted_arr = radix_sort(arr.copy())
```

---

## Testing

```bash
python radix_sort_test.py
```

