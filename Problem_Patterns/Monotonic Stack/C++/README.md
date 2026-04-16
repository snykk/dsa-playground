# Monotonic Stack - C++

This folder contains a C++ implementation of the **Monotonic Stack** technique for solving next/previous greater/smaller element problems.

---

## Concept

A monotonic stack maintains elements in either increasing or decreasing order. When processing a new element that violates the invariant, elements are popped until order is restored. Each popped element receives its answer from the current element.

**Key Features:**
- O(n) time complexity (each element pushed/popped at most once)
- O(n) space complexity
- Solves next/previous greater/smaller element problems efficiently
- Useful for histogram and span problems

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `nextGreaterElement(arr)` | Next greater element to the right | O(n) |
| `nextSmallerElement(arr)` | Next smaller element to the right | O(n) |
| `previousGreaterElement(arr)` | Previous greater element to the left | O(n) |
| `previousSmallerElement(arr)` | Previous smaller element to the left | O(n) |
| `largestRectangleHistogram(heights)` | Largest rectangle area in histogram | O(n) |
| `dailyTemperatures(temperatures)` | Days until warmer temperature | O(n) |
| `stockSpan(prices)` | Stock price span for each day | O(n) |

---

## Usage

```cpp
#include "monotonic_stack.cpp"

// Next Greater Element
vector<int> arr = {4, 5, 2, 10, 8};
vector<int> result = nextGreaterElement(arr);  // Returns {5, 10, 10, -1, -1}

// Largest Rectangle in Histogram
vector<int> heights = {2, 1, 5, 6, 2, 3};
int area = largestRectangleHistogram(heights);  // Returns 10
```

---

## Compilation

```bash
g++ -std=c++17 -DTESTING -o monotonic_stack_test monotonic_stack_test.cpp
./monotonic_stack_test
```

---

## Examples

1. **Next Greater Element**: Find next greater element to the right
   - Array: [4, 5, 2, 10, 8]
   - Result: [5, 10, 10, -1, -1]

2. **Largest Rectangle**: Find largest rectangle in histogram
   - Heights: [2, 1, 5, 6, 2, 3]
   - Result: 10

3. **Stock Span**: Find consecutive days with price <= current
   - Prices: [100, 80, 60, 70, 60, 75, 85]
   - Result: [1, 1, 1, 2, 1, 4, 6]

---

_Last Updated: April 2026_
