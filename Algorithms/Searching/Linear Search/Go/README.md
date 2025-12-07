# Linear Search (Go)

**Linear Search** is a simple searching algorithm that sequentially checks each element in a list until a match is found or the entire list has been searched.

---

## Overview

Linear Search, also known as Sequential Search, is the simplest searching algorithm. It works by checking each element one by one from the beginning until the target is found or the end is reached.

---

## Algorithm

1. Start from the first element
2. Compare current element with target
3. If match found, return index
4. If not, move to next element
5. Repeat until end of array
6. If not found, return -1

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(1) | O(1) |
| **Average Case** | O(n) | O(1) |
| **Worst Case** | O(n) | O(1) |

**Note**: Best case O(1) occurs when target is at the first position.

---

## Implementation Details

### Functions

1. **`LinearSearch(arr []int, target int) int`**
   - Iterative implementation
   - Returns index of first occurrence
   - Returns -1 if not found

2. **`LinearSearchRecursive(arr []int, target int, index int) int`**
   - Recursive implementation
   - Uses recursion stack
   - Space complexity: O(n)

3. **`LinearSearchAllOccurrences(arr []int, target int) []int`**
   - Finds all occurrences of target
   - Returns slice of indices
   - Useful when duplicates exist

4. **`LinearSearchGeneric[T comparable](arr []T, target T) int`**
   - Generic implementation using Go generics
   - Works with any comparable type
   - Requires Go 1.18+

---

## Usage

```go
package main

import "fmt"

func main() {
    // Basic search
    arr := []int{10, 20, 30, 40, 50}
    index := LinearSearch(arr, 30)
    fmt.Println(index)  // Output: 2

    // Not found
    index = LinearSearch(arr, 25)
    fmt.Println(index)  // Output: -1

    // Recursive search
    index = LinearSearchRecursive(arr, 40, 0)
    fmt.Println(index)  // Output: 3

    // Find all occurrences
    arr = []int{10, 20, 30, 20, 40, 20}
    indices := LinearSearchAllOccurrences(arr, 20)
    fmt.Println(indices)  // Output: [1 3 5]

    // Generic search
    strArr := []string{"apple", "banana", "cherry"}
    idx := LinearSearchGeneric(strArr, "banana")
    fmt.Println(idx)  // Output: 1
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

## Advantages

1. ✅ **Simple**: Easy to understand and implement
2. ✅ **No prerequisites**: Works on any data structure
3. ✅ **No sorting required**: Works on unsorted arrays
4. ✅ **Generic**: Supports generics for type flexibility

---

## Disadvantages

1. ❌ **Slow**: O(n) time complexity
2. ❌ **Inefficient**: Must check every element in worst case
3. ❌ **Not optimal**: Better algorithms exist for sorted data

---

## When to Use

- ✅ Unsorted arrays
- ✅ Small datasets
- ✅ Simple implementation needed
- ✅ Need to find all occurrences
- ❌ Large sorted datasets (use Binary Search instead)

---

## Related Algorithms

- **Binary Search**: O(log n) for sorted arrays
- **Interpolation Search**: O(log log n) for uniformly distributed sorted arrays
- **Hash Table**: O(1) average case searching

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena

