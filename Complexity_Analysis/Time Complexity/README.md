# Time Complexity

A comprehensive guide to **Time Complexity** analysis, including Big-O, Big-Theta, and Big-Omega notations.

---

## Overview

Time complexity describes how the runtime of an algorithm grows with input size. This folder contains implementations and explanations of the three main asymptotic notations used in complexity analysis.

---

## Topics

### 🔹 [Big-O Notation (O)](./Big-O%20Notation/)

**Upper bound** of algorithm's time complexity - represents the **worst-case scenario**.

- O(1) - Constant time
- O(log n) - Logarithmic time
- O(n) - Linear time
- O(n log n) - Linearithmic time
- O(n²) - Quadratic time
- O(n³) - Cubic time
- O(2ⁿ) - Exponential time
- O(n!) - Factorial time

**Use when**: You want to describe the worst-case performance.

---

### 🔹 [Big-Theta Notation (Θ)](./Big-Theta%20(%CE%98)/)

**Tight bound** on algorithm's time complexity - represents **both upper and lower bounds**.

- Θ(1) - Constant time (tight)
- Θ(log n) - Logarithmic time (tight)
- Θ(n) - Linear time (tight)
- Θ(n log n) - Linearithmic time (tight)
- Θ(n²) - Quadratic time (tight)

**Use when**: Best case = Average case = Worst case (e.g., merge sort, binary search).

---

### 🔹 [Big-Omega Notation (Ω)](./Big-Omega%20(%CE%A9)/)

**Lower bound** of algorithm's time complexity - represents the **best-case scenario**.

- Ω(1) - Constant lower bound
- Ω(log n) - Logarithmic lower bound
- Ω(n) - Linear lower bound
- Ω(n log n) - Linearithmic lower bound
- Ω(n²) - Quadratic lower bound

**Use when**: You want to describe the best-case performance or prove a lower bound.

---

## Notation Comparison

| Notation | Bound | Description | Example |
|----------|-------|-------------|---------|
| **O** | Upper | Worst case | Quick sort: O(n²) worst case |
| **Ω** | Lower | Best case | Linear search: Ω(1) best case |
| **Θ** | Tight | Best = Worst | Merge sort: Θ(n log n) all cases |

---

## Complexity Hierarchy

```
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!)
```

---

## Common Algorithms

| Algorithm | Best Case | Average Case | Worst Case |
|-----------|-----------|--------------|------------|
| Binary Search | O(1) | O(log n) | O(log n) → Θ(log n) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) → Θ(n log n) |
| Quick Sort | O(n log n) | O(n log n) | O(n²) |
| Bubble Sort | O(n) | O(n²) | O(n²) |
| Linear Search | O(1) | O(n) | O(n) |

---

## Key Concepts

### 1. Asymptotic Analysis
- Focuses on behavior as n → ∞
- Constants are ignored: O(5n) = O(n)
- Lower-order terms are ignored: O(n² + n) = O(n²)

### 2. Best, Average, Worst Case
- **Best case**: Minimum time required
- **Average case**: Expected time for random input
- **Worst case**: Maximum time required

### 3. When to Use Each Notation
- **Big-O**: General analysis, worst-case guarantee
- **Big-Theta**: When you know the exact growth rate
- **Big-Omega**: When you need a lower bound guarantee

---

## Implementations

Each notation is implemented in:
- **Python** - Readable and educational
- **C++** - High performance
- **Go** - Modern and efficient

---

## Related Topics

- **[Space Complexity](../Space%20Complexity/)** - Memory usage analysis
- **[Amortized Analysis](../Amortized%20Analysis/)** - Average-case analysis over sequences

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena

---

**Happy Learning! 🚀**


