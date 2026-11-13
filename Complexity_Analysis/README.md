# Complexity Analysis

A comprehensive guide to **Complexity Analysis** including time complexity, space complexity, and amortized analysis.

---

## Overview

This folder contains implementations and explanations of complexity analysis concepts in Python, C++, and Go. Each topic includes:
- Complete implementations with examples
- Comprehensive test suites
- Detailed documentation
- Complexity analysis

---

## Topics

### 🔹 Time Complexity

Time complexity describes how the runtime of an algorithm grows with input size.

#### **[Big-O Notation (O)](Time_Complexity/Big_O_Notation/)**
- Upper bound of algorithm's time complexity
- Represents worst-case scenario
- Examples: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ), O(n!)

#### **[Big-Theta Notation (Θ)](Time_Complexity/Big_Theta/)**
- Tight bound on algorithm's time complexity
- Represents both upper and lower bounds
- Used when best case = average case = worst case
- Examples: Θ(n), Θ(log n), Θ(n log n)

#### **[Big-Omega Notation (Ω)](Time_Complexity/Big_Omega/)**
- Lower bound of algorithm's time complexity
- Represents best-case scenario
- Examples: Ω(1), Ω(n), Ω(n log n)

---

### 🔹 Space Complexity

**[Space Complexity](Space_Complexity/)**
- Measures memory usage relative to input size
- Includes auxiliary space and input space
- Common complexities: O(1), O(log n), O(n), O(n²)
- Trade-offs between space and time

---

### 🔹 Amortized Analysis

**[Amortized Analysis](Amortized_Analysis/)**
- Average performance over a sequence of operations
- Methods: Aggregate, Accounting, Potential
- Common examples: Dynamic arrays, binary counters
- Shows that expensive operations are "paid for" by cheap ones

---

## Complexity Comparison

### Time Complexity Hierarchy
```
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!)
```

### Space Complexity Hierarchy
```
O(1) < O(log n) < O(n) < O(n log n) < O(n²)
```

---

## Notation Comparison

| Notation | Bound | Description | Use Case |
|----------|-------|-------------|----------|
| **O** | Upper | Worst case | General analysis |
| **Ω** | Lower | Best case | Lower bound guarantee |
| **Θ** | Tight | Best = Worst | Exact growth rate |

---

## Common Algorithms Complexity

| Algorithm | Time (Best) | Time (Average) | Time (Worst) | Space |
|-----------|-------------|-----------------|--------------|-------|
| Binary Search | O(1) | O(log n) | O(log n) | O(1) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) |
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) |
| Linear Search | O(1) | O(n) | O(n) | O(1) |

---

## Key Concepts

### 1. Asymptotic Analysis
- Focuses on behavior as n approaches infinity
- Constants and lower-order terms are ignored
- Example: O(5n² + 3n + 2) = O(n²)

### 2. Best, Average, Worst Case
- **Best case**: Minimum time/space required
- **Average case**: Expected time/space for random input
- **Worst case**: Maximum time/space required

### 3. Space-Time Trade-offs
- Can often reduce time complexity by using more space
- Can often reduce space complexity by using more time
- Example: Hash table (O(n) space) vs linear search (O(1) space)

### 4. Amortized vs Worst-Case
- **Worst-case**: Each operation individually
- **Amortized**: Average over sequence of operations
- Example: Dynamic array append is O(n) worst-case but O(1) amortized

---

## Usage Examples

### Python
```python
from big_o_notation import linear_time_example
from space_complexity import constant_space_example
from amortized_analysis import DynamicArray

# Time complexity
result = linear_time_example([1, 2, 3, 4, 5])

# Space complexity
result = constant_space_example(100)

# Amortized analysis
arr = DynamicArray()
arr.append(1)  # Amortized O(1)
```

### C++
```cpp
#include "big_o_notation.cpp"
#include "space_complexity.cpp"
#include "amortized_analysis.cpp"

// Compile and run examples
```

### Go
```go
import "big-o-notation"
import "space-complexity"
import "amortized-analysis"

// Run examples
```

---

## Testing

All implementations include comprehensive test suites:

```bash
# Python
python big_o_notation_test.py
python space_complexity_test.py
python amortized_analysis_test.py

# C++
g++ -std=c++11 -o test big_o_notation_test.cpp
./test

# Go
go test
```

---

## Learning Path

1. **Start with Big-O Notation**: Understand upper bounds
2. **Learn Big-Theta and Big-Omega**: Understand tight and lower bounds
3. **Study Space Complexity**: Understand memory usage
4. **Master Amortized Analysis**: Understand average-case performance

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena
- "Competitive Programming" by Steven Halim

---

## Related Topics

- [Algorithms](../Algorithms/) - Algorithm implementations with complexity analysis
- [Data Structures](../Data_Structures/) - Data structure implementations with complexity analysis
- [Problem Patterns](../Problem_Patterns/) - Common problem-solving patterns

---

**Happy Learning! 🚀**

