# Big-Theta (Θ) Notation (Python)

**Big-Theta (Θ) Notation** describes a tight bound on an algorithm's time complexity, representing both the upper and lower bounds.

---

## Overview

Big-Theta notation provides a tight bound, meaning the algorithm's growth rate is bounded both above and below by the same function. This is stronger than Big-O (which only provides an upper bound).

---

## Formal Definition

f(n) = Θ(g(n)) if there exist positive constants c₁, c₂, and n₀ such that:
```
0 ≤ c₁·g(n) ≤ f(n) ≤ c₂·g(n) for all n ≥ n₀
```

This means f(n) is bounded both above and below by g(n).

---

## Key Characteristics

1. **Tight Bound**: Both upper and lower bounds are the same
2. **All Cases**: Best, average, and worst cases have the same complexity
3. **Precise**: More informative than Big-O when applicable

---

## When to Use Big-Theta

Use Big-Theta when:
- Best case = Average case = Worst case
- You want to express the exact growth rate
- The algorithm's performance is consistent

**Example**: Merge sort is Θ(n log n) because it always requires n log n operations regardless of input.

---

## When NOT to Use Big-Theta

Don't use Big-Theta when:
- Best case ≠ Worst case
- You only know the upper bound

**Example**: Quick sort is O(n log n) average but O(n²) worst case, so we cannot say it's Θ(n log n).

---

## Common Big-Theta Complexities

| Notation | Description | Example |
|----------|-------------|---------|
| **Θ(1)** | Constant time | Array access |
| **Θ(log n)** | Logarithmic | Binary search |
| **Θ(n)** | Linear | Summing array elements |
| **Θ(n log n)** | Linearithmic | Merge sort, heap sort |
| **Θ(n²)** | Quadratic | Selection sort |
| **Θ(n³)** | Cubic | Naive matrix multiplication |

---

## Examples

### Θ(n) - Linear Tight Bound
```python
def tight_bound_example(arr):
    total = 0
    for element in arr:
        total += element
    return total
# Must process every element exactly once
```

### Θ(log n) - Logarithmic Tight Bound
```python
def binary_search_example(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
# Always eliminates half the search space
```

### Θ(n log n) - Linearithmic Tight Bound
```python
def merge_sort_example(arr):
    # Merge sort implementation
    # Always requires n log n operations
```

---

## Big-O vs Big-Theta

| Aspect | Big-O (O) | Big-Theta (Θ) |
|--------|-----------|----------------|
| **Bound** | Upper bound only | Tight bound (upper + lower) |
| **Use Case** | Worst case analysis | Exact growth rate |
| **Example** | Quick sort: O(n²) worst | Merge sort: Θ(n log n) |
| **Precision** | Less precise | More precise |

---

## Usage

```python
from big_theta import (
    tight_bound_example,
    merge_sort_example,
    binary_search_example,
    matrix_multiplication_naive
)

# Run examples
python big_theta.py
```

---

## Testing

```bash
python big_theta_test.py
```

---

## Related Topics

- **Big-O (O)**: Upper bound notation
- **Big-Omega (Ω)**: Lower bound notation
- **Space Complexity**: Memory usage analysis

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena


