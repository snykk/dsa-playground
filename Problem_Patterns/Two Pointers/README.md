# Two Pointers Pattern

A **Two Pointers** technique uses two pointers to traverse data structures efficiently. It's commonly used for sorted arrays, linked lists, and string problems, often reducing time complexity from O(n²) to O(n) by eliminating nested loops.

---

## Overview

The two pointers pattern maintains two pointers that move through the data structure, either:
- **Opposite Ends**: Starting at opposite ends and moving toward each other
- **Same Direction**: Starting at the same end and moving in the same direction (often called "fast and slow pointers")
- **Sliding Window**: A variant where pointers maintain a window (covered in Sliding Window pattern)

This pattern is fundamental for optimizing array and string problems, providing elegant O(n) solutions where brute force would require O(n²).

---

## Key Characteristics

1. **Efficient Traversal**: Single pass through data structure
2. **Optimization**: Reduces nested loops to single pass
3. **Flexible**: Works with sorted and unsorted arrays
4. **In-Place**: Often allows in-place operations without extra space

---

## Operations

| Operation | Description | Time Complexity |
|-----------|-------------|----------------|
| `two_sum_sorted(arr, target)` | Find two numbers summing to target | O(n) |
| `three_sum(arr, target)` | Find all triplets summing to target | O(n²) |
| `is_palindrome(s)` | Check if string is palindrome | O(n) |
| `remove_duplicates(arr)` | Remove duplicates in-place | O(n) |
| `container_with_most_water(heights)` | Find maximum water area | O(n) |
| `merge_sorted_arrays(arr1, m, arr2, n)` | Merge arrays in-place | O(m + n) |

---

## Implementation Approaches

### 1. Opposite Ends (Most Common)
- **Pros**: Simple, intuitive for sorted arrays
- **Cons**: Requires sorted data
- **Use Case**: Two sum, palindrome checking, container problems

### 2. Same Direction (Fast & Slow)
- **Pros**: Works with unsorted data
- **Cons**: More complex logic
- **Use Case**: Linked list problems, removing duplicates

### 3. Sliding Window Variant
- **Pros**: Combines two pointers with window constraints
- **Cons**: More complex boundary management
- **Use Case**: Subarray/substring problems with constraints

---

## Applications

1. **Two Sum / Three Sum**: Finding pairs/triplets with target sum
2. **Palindrome Problems**: Checking or constructing palindromes
3. **Array Manipulation**: Removing duplicates, merging arrays
4. **Container Problems**: Maximum area, trapping water
5. **Linked List Problems**: Cycle detection, finding middle
6. **String Problems**: Valid palindrome, reverse string

---

## Example Use Cases

### Two Sum in Sorted Array
```python
arr = [2, 7, 11, 15]
target = 9
result = two_sum_sorted(arr, target)  # Returns (0, 1)
```

### Palindrome Check
```python
s = "racecar"
result = is_palindrome(s)  # Returns True
```

### Remove Duplicates
```python
arr = [1, 1, 2, 2, 2, 3, 4, 4, 5]
new_len = remove_duplicates(arr)  # Returns 5, arr becomes [1, 2, 3, 4, 5]
```

### Container With Most Water
```python
heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]
result = container_with_most_water(heights)  # Returns 49
```

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - List-based implementation
- **C++** (`C++/`) - Vector-based implementation
- **Go** (`Go/`) - Slice-based implementation

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Complexity Summary

| Problem Type | Time Complexity | Space Complexity |
|--------------|----------------|------------------|
| **Two Sum** | O(n) | O(1) |
| **Three Sum** | O(n²) | O(1) excluding output |
| **Palindrome** | O(n) | O(1) |
| **Remove Duplicates** | O(n) | O(1) |
| **Container** | O(n) | O(1) |
| **Merge Arrays** | O(m + n) | O(1) |

---

## When to Use

- **Sorted Arrays**: Most effective with sorted data
- **Optimization Needed**: When need to optimize from O(n²) to O(n)
- **Opposite Direction**: When need to traverse from both ends
- **In-Place Operations**: When need to modify array without extra space
- **Linked Lists**: Cycle detection, finding middle node

---

## Related Patterns

- **Sliding Window**: Similar technique with window constraints
- **Binary Search**: Sometimes combined with two pointers
- **Sorting**: Often requires sorted array as prerequisite

---

## Further Reading

- "Algorithm Design Manual" by Steven Skiena
- "Cracking the Coding Interview" by Gayle Laakmann McDowell
- LeetCode two pointers problems

---

**Note**: The two pointers pattern is most effective when working with sorted arrays or when the problem structure allows for efficient traversal from both ends. Always consider sorting as a preprocessing step if needed.

---

_Last Updated: December 2025_
