# Climbing Stairs -- Python Implementation

Five ways to count the climbs, including arbitrary step sizes.

## Files

| File | Contents |
|------|----------|
| `climbing_stairs.py` | the functions below |
| `climbing_stairs_test.py` | `unittest` cases |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `climbing_stairs_naive(n)` | plain recursion, steps 1 and 2 | O(2^n) | O(n) |
| `climbing_stairs_memoization(n, memo=None)` | top-down with a dictionary | O(n) | O(n) |
| `climbing_stairs_tabulation(n)` | bottom-up table | O(n) | O(n) |
| `climbing_stairs_optimized(n)` | two variables | O(n) | O(1) |
| `climbing_stairs_variable_steps(n, steps)` | ordered ways with the given step sizes | O(n * k) | O(n) |

All raise `ValueError` for a negative `n`, and all return 1 for `n = 0`.

```python
from climbing_stairs import climbing_stairs_optimized, climbing_stairs_variable_steps

print(climbing_stairs_optimized(5))                    # 8
print(climbing_stairs_variable_steps(5, [1, 2, 3]))    # 13
```

## Python-Specific Notes

- Integers are unbounded, so there is no overflow.
- With steps `[1, 2]` every function returns `F(n + 1)`; the tests compare all five for `n = 0..20`.
- `climbing_stairs_variable_steps` counts ordered sequences (stairs in the outer loop) and expects positive step sizes.
- The memoized version recurses `n` deep, so it hits the recursion limit near `n = 1000`.

## How to Run

From this folder:

```bash
python3 -m unittest climbing_stairs_test
```

## Key Takeaways

- `ways(0) = 1` is the base case that makes the recurrence work.
- The classic problem is a shifted Fibonacci sequence.
- Order matters: stairs outside, steps inside.
