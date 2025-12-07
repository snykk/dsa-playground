# Bucket Sort (Python)

**Bucket Sort** distributes elements into buckets and sorts each bucket.

---

## Complexity

- **Time**: O(n + k) average, O(n²) worst
- **Space**: O(n)

---

## Usage

```python
from bucket_sort import bucket_sort, bucket_sort_integers

# For floats in [0.0, 1.0)
arr = [0.897, 0.565, 0.656, 0.1234, 0.665, 0.3434]
sorted_arr = bucket_sort(arr.copy())

# For integers
arr = [4, 2, 2, 8, 3, 3, 1]
sorted_arr = bucket_sort_integers(arr.copy())
```

---

## Testing

```bash
python bucket_sort_test.py
```

