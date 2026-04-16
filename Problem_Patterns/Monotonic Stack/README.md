# Monotonic Stack Pattern

A **Monotonic Stack** is a stack that maintains its elements in either strictly increasing or strictly decreasing order. It is a powerful technique for solving problems that require finding the next or previous greater/smaller element in an array, achieving O(n) time complexity instead of the brute-force O(n^2).

---

## Overview

The monotonic stack pattern processes elements one by one, maintaining an invariant on the stack: elements are always in monotonic (non-increasing or non-decreasing) order. When a new element violates this invariant, we pop elements from the stack until the invariant is restored, and each popped element gets its answer from the current element.

There are two main types:
- **Monotonic Increasing Stack**: Elements from bottom to top are in increasing order (used to find next smaller elements)
- **Monotonic Decreasing Stack**: Elements from bottom to top are in decreasing order (used to find next greater elements)

---

## How It Works

### Visual Example: Next Greater Element

```
Array: [4, 5, 2, 10, 8]

Step 1: Push 4         Stack: [4]
Step 2: 5 > 4, pop 4   -> NGE(4) = 5,  Push 5.  Stack: [5]
Step 3: 2 < 5, push 2  Stack: [5, 2]
Step 4: 10 > 2, pop 2  -> NGE(2) = 10
        10 > 5, pop 5  -> NGE(5) = 10, Push 10. Stack: [10]
Step 5: 8 < 10, push 8 Stack: [10, 8]
End:    pop remaining   -> NGE(10) = -1, NGE(8) = -1

Result: [5, 10, 10, -1, -1]
```

Each element is pushed and popped at most once, giving O(n) total time.

---

## Common Problem Types

| Problem | Description | Stack Type |
|---------|-------------|------------|
| Next Greater Element | Find next element to the right that is greater | Decreasing |
| Next Smaller Element | Find next element to the right that is smaller | Increasing |
| Previous Greater Element | Find previous element to the left that is greater | Decreasing |
| Previous Smaller Element | Find previous element to the left that is smaller | Increasing |
| Largest Rectangle in Histogram | Find the largest rectangular area | Increasing |
| Daily Temperatures | Days until a warmer temperature | Decreasing |
| Stock Span Problem | Consecutive days with price <= current day | Decreasing |

---

## Complexity

| Aspect | Complexity |
|--------|-----------|
| **Time** | O(n) -- each element is pushed and popped at most once |
| **Space** | O(n) -- stack can hold up to n elements |

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - List-based stack implementation
- **C++** (`C++/`) - Vector-based stack implementation
- **Go** (`Go/`) - Slice-based stack implementation

Each implementation includes:
- Complete source code with all seven functions
- Comprehensive test suite
- Detailed README with usage examples

---

## When to Use

- **Next/Previous Greater or Smaller**: Classic monotonic stack problems
- **Histogram Problems**: Finding largest rectangle areas
- **Span/Temperature Problems**: Finding distances to next significant element
- **Optimization**: Reducing O(n^2) brute-force to O(n)

---

## Related Patterns

- **Stack**: Monotonic stack is a specialized use of the stack data structure
- **Two Pointers**: Sometimes combined for range-based problems
- **Sliding Window**: Can be enhanced with monotonic structures (monotonic deque)

---

_Last Updated: April 2026_
