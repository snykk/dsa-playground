# Fibonacci Numbers -- Python Implementation

Six ways to compute Fibonacci numbers, from naive recursion to matrix powers.

## Files

| File | Contents |
|------|----------|
| `fibonacci.py` | the functions below |
| `fibonacci_test.py` | `unittest` cases |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `fibonacci_naive(n)` | plain recursion | O(2^n) | O(n) |
| `fibonacci_memoization(n, memo=None)` | top-down with a dictionary | O(n) | O(n) |
| `fibonacci_tabulation(n)` | bottom-up table | O(n) | O(n) |
| `fibonacci_optimized(n)` | two variables | O(n) | O(1) |
| `fibonacci_matrix(n)` | `[[1,1],[1,0]]^n` by recursive squaring | O(log n) multiplications | O(log n) stack |
| `fibonacci_sequence(n)` | list of the first `n` Fibonacci numbers (empty for `n <= 0`) | O(n) | O(n) |

```python
from fibonacci import fibonacci_optimized, fibonacci_sequence

print(fibonacci_optimized(10))   # 55
print(fibonacci_sequence(8))     # [0, 1, 1, 2, 3, 5, 8, 13]
```

Every function except `fibonacci_sequence` raises `ValueError` for a negative `n`.

## Python-Specific Notes

- Integers are unbounded, so there is no overflow: `fibonacci_optimized(100)` is 354224848179261915075.
- `fibonacci_memoization` creates its dictionary inside the call (`memo=None`), avoiding the shared mutable default argument trap, but it recurses `n` deep and fails with `RecursionError` at about `n = 1000`.
- `fibonacci_matrix` is recursive too, but its depth is at most about `2 log2 n`.

## How to Run

From this folder:

```bash
python3 -m unittest fibonacci_test
```

## Key Takeaways

- Memoization and tabulation turn an exponential recurrence into a linear one.
- Two variables are enough because each term needs only the previous two.
- Recursive versions are bounded by Python's recursion limit.
