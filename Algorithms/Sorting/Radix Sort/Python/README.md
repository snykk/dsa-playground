# Radix Sort -- Python Implementation

## Files

- `radix_sort.py`: `radix_sort` and `counting_sort_by_digit`.
- `radix_sort_test.py`: unit tests (basic, sorted, empty, single, negatives, zeros and large values, random comparison with `sorted`).

## API

- `radix_sort(arr)`: LSD radix sort, base 10; sorts `arr` in place and returns the same list. Negative values are allowed.
- `counting_sort_by_digit(arr, exp, offset=0)`: one stable counting-sort pass on the digit `((value - offset) // exp) % 10`.

```python
from radix_sort import radix_sort

print(radix_sort([170, 45, 75, 90, 802, 24, 2, 66]))  # [2, 24, 45, 66, 75, 90, 170, 802]
print(radix_sort([3, -1, 2]))                        # [-1, 2, 3]
```

## Python-Specific Notes

- Integers only; a float or other type fails in the digit arithmetic.
- Python integers do not overflow, so very large values work (with more passes).
- Floor division and `%` on a negative number round down, which is why the code shifts negatives by the minimum instead of using the raw value.
- Python 3.9 and later. For real code use `sorted()`.

## How to Run

```bash
python3 -m unittest radix_sort_test
```

## Key Takeaways

- Each pass must be stable; back-to-front placement does that.
- The shift by the minimum makes negatives work.
- The number of passes is the number of digits of the largest key.
