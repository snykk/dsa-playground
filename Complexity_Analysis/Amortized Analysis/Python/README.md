# Amortized Analysis (Python)

**Amortized Analysis** provides the average performance of each operation in the worst case over a sequence of operations.

---

## Overview

Unlike worst-case analysis which considers each operation in isolation, amortized analysis considers the cost of a sequence of operations. It shows that even if some operations are expensive, the average cost per operation is small.

---

## Methods of Amortized Analysis

### 1. Aggregate Method
Calculate total cost of n operations, then divide by n.

**Example**: Dynamic array with n append operations
- Total cost: O(n) for appends + O(n) for resizing = O(n)
- Amortized cost: O(n) / n = O(1) per operation

### 2. Accounting Method
Assign credits to cheap operations, use credits to pay for expensive operations.

**Example**: Dynamic array
- Cheap append: Charge 3 credits, use 1, save 2
- Expensive append (resize): Use saved credits

### 3. Potential Method
Use potential function to measure "stored energy" that can pay for future expensive operations.

**Example**: Dynamic array
- Potential = 2 * size - capacity
- When potential is high, resize is "paid for"

---

## Common Examples

### Dynamic Array
- **Worst case**: O(n) per append (when resizing)
- **Amortized**: O(1) per append
- **Explanation**: Resizing happens infrequently, cost is spread over many operations

### Binary Counter
- **Worst case**: O(log n) per increment (when all bits flip)
- **Amortized**: O(1) per increment
- **Explanation**: Total bit flips for n increments is O(n)

### Splay Tree
- **Worst case**: O(n) per operation
- **Amortized**: O(log n) per operation
- **Explanation**: Expensive operations reorganize tree for future efficiency

---

## Examples

### Dynamic Array
```python
class DynamicArray:
    def append(self, value):
        if self.size >= self.capacity:
            self._resize()  # O(n) operation
        # ... append logic
    # Amortized: O(1) per append
```

### Binary Counter
```python
class BinaryCounter:
    def increment(self):
        # May flip many bits (O(log n))
        # But amortized: O(1) per increment
```

---

## Usage

```python
from amortized_analysis import DynamicArray, BinaryCounter

# Dynamic array example
arr = DynamicArray()
for i in range(10):
    arr.append(i)  # Amortized O(1)

# Binary counter example
counter = BinaryCounter()
for i in range(10):
    counter.increment()  # Amortized O(1)
```

---

## Testing

```bash
python amortized_analysis_test.py
```

---

## Key Insights

1. **Sequence matters**: Amortized analysis considers sequences of operations
2. **Expensive operations are rare**: They're "paid for" by cheap ones
3. **Average guarantee**: Provides average performance guarantee
4. **Practical importance**: Many data structures rely on amortized analysis

---

## Related Topics

- **Time Complexity**: Worst-case analysis
- **Space Complexity**: Memory usage analysis
- **Big-O Notation**: Upper bound analysis

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena


