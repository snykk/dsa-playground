# Monotonic Stack - Python

This folder contains a Python implementation of the **Monotonic Stack** technique for solving next/previous greater/smaller element problems.

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
| `next_greater_element(arr)` | Next greater element to the right | O(n) |
| `next_smaller_element(arr)` | Next smaller element to the right | O(n) |
| `previous_greater_element(arr)` | Previous greater element to the left | O(n) |
| `previous_smaller_element(arr)` | Previous smaller element to the left | O(n) |
| `largest_rectangle_histogram(heights)` | Largest rectangle area in histogram | O(n) |
| `daily_temperatures(temperatures)` | Days until warmer temperature | O(n) |
| `stock_span(prices)` | Stock price span for each day | O(n) |

---

## Usage

```python
from monotonic_stack import next_greater_element, largest_rectangle_histogram

# Next Greater Element
arr = [4, 5, 2, 10, 8]
result = next_greater_element(arr)  # Returns [5, 10, 10, -1, -1]

# Largest Rectangle in Histogram
heights = [2, 1, 5, 6, 2, 3]
result = largest_rectangle_histogram(heights)  # Returns 10
```

---

## Running Tests

```bash
python monotonic_stack_test.py
```

---

_Last Updated: April 2026_
