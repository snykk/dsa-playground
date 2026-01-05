# Big-O Notation

A comprehensive guide to **Big-O Notation**, which describes the upper bound of an algorithm's time complexity.

---

## Overview

Big-O notation is used to classify algorithms according to how their runtime or space requirements grow as the input size increases. It provides an asymptotic upper bound, representing the worst-case scenario.

---

## Formal Definition

f(n) = O(g(n)) if there exist positive constants c and n₀ such that:
```
0 ≤ f(n) ≤ c·g(n) for all n ≥ n₀
```

This means that for sufficiently large n, f(n) is bounded above by a constant multiple of g(n).

---

## Key Characteristics

1. **Upper Bound**: Describes the worst-case scenario
2. **Asymptotic**: Focuses on behavior as n approaches infinity
3. **Constants Ignored**: O(2n) = O(n), constants are dropped
4. **Lower Terms Ignored**: O(n² + n) = O(n²), lower order terms are dropped
5. **Multiplicative Constants**: O(5n) = O(n), constants are ignored

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

## Complexity Hierarchy

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
    # Always requires n log n operations
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

## When to Use Big-O

Use Big-O notation when:
- ✅ You want to describe worst-case performance
- ✅ You need an upper bound guarantee
- ✅ Analyzing algorithm efficiency
- ✅ Comparing different algorithms

**Example**: Quick sort is O(n²) worst case, but O(n log n) average case.

---

## Big-O vs Other Notations

| Notation | Bound | Description | Example |
|----------|-------|-------------|---------|
| **O** | Upper | Worst case | Quick sort: O(n²) worst |
| **Ω** | Lower | Best case | Linear search: Ω(1) best |
| **Θ** | Tight | Best = Worst | Merge sort: Θ(n log n) all cases |

---

## Common Algorithms

| Algorithm | Time Complexity | Notes |
|-----------|-----------------|-------|
| Binary Search | O(log n) | Sorted array |
| Linear Search | O(n) | Unsorted array |
| Merge Sort | O(n log n) | All cases |
| Quick Sort | O(n log n) average, O(n²) worst | Depends on pivot |
| Bubble Sort | O(n²) | All cases |
| Hash Table Lookup | O(1) average | O(n) worst case |
| Matrix Multiplication (naive) | O(n³) | n×n matrices |

---

## Key Points

1. **Worst-Case Analysis**: Big-O describes worst-case performance
2. **Asymptotic Behavior**: Focuses on large input sizes
3. **Practical Use**: Helps choose the right algorithm for your problem
4. **Not Always Precise**: May overestimate actual performance

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
from big_o_notation import (
    constant_time_example,
    logarithmic_time_example,
    linear_time_example
)

# Run examples
python big_o_notation.py

# Run tests
python big_o_notation_test.py
```

### C++
```bash
# Compile
g++ -std=c++11 -o big_o_notation big_o_notation.cpp

# Run
./big_o_notation

# Run tests
g++ -std=c++11 -o test big_o_notation_test.cpp
./test
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

- **[Big-Theta (Θ)](../Big-Theta%20(%CE%98)/)** - Tight bound notation
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

- Asymptotic notation properties
- Master theorem for divide-and-conquer
- Complexity analysis techniques
- Real-world algorithm complexity

---

**Happy Learning! 🚀**


