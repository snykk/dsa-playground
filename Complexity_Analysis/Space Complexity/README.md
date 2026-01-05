# Space Complexity

A comprehensive guide to **Space Complexity** analysis, which measures the amount of memory space an algorithm uses relative to the input size.

---

## Overview

Space complexity describes how memory usage grows with input size. It includes both the space used by the input itself and any auxiliary (extra) space used by the algorithm. In most analyses, we focus on auxiliary space.

---

## Key Concepts

### Types of Space

1. **Input Space**: Space used by the input data (usually not counted)
2. **Auxiliary Space**: Extra space used by the algorithm (what we typically analyze)
3. **Total Space**: Input space + Auxiliary space

### Why Analyze Space Complexity?

- **Memory constraints**: Limited memory in embedded systems
- **Scalability**: Understanding how memory grows with input
- **Trade-offs**: Space vs time complexity trade-offs
- **Optimization**: Identifying memory bottlenecks

---

## Common Space Complexities

### 🔹 O(1) - Constant Space

Uses a fixed amount of memory regardless of input size.

**Examples**:
- In-place algorithms (swap, reverse)
- Iterative algorithms with fixed variables
- Simple calculations

**Implementation**: [Python](./Python/space_complexity.py) | [C++](./C++/space_complexity.cpp) | [Go](./Go/main.go)

```python
def constant_space_example(n):
    total = 0  # O(1) space
    for i in range(1, n + 1):
        total += i
    return total
```

---

### 🔹 O(log n) - Logarithmic Space

Memory usage grows logarithmically with input size.

**Examples**:
- Balanced recursive algorithms (binary search recursion)
- Divide-and-conquer with balanced splits
- Tree traversal with recursion depth

**Implementation**: [Python](./Python/space_complexity.py)

```python
def logarithmic_space_example(n):
    if n <= 1:
        return n
    # Recursion depth is log n
    return logarithmic_space_example(n // 2)
```

---

### 🔹 O(n) - Linear Space

Memory usage grows linearly with input size.

**Examples**:
- Arrays and lists
- Recursion stack (linear depth)
- Hash tables
- Merge sort auxiliary space

**Implementation**: [Python](./Python/space_complexity.py) | [C++](./C++/space_complexity.cpp) | [Go](./Go/main.go)

```python
def linear_space_example(n):
    result = []  # O(n) space
    for i in range(1, n + 1):
        result.append(i)
    return result
```

---

### 🔹 O(n log n) - Linearithmic Space

Memory usage grows as n times log n.

**Examples**:
- Some divide-and-conquer algorithms
- Recursive algorithms with log n depth and n work per level

---

### 🔹 O(n²) - Quadratic Space

Memory usage grows quadratically with input size.

**Examples**:
- 2D matrices (n×n)
- Adjacency matrices for graphs
- Nested data structures

**Implementation**: [Python](./Python/space_complexity.py) | [C++](./C++/space_complexity.cpp) | [Go](./Go/main.go)

```python
def quadratic_space_example(n):
    matrix = []  # O(n²) space
    for i in range(n):
        row = [0] * n
        matrix.append(row)
    return matrix
```

---

## Space Complexity Hierarchy

```
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ)
```

---

## Common Algorithms Space Complexity

| Algorithm | Time Complexity | Space Complexity | Notes |
|-----------|----------------|------------------|-------|
| Binary Search | O(log n) | O(1) | Iterative |
| Binary Search | O(log n) | O(log n) | Recursive |
| Merge Sort | O(n log n) | O(n) | Auxiliary array |
| Quick Sort | O(n log n) | O(log n) | Recursion stack |
| Heap Sort | O(n log n) | O(1) | In-place |
| Bubble Sort | O(n²) | O(1) | In-place |
| DFS (Graph) | O(V + E) | O(V) | Visited array + stack |
| BFS (Graph) | O(V + E) | O(V) | Queue + visited array |

---

## Space-Time Trade-offs

### Trading Space for Time

