# Big-Theta (Θ) Notation

A comprehensive guide to **Big-Theta (Θ) Notation**, which describes a tight bound on an algorithm's time complexity.

---

## Overview

Big-Theta notation provides a tight bound, meaning the algorithm's growth rate is bounded both above and below by the same function. This is stronger than Big-O (which only provides an upper bound) and is used when best case = average case = worst case.

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
4. **Stronger Statement**: If f(n) = Θ(g(n)), then f(n) = O(g(n)) and f(n) = Ω(g(n))

---

## When to Use Big-Theta

Use Big-Theta when:
- ✅ Best case = Average case = Worst case
- ✅ You want to express the exact growth rate
- ✅ The algorithm's performance is consistent
- ✅ You can prove both upper and lower bounds

**Example**: Merge sort is Θ(n log n) because it always requires n log n operations regardless of input.

---

## When NOT to Use Big-Theta

Don't use Big-Theta when:
- ❌ Best case ≠ Worst case
- ❌ You only know the upper bound
- ❌ Performance varies significantly with input

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

## Big-O vs Big-Theta vs Big-Omega

| Aspect | Big-O (O) | Big-Theta (Θ) | Big-Omega (Ω) |
|--------|-----------|---------------|---------------|
| **Bound** | Upper bound only | Tight bound (upper + lower) | Lower bound only |
| **Use Case** | Worst case analysis | Exact growth rate | Best case analysis |
| **Example** | Quick sort: O(n²) worst | Merge sort: Θ(n log n) | Linear search: Ω(1) best |
| **Precision** | Less precise | More precise | Less precise |

---

## Common Algorithms with Tight Bounds

| Algorithm | Time Complexity | Notes |
|-----------|-----------------|-------|
| Binary Search | Θ(log n) | Always eliminates half |
| Merge Sort | Θ(n log n) | All cases require n log n |
| Heap Sort | Θ(n log n) | All cases require n log n |
| Selection Sort | Θ(n²) | Always requires n² comparisons |
| Matrix Multiplication (naive) | Θ(n³) | Always requires n³ operations |

---

## Relationship Between Notations

If f(n) = Θ(g(n)), then:
- f(n) = O(g(n)) ✓ (upper bound)
- f(n) = Ω(g(n)) ✓ (lower bound)

**Example**: If merge sort is Θ(n log n), then:
- It is O(n log n) (upper bound)
- It is Ω(n log n) (lower bound)

---

## Key Points

1. **Tight Bound**: More precise than Big-O alone
2. **Consistent Performance**: All cases have same complexity
3. **Stronger Statement**: Implies both O and Ω
4. **Not Always Applicable**: Only when best = worst

---

## Implementations

This folder contains implementations in multiple languages:

- **[Python](./Python/)** - Readable and educational examples
- **[C++](./C++/)** - High-performance implementations
- **[Go](./Go/)** - Modern and efficient code

Each implementation includes:
- Complete source code with examples
- Comprehensive test suites
- Detailed documentation
- Complexity analysis

---

## Usage

### Python
```python
from big_theta import (
    tight_bound_example,
    merge_sort_example,
    binary_search_example
)

# Run examples
python big_theta.py

# Run tests
python big_theta_test.py
```

### C++
```bash
# Compile and run
g++ -std=c++11 -o big_theta big_theta.cpp
./big_theta
```

### Go
```bash
# Run
go run main.go

# Run tests
go test
```

---

## Related Topics

- **[Big-O Notation](../Big-O%20Notation/)** - Upper bound notation
- **[Big-Omega (Ω)](../Big-Omega%20(%CE%A9)/)** - Lower bound notation
- **[Space Complexity](../../Space%20Complexity/)** - Memory usage analysis
- **[Amortized Analysis](../../Amortized%20Analysis/)** - Average-case analysis

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 3)
- "Algorithm Design Manual" by Steven Skiena
- "Competitive Programming" by Steven Halim

---

## Further Reading

- Proving tight bounds
- Master theorem applications
- Complexity analysis techniques
- When to use each notation

---

**Happy Learning! 🚀**


