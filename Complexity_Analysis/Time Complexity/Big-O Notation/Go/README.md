# Big-O Notation (Go)

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
```go
func ConstantTimeExample(n int) int {
    return 42  // Always takes the same time
}
```

### O(log n) - Logarithmic Time
```go
func LogarithmicTimeExample(n int) int {
    count := 0
    i := n
    for i > 1 {
        i = i / 2
        count++
    }
    return count
}
```

### O(n) - Linear Time
```go
func LinearTimeExample(arr []int) int {
    total := 0
    for _, element := range arr {
        total += element
    }
    return total
}
```

### O(n log n) - Linearithmic Time
```go
func LinearithmicTimeExample(arr []int) []int {
    result := make([]int, len(arr))
    copy(result, arr)
    sort.Ints(result)  // O(n log n)
    return result
}
```

### O(n²) - Quadratic Time
```go
func QuadraticTimeExample(arr []int) [][2]int {
    var pairs [][2]int
    for i := 0; i < len(arr); i++ {
        for j := i + 1; j < len(arr); j++ {
            pairs = append(pairs, [2]int{arr[i], arr[j]})
        }
    }
    return pairs
}
```

---

## Usage

```bash
# Run
go run main.go

# Run tests
go test

# Build
go build -o big_o_notation main.go
./big_o_notation
```

---

## Testing

```bash
go test
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


