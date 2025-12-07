# Binary Search (Go)

**Binary Search** is an efficient searching algorithm that finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.

---

## Overview

Binary Search is a divide-and-conquer algorithm that works on sorted arrays. It compares the target value to the middle element and eliminates half of the search space in each iteration.

---

## Algorithm

1. Compare target with middle element
2. If match found, return index
3. If target is greater, search right half
4. If target is smaller, search left half
5. Repeat until found or search space is exhausted

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(1) | O(1) |
| **Average Case** | O(log n) | O(1) |
| **Worst Case** | O(log n) | O(1) |

**Note**: Space complexity is O(log n) for recursive version due to recursion stack.

---

## Implementation Details

### Functions

1. **`BinarySearch(arr []int, target int) int`**
   - Iterative implementation
   - O(1) space complexity
   - Returns index of target if found, -1 otherwise

2. **`BinarySearchRecursive(arr []int, target int, left int, right int) int`**
   - Recursive implementation
   - O(log n) space complexity
   - More intuitive but uses recursion stack

3. **`BinarySearchFirstOccurrence(arr []int, target int) int`**
   - Finds first occurrence in array with duplicates
   - Useful for lower bound problems

4. **`BinarySearchLastOccurrence(arr []int, target int) int`**
   - Finds last occurrence in array with duplicates
   - Useful for upper bound problems

---

## Usage

```go
package main

import "fmt"

func main() {
    // Basic search
    arr := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
    index := BinarySearch(arr, 5)
    fmt.Println(index)  // Output: 4

    // Recursive search
    index = BinarySearchRecursive(arr, 7, 0, len(arr)-1)
    fmt.Println(index)  // Output: 6

    // First occurrence (with duplicates)
    arr = []int{1, 2, 2, 2, 3, 4, 5}
    index = BinarySearchFirstOccurrence(arr, 2)
    fmt.Println(index)  // Output: 1

    // Last occurrence (with duplicates)
    index = BinarySearchLastOccurrence(arr, 2)
    fmt.Println(index)  // Output: 3
}
```

---

## Testing

Run the test suite:

```bash
go test
```

Run with verbose output:

```bash
go test -v
```

---

## Important Notes

1. **Array must be sorted**: Binary Search only works on sorted arrays
2. **Use `left + (right - left) / 2`**: Prevents integer overflow
3. **Boundary conditions**: Always check `left <= right` in loop

---

## Advantages

1. ✅ **Efficient**: O(log n) time complexity
2. ✅ **Optimal**: Best possible for comparison-based search
3. ✅ **Space efficient**: O(1) space for iterative version

---

## Disadvantages

1. ❌ **Requires sorted array**: Must sort first (O(n log n))
2. ❌ **Not suitable for unsorted data**: Use Linear Search instead

---

## When to Use

- ✅ Sorted arrays
- ✅ Large datasets
- ✅ Need guaranteed O(log n) performance
- ❌ Unsorted data

---

## Related Algorithms

- **Linear Search**: O(n) for unsorted arrays
- **Ternary Search**: O(log₃ n) for unimodal functions
- **Interpolation Search**: O(log log n) for uniformly distributed data

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 3)
- "Algorithm Design Manual" by Steven Skiena

