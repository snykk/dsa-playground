# Selection Sort -- Python Implementation

## Files

- `selection_sort.py`: `selection_sort`.
- `selection_sort_test.py`: unit tests (basic, sorted, empty, single, no writes on sorted input, swap count, a demonstration that it is not stable).

## API

- `selection_sort(arr)`: sorts `arr` in place and returns the same list. Swaps only when the minimum is not already at position `i`.

```python
from selection_sort import selection_sort

print(selection_sort([64, 34, 25, 12, 22, 11, 90]))  # [11, 12, 22, 25, 34, 64, 90]
```

## Python-Specific Notes

- Works on any items that support `<`.
- Not stable; the tests include the example `[2a, 2b, 1]` becoming `[1, 2b, 2a]`.
- A sorted list is never written to.
- Python 3.9 and later. For real code use `sorted()`.

## How to Run

```bash
python3 -m unittest selection_sort_test
```

## Key Takeaways

- Comparisons are always n(n - 1)/2; swaps are at most n - 1.
- The sorted prefix is final after every round.
