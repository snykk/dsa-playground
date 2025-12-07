# Ternary Search (Go)

**Ternary Search** is a divide-and-conquer algorithm that finds the position of a target value in a sorted array by dividing the search space into three parts.

---

## Overview

Ternary Search divides the search space into three equal parts. While it has the same asymptotic complexity as Binary Search, it typically performs more comparisons per iteration.

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(1) | O(1) |
| **Average Case** | O(log₃ n) | O(1) |
| **Worst Case** | O(log₃ n) | O(1) |

---

## Usage

```go
arr := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
index := TernarySearch(arr, 5)
// index = 4
```

---

## Testing

```bash
go test
```

---

## Related Algorithms

- **Binary Search**: O(log₂ n) for sorted arrays
- **Linear Search**: O(n) for unsorted arrays

---

_Last Updated: December 2025_

