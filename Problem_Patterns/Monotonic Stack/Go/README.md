# Monotonic Stack - Go

This folder contains a Go implementation of the **Monotonic Stack** technique for solving next/previous greater/smaller element problems.

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
| `NextGreaterElement(arr)` | Next greater element to the right | O(n) |
| `NextSmallerElement(arr)` | Next smaller element to the right | O(n) |
| `PreviousGreaterElement(arr)` | Previous greater element to the left | O(n) |
| `PreviousSmallerElement(arr)` | Previous smaller element to the left | O(n) |
| `LargestRectangleHistogram(heights)` | Largest rectangle area in histogram | O(n) |
| `DailyTemperatures(temperatures)` | Days until warmer temperature | O(n) |
| `StockSpan(prices)` | Stock price span for each day | O(n) |

---

## Usage

```go
package main

import "fmt"

func main() {
    // Next Greater Element
    arr := []int{4, 5, 2, 10, 8}
    result := NextGreaterElement(arr)  // Returns [5, 10, 10, -1, -1]

    // Largest Rectangle in Histogram
    heights := []int{2, 1, 5, 6, 2, 3}
    area := LargestRectangleHistogram(heights)  // Returns 10
}
```

---

## Running Tests

```bash
go test ./...
```

---

_Last Updated: April 2026_
