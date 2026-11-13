# Bucket Sort -- Python Implementation

## Files

- `bucket_sort.py`: `bucket_sort`, `bucket_sort_integers` and the helper `insertion_sort` used inside buckets.
- `bucket_sort_test.py`: unit tests (floats, integers, empty, single, 1.0 and 0.0, out-of-range input, negative integers, random comparison with `sorted`).

## API

- `bucket_sort(arr, num_buckets=None)`: sorts floats in `[0.0, 1.0]` and returns a new list (an empty input is returned as is). `num_buckets` defaults to `len(arr)`. Raises `ValueError` for a value outside `[0.0, 1.0]` or NaN.
- `bucket_sort_integers(arr, max_val=None)`: sorts integers (negatives allowed) with one bucket per value; the memory is `max - min + 1` lists. Raises `ValueError` if `max_val` is below the largest value.
- `insertion_sort(arr)`: in-place insertion sort for one bucket.

```python
from bucket_sort import bucket_sort, bucket_sort_integers

print(bucket_sort([0.897, 0.565, 0.656, 0.1234, 0.665, 0.3434]))
print(bucket_sort_integers([4, 2, 2, 8, 3, 3, 1]))  # [1, 2, 2, 3, 3, 4, 8]
```

## Python-Specific Notes

- Buckets are lists of lists; the inner insertion sort is stable, so equal keys stay in arrival order.
- `bucket_sort_integers` is Counting Sort in disguise. It exists only in Python; C++ and Go have no integer version.
- Python 3.9 and later.

## How to Run

```bash
python3 -m unittest bucket_sort_test
```

## Key Takeaways

- The bucket index `int(x * n)` is monotonic, which is why concatenation yields a sorted list.
- Clamp `1.0` into the last bucket and reject anything outside `[0, 1]`.
- Use `sorted()` in real code unless you have a very large, uniform input.