- **Hash Tables**: O(n) space for O(1) average lookup
- **Memoization**: O(n) space to avoid recomputation
- **Lookup Tables**: Precomputed values for faster access

### Trading Time for Space

- **In-place Algorithms**: O(1) space but may be slower
- **Iterative vs Recursive**: Iterative uses less stack space
- **Streaming Algorithms**: Process data in chunks to reduce memory

---

## In-Place Algorithms

Algorithms that use O(1) auxiliary space are called **in-place** algorithms.

**Examples**:
- In-place array reversal
- In-place sorting (heap sort, bubble sort)
- In-place matrix transpose

**Implementation**: [Python](./Python/space_complexity.py) | [C++](./C++/space_complexity.cpp) | [Go](./Go/main.go)

```python
def in_place_reverse(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
    return arr  # O(1) space
```

---

## Recursion and Space

### Recursion Stack Space

Recursive algorithms use stack space proportional to recursion depth:

- **Linear recursion**: O(n) space (e.g., factorial)
- **Binary recursion**: O(log n) space (e.g., binary search)
- **Exponential recursion**: O(n) space (e.g., naive Fibonacci)

### Converting to Iterative

Many recursive algorithms can be converted to iterative to reduce space:

```python
# Recursive: O(n) space
def factorial_recursive(n):
    if n <= 1:
        return 1
    return n * factorial_recursive(n - 1)

# Iterative: O(1) space
def factorial_iterative(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result
```

---

## Key Concepts

### 1. Auxiliary vs Total Space
- **Auxiliary space**: Extra space (what we analyze)
- **Total space**: Input + Auxiliary space
- **Convention**: Usually analyze auxiliary space

### 2. Space Complexity Rules
- Constants are ignored: O(5n) = O(n)
- Lower-order terms ignored: O(n² + n) = O(n²)
- Focus on dominant term

### 3. When Space Matters
- **Embedded systems**: Limited memory
- **Large datasets**: Memory constraints
- **Distributed systems**: Network bandwidth
- **Real-time systems**: Predictable memory usage

---

## Implementations

Each complexity class is implemented in:
- **Python** - Readable examples with explanations
- **C++** - High-performance implementations
- **Go** - Modern and efficient code

---

## Usage Examples

### Python
```python
from space_complexity import (
    constant_space_example,
    linear_space_example,
    quadratic_space_example,
    in_place_reverse
)

# O(1) space
result = constant_space_example(100)

# O(n) space
arr = linear_space_example(10)

# O(n²) space
matrix = quadratic_space_example(5)

# O(1) in-place
arr = [1, 2, 3, 4, 5]
in_place_reverse(arr)
```

### C++
```cpp
#include "space_complexity.cpp"

// O(1) space
int result = constantSpaceExample(100);

// O(n) space
vector<int> arr = linearSpaceExample(10);

// O(1) in-place
vector<int> test = {1, 2, 3, 4, 5};
inPlaceReverse(test);
```

### Go
```go
// O(1) space
result := ConstantSpaceExample(100)

// O(n) space
arr := LinearSpaceExample(10)

// O(1) in-place
test := []int{1, 2, 3, 4, 5}
InPlaceReverse(test)
```

---

## Testing

All implementations include comprehensive test suites:

```bash
# Python
python space_complexity_test.py

# C++
g++ -std=c++11 -o test space_complexity.cpp
./test

# Go
go test
```

---

## Related Topics

- **[Time Complexity](../Time%20Complexity/)** - Runtime analysis
- **[Amortized Analysis](../Amortized%20Analysis/)** - Average-case analysis
- **[Big-O Notation](../Time%20Complexity/Big-O%20Notation/)** - Upper bound analysis

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena
- "Data Structures and Algorithms in Python" by Goodrich, Tamassia, Goldwasser

---

## Further Reading

- Memory-efficient algorithms
- Streaming algorithms
- Space-optimized data structures
- Cache-aware algorithms

---

**Happy Learning! 🚀**


