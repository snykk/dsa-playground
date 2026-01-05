# Big-O Notation (C++)

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

## Examples

### O(1) - Constant Time
```cpp
int constantTimeExample(int n) {
    return 42;  // Always takes the same time
}
```

### O(log n) - Logarithmic Time
```cpp
int logarithmicTimeExample(int n) {
    int count = 0;
    int i = n;
    while (i > 1) {
        i = i / 2;
        count++;
    }
    return count;
}
```

### O(n) - Linear Time
```cpp
int linearTimeExample(const vector<int>& arr) {
    int total = 0;
    for (int element : arr) {
        total += element;
    }
    return total;
}
```

### O(n log n) - Linearithmic Time
```cpp
vector<int> linearithmicTimeExample(vector<int> arr) {
    sort(arr.begin(), arr.end());  // O(n log n)
    return arr;
}
```

### O(n²) - Quadratic Time
```cpp
vector<pair<int, int>> quadraticTimeExample(const vector<int>& arr) {
    vector<pair<int, int>> pairs;
    for (size_t i = 0; i < arr.size(); i++) {
        for (size_t j = i + 1; j < arr.size(); j++) {
            pairs.push_back({arr[i], arr[j]});
        }
    }
    return pairs;
}
```

---

## Usage

```bash
# Compile
g++ -std=c++11 -o big_o_notation big_o_notation.cpp

# Run
./big_o_notation

# Run tests
g++ -std=c++11 -o big_o_notation_test big_o_notation_test.cpp
./big_o_notation_test
```

---

## Testing

```bash
g++ -std=c++11 -o test big_o_notation_test.cpp
./test
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


