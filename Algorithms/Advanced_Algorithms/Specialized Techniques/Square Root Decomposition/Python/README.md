# Square Root Decomposition -- Python Implementation

## Files

| File | Contents |
|------|----------|
| `square_root_decomposition.py` | the `SqrtDecomposition` class and a demo `main()` |
| `square_root_decomposition_test.py` | unit tests (queries, updates, empty input, caller's list untouched, partial last block, randomized check against brute force) |

## API

| Member | Description | Time |
|--------|-------------|------|
| `SqrtDecomposition(arr)` | copies `arr`, block size `max(1, ceil(sqrt(n)))`, builds block sums | O(n) |
| `update(index, value)` | sets `arr[index]` to `value` | O(1) |
| `query(left, right)` | sum of `arr[left..right]`, inclusive | O(sqrt n) |
| `arr`, `blocks`, `block_size`, `block_count` | the stored state | |

## Python-Specific Notes

- The constructor copies the list, so `update` never changes the caller's list.
- Python integers do not overflow.
- Indices are not validated.

## How to Run

```bash
python3 -m unittest square_root_decomposition_test
python3 square_root_decomposition.py
```

## Key Takeaways

- Point update O(1), range sum O(sqrt n).
- Only sums are implemented; no range updates.
