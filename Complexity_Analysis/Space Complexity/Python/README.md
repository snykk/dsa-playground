# Space Complexity (Python)

**Space Complexity** measures the amount of memory space an algorithm uses relative to the input size.

---

## Overview

Space complexity describes how memory usage grows with input size. It includes:
1. **Auxiliary space**: Extra space used by the algorithm
2. **Input space**: Space used by the input itself (usually not counted)

---

## Common Space Complexities

| Notation | Description | Example |
|----------|-------------|---------|
| **O(1)** | Constant space | In-place algorithms, few variables |
| **O(log n)** | Logarithmic space | Balanced recursive algorithms |
| **O(n)** | Linear space | Arrays, lists, recursion stack |
| **O(n log n)** | Linearithmic space | Some divide-and-conquer algorithms |
| **O(n²)** | Quadratic space | 2D matrices, nested data structures |

---

## Examples

### O(1) - Constant Space
```python
def constant_space_example(n):
    total = 0
    for i in range(1, n + 1):
        total += i
    return total
# Only uses a few variables
```

### O(n) - Linear Space
```python
def linear_space_example(n):
    result = []
    for i in range(1, n + 1):
        result.append(i)
    return result
# Creates a list of size n
```

### O(n²) - Quadratic Space
```python
def quadratic_space_example(n):
    matrix = []
    for i in range(n):
        row = [0] * n
        matrix.append(row)
    return matrix
# Creates an n×n matrix
```

### O(log n) - Logarithmic Space
```python
def logarithmic_space_example(n):
    if n <= 1:
        return n
    return logarithmic_space_example(n // 2)
# Recursion depth is log n
```

---

## Space vs Time Trade-offs

1. **In-place algorithms**: O(1) space, may be slower
2. **Extra space**: O(n) space, often faster
3. **Recursion**: Uses stack space (O(depth))
4. **Dynamic arrays**: May use extra space for resizing

---

## Usage

```python
from space_complexity import (
    constant_space_example,
    linear_space_example,
    quadratic_space_example
)

python space_complexity.py
```

---

## Testing

```bash
python space_complexity_test.py
```

---

## Related Topics

- **Time Complexity**: Runtime analysis
- **Big-O Notation**: Upper bound analysis
- **Amortized Analysis**: Average case analysis

---

## References

- "Introduction to Algorithms" by CLRS


