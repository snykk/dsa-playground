# Big-Omega (Ω) Notation (Python)

**Big-Omega (Ω) Notation** describes the lower bound of an algorithm's time complexity, representing the best-case scenario.

---

## Overview

Big-Omega notation provides a lower bound, meaning the algorithm's growth rate is bounded below by a function. It describes the best-case performance.

---

## Formal Definition

f(n) = Ω(g(n)) if there exist positive constants c and n₀ such that:
```
0 ≤ c·g(n) ≤ f(n) for all n ≥ n₀
```

This means f(n) is bounded below by g(n).

---

## Key Characteristics

1. **Lower Bound**: Describes the best-case scenario
2. **Minimum Performance**: Guarantees algorithm won't be faster than this
3. **Complement to Big-O**: Together they provide bounds on performance

---

## Common Big-Omega Complexities

| Notation | Description | Example |
|----------|-------------|---------|
| **Ω(1)** | Constant lower bound | Linear search (target at first) |
| **Ω(log n)** | Logarithmic lower bound | Binary search |
| **Ω(n)** | Linear lower bound | Bubble sort (already sorted) |
| **Ω(n log n)** | Linearithmic lower bound | Quick sort (balanced partition) |
| **Ω(n²)** | Quadratic lower bound | Matrix traversal |

---

## Examples

### Ω(1) - Constant Lower Bound
```python
def linear_search_best_case(arr, target):
    for i, element in enumerate(arr):
        if element == target:
            return i  # Found immediately (best case)
    return -1
# Best case: O(1), Worst case: O(n)
```

### Ω(n) - Linear Lower Bound
```python
def bubble_sort_best_case(arr):
    # Even if already sorted, must check all elements
    # Best case: Ω(n), Worst case: O(n²)
```

### Ω(n log n) - Linearithmic Lower Bound
```python
def quick_sort_best_case(arr):
    # Best case: balanced partition
    # Best case: Ω(n log n), Worst case: O(n²)
```

---

## Big-O vs Big-Omega vs Big-Theta

| Notation | Bound | Description | Example |
|----------|-------|-------------|---------|
| **O** | Upper | Worst case | Linear search: O(n) |
| **Ω** | Lower | Best case | Linear search: Ω(1) |
| **Θ** | Tight | Best = Worst | Binary search: Θ(log n) |

---

## Usage

```python
from big_omega import (
    linear_search_best_case,
    bubble_sort_best_case,
    quick_sort_best_case
)

python big_omega.py
```

---

## Testing

```bash
python big_omega_test.py
```

---

## Related Topics

- **Big-O (O)**: Upper bound notation
- **Big-Theta (Θ)**: Tight bound notation
- **Space Complexity**: Memory usage analysis

---

## References

- "Introduction to Algorithms" by CLRS
