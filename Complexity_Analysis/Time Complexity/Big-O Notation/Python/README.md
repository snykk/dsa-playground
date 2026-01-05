# Big-O Notation (Python)

**Big-O Notation** describes the upper bound of an algorithm's time complexity, representing the worst-case scenario for how runtime grows with input size.

---

## Overview

Big-O notation is used to classify algorithms according to how their runtime or space requirements grow as the input size increases. It provides an asymptotic upper bound.

---

## Formal Definition

f(n) = O(g(n)) if there exist positive constants c and n₀ such that:
```
0 ≤ f(n) ≤ c·g(n) for all n ≥ n₀
```

This means that for sufficiently large n, f(n) is bounded above by a constant multiple of g(n).

---

## Common Big-O Complexities

| Notation | Name | Description | Example |
|----------|------|-------------|---------|
| **O(1)** | Constant | Time doesn't depend on input size | Array access, hash table lookup |
| **O(log n)** | Logarithmic | Time grows logarithmically | Binary search, balanced tree operations |
| **O(n)** | Linear | Time grows linearly with input | Single loop, array traversal |
| **O(n log n)** | Linearithmic | Time grows as n times log n | Merge sort, heap sort |
| **O(n²)** | Quadratic | Time grows quadratically | Nested loops, bubble sort |
| **O(n³)** | Cubic | Time grows cubically | Triple nested loops, naive matrix multiplication |
| **O(2ⁿ)** | Exponential | Time grows exponentially | Naive recursive Fibonacci, subset generation |
| **O(n!)** | Factorial | Time grows factorially | Generating all permutations, brute-force solutions |

---

## Complexity Comparison

```
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!)
```

---

## Examples

### O(1) - Constant Time
```python
def constant_time_example(n):
    return 42  # Always takes the same time
```

### O(log n) - Logarithmic Time
```python
def logarithmic_time_example(n):
    count = 0
    i = n
    while i > 1:
        i = i // 2
        count += 1
    return count
```

### O(n) - Linear Time
```python
def linear_time_example(arr):
    total = 0
    for element in arr:
        total += element
    return total
```

### O(n log n) - Linearithmic Time
```python
def linearithmic_time_example(arr):
    # Merge sort implementation
    # ...
```

### O(n²) - Quadratic Time
```python
def quadratic_time_example(arr):
    pairs = []
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            pairs.append((arr[i], arr[j]))
    return pairs
```

---

## Usage

```python
from big_o_notation import (
    constant_time_example,
    logarithmic_time_example,
    linear_time_example,
    linearithmic_time_example,
    quadratic_time_example,
    cubic_time_example,
    exponential_time_example,
    factorial_time_example
)

# Run examples
python big_o_notation.py
```

---

## Testing

```bash
python big_o_notation_test.py
```

---

## Key Points

1. **Upper Bound**: Big-O describes the worst-case scenario
2. **Asymptotic**: Focuses on behavior as n approaches infinity
3. **Constants Ignored**: O(2n) = O(n), constants are dropped
4. **Lower Terms Ignored**: O(n² + n) = O(n²), lower order terms are dropped
5. **Multiplicative Constants**: O(5n) = O(n), constants are ignored

---

## Related Topics

- **Big-Theta (Θ)**: Tight bound (both upper and lower)
- **Big-Omega (Ω)**: Lower bound
- **Space Complexity**: Memory usage analysis

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena


