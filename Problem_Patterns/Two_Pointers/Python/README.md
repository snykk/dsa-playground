# Two Pointers -- Python Implementation

Opposite-end and read/write pointer scans. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `two_pointers.py` | Five functions and a demo `main` |
| `two_pointers_test.py` | Unit tests per function |

## API

- `two_sum_sorted(arr, target)`: `[left, right]` of the first pair found, or `None`.
- `three_sum(arr, target)`: unique triplets as lists; sorts `arr` in place.
- `is_palindrome(s)`: ignores non-alphanumeric characters and case.
- `remove_duplicates(arr)`: compacts a sorted list in place and returns the new length.
- `container_with_most_water(heights)`: maximum area.

## Python-Specific Notes

- `three_sum` sorts the list you pass in; pass `list(arr)` to keep the original order.
- `is_palindrome` uses `str.isalnum()` and `str.lower()`, so it handles Unicode letters.
- Integers do not overflow.

## How to Run

```bash
python3 -m unittest two_pointers_test
python3 two_pointers.py
```

## Key Takeaways

- Each pointer moves at most n steps, so the scans are O(n).
- Opposite-end pair search needs sorted input.
- Skip duplicates in `three_sum` to avoid repeated triplets.
