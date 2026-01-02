# Meet in the Middle in Python

Implementation of Meet in the Middle technique in Python3.

## Features

1.  **closest_subset_sum**: Finds largest subset sum <= target.
    - Optimized for N up to 40 (N/2 = 20 -> 2^20 operations).

## Usage

```python
from meet_in_middle import closest_subset_sum

nums = [45, 34, 4, 12, 5, 2]
target = 42

result = closest_subset_sum(nums, target)
print(result)
```

## Testing

Run the written unit tests:

```bash
python meet_in_middle_test.py
```
