# Amortized Analysis

A comprehensive guide to **Amortized Analysis**, which provides the average performance of each operation in the worst case over a sequence of operations.

---

## Overview

Amortized analysis is a method for analyzing the average performance of algorithms over a sequence of operations. Unlike worst-case analysis which considers each operation in isolation, amortized analysis shows that even if some operations are expensive, the average cost per operation is small.

---

## Key Concepts

### Why Amortized Analysis?

Some operations may be expensive (e.g., O(n)) but happen infrequently. When averaged over many operations, the cost per operation becomes much lower (e.g., O(1)).

**Example**: Dynamic array append
- Individual append: O(1) when no resize needed
- Resize operation: O(n) when array is full
- **Amortized cost**: O(1) per append operation

---

## Methods of Amortized Analysis

### 🔹 [Aggregate Method](./Python/amortized_analysis.py)

Calculate the total cost of n operations, then divide by n to get the average cost per operation.

**Steps**:
1. Calculate total cost of n operations
2. Divide by n: Amortized cost = Total cost / n

**Example**: Dynamic array with n append operations
- Total cost: O(n) for appends + O(n) for resizing = O(n)
- Amortized cost: O(n) / n = **O(1)** per operation

---

### 🔹 [Accounting Method](./Python/amortized_analysis.py)

Assign "credits" to cheap operations and use them to "pay for" expensive operations.

**Steps**:
1. Charge more credits than needed for cheap operations
2. Save excess credits
3. Use saved credits to pay for expensive operations

**Example**: Dynamic array
- Cheap append (no resize): Charge 3 credits, use 1, save 2
- Expensive append (resize): Use saved credits to pay for O(n) cost
- Result: Amortized cost is O(1) per operation

---

### 🔹 [Potential Method](./Python/amortized_analysis.py)

Use a "potential function" to measure "stored energy" that can pay for future expensive operations.

**Steps**:
1. Define potential function Φ
2. Calculate amortized cost: actual_cost + ΔΦ
3. Show that amortized cost is bounded

**Example**: Dynamic array
- Potential = 2 × size - capacity
- When potential is high, resize is "paid for" by potential
- Amortized cost remains O(1)

---

## Common Examples

### 🔹 Dynamic Array

**Operation**: Append element

- **Worst case**: O(n) when resizing
- **Amortized**: O(1) per append
- **Explanation**: Resizing happens infrequently (every 2ᵏ elements), cost is spread over many operations

**Implementation**: [Python](./Python/amortized_analysis.py) | [C++](./C++/amortized_analysis.cpp) | [Go](./Go/main.go)

---

### 🔹 Binary Counter

**Operation**: Increment counter

- **Worst case**: O(log n) when all bits flip (e.g., 0111...111 → 1000...000)
- **Amortized**: O(1) per increment
- **Explanation**: Total bit flips for n increments is O(n), so average is O(1)

**Implementation**: [Python](./Python/amortized_analysis.py) | [C++](./C++/amortized_analysis.cpp) | [Go](./Go/main.go)

---

### 🔹 Splay Tree

**Operation**: Search, insert, delete

- **Worst case**: O(n) per operation
- **Amortized**: O(log n) per operation
- **Explanation**: Expensive operations reorganize tree, making future operations faster

---

## Amortized vs Worst-Case

| Aspect | Worst-Case Analysis | Amortized Analysis |
|--------|---------------------|-------------------|
| **Focus** | Each operation individually | Sequence of operations |
| **Guarantee** | Every operation is bounded | Average over sequence |
| **Use Case** | Real-time systems | General-purpose algorithms |
| **Example** | Quick sort: O(n²) worst case | Dynamic array: O(1) amortized |

---

## When to Use Amortized Analysis

Use amortized analysis when:
- ✅ Operations have varying costs
- ✅ Expensive operations are rare
- ✅ You want average-case guarantee
- ✅ Analyzing data structures with resizing/rebalancing

Don't use when:
- ❌ Every operation must be fast (real-time systems)
- ❌ You need worst-case guarantee
- ❌ Operations are independent

---

## Complexity Comparison

| Data Structure | Operation | Worst Case | Amortized |
|----------------|-----------|------------|-----------|
| Dynamic Array | Append | O(n) | O(1) |
| Dynamic Array | Access | O(1) | O(1) |
| Binary Counter | Increment | O(log n) | O(1) |
| Hash Table | Insert | O(n) | O(1) |
| Splay Tree | Search | O(n) | O(log n) |

---

## Key Insights

1. **Sequence matters**: Amortized analysis considers sequences of operations
2. **Expensive operations are rare**: They're "paid for" by cheap ones
3. **Average guarantee**: Provides average performance guarantee over sequences
4. **Practical importance**: Many data structures rely on amortized analysis

---

## Implementations

Each method is implemented in:
- **Python** - Complete examples with all three methods
- **C++** - High-performance implementations
- **Go** - Modern and efficient code

---

## Usage Examples

### Python
```python
from amortized_analysis import DynamicArray, BinaryCounter

# Dynamic array with amortized O(1) append
arr = DynamicArray()
for i in range(10):
    arr.append(i)  # Amortized O(1)

# Binary counter with amortized O(1) increment
counter = BinaryCounter()
for i in range(10):
    counter.increment()  # Amortized O(1)
```

### C++
```cpp
#include "amortized_analysis.cpp"

DynamicArray arr;
for (int i = 0; i < 10; i++) {
    arr.append(i);  // Amortized O(1)
}
```

### Go
```go
arr := NewDynamicArray(2)
for i := 0; i < 10; i++ {
    arr.Append(i)  // Amortized O(1)
}
```

---

## Testing

All implementations include comprehensive test suites:

```bash
# Python
python amortized_analysis_test.py

# C++
g++ -std=c++11 -o test amortized_analysis.cpp
./test

# Go
go test
```

---

## Related Topics

- **[Time Complexity](../Time%20Complexity/)** - Worst-case time analysis
- **[Space Complexity](../Space%20Complexity/)** - Memory usage analysis
- **[Big-O Notation](../Time%20Complexity/Big-O%20Notation/)** - Upper bound analysis

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 17)
- "Algorithm Design Manual" by Steven Skiena
- "Data Structures and Algorithms in Python" by Goodrich, Tamassia, Goldwasser

---

## Further Reading

- Amortized analysis in hash tables
- Amortized analysis in tree data structures
- Amortized analysis in graph algorithms
- Competitive programming applications

---

**Happy Learning! 🚀**


