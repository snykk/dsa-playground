# Binary Search on Answer Pattern

A **Binary Search on Answer** is a technique where we binary search on the answer space rather than the input array. This pattern is useful when we need to find the minimum or maximum value that satisfies a certain condition, and the condition function is monotonic.

---

## Overview

Unlike traditional binary search that searches for a target value in a sorted array, binary search on answer searches for the optimal answer value in a continuous or discrete answer space. The key requirement is that the condition function must be monotonic - if a value satisfies the condition, all values greater (or smaller) than it also satisfy the condition.

This pattern is particularly powerful for optimization problems where:
- We need to find minimum/maximum value satisfying constraints
- The answer space is continuous or discrete
- We can efficiently check if a candidate answer is valid
- The validity function is monotonic

---

## Key Characteristics

1. **Answer Space**: The range of possible answers (e.g., [min, max] or [0, n])
2. **Monotonic Condition**: If `condition(x)` is true, then `condition(x+1)` is also true (or vice versa)
3. **Efficient Check**: The condition function should be efficiently computable
4. **Optimization**: Reduces search space from O(n) to O(log(n))

---

## Operations

| Operation | Description | Time Complexity |
|-----------|-------------|----------------|
| `binary_search_answer(left, right, condition)` | Find minimum value satisfying condition | O(log(n) × f(n)) |
| `find_min_capacity(weights, days)` | Find minimum ship capacity | O(n × log(sum(weights))) |
| `find_kth_smallest_distance(nums, k)` | Find k-th smallest distance | O(n × log(max_distance)) |
| `split_array_largest_sum(nums, m)` | Split array with minimum largest sum | O(n × log(sum(nums))) |

Where `f(n)` is the time complexity of the condition function.

---

## Implementation Approaches

### 1. Standard Binary Search on Answer
- **Pros**: Simple, intuitive, O(log(n)) iterations
- **Cons**: Requires monotonic condition
- **Use Case**: Most optimization problems with monotonic constraints

### 2. Binary Search with Custom Condition
- **Pros**: Flexible, can handle complex conditions
- **Cons**: Condition function must be carefully designed
- **Use Case**: Problems with non-trivial validity checks

---

## Applications

1. **Capacity Problems**: Finding minimum capacity to ship packages, allocate resources
2. **Distance Problems**: Finding k-th smallest distance, maximum minimum distance
3. **Splitting Problems**: Splitting arrays/strings optimally
4. **Threshold Problems**: Finding minimum threshold satisfying constraints
5. **Optimization Problems**: Minimizing maximum or maximizing minimum values

---

## Example Use Cases

### Finding Minimum Capacity
```python
weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
days = 5
result = find_min_capacity(weights, days)
# Returns minimum ship capacity needed
```

### Finding K-th Smallest Distance
```python
nums = [1, 3, 1]
k = 1
result = find_kth_smallest_distance(nums, k)
# Returns k-th smallest distance between pairs
```

### Splitting Array
```python
nums = [7, 2, 5, 10, 8]
m = 2
result = split_array_largest_sum(nums, m)
# Returns minimum largest sum when splitting into m subarrays
```

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - List and function-based implementation
- **C++** (`C++/`) - Vector and lambda-based implementation
- **Go** (`Go/`) - Slice and function-based implementation

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Complexity Summary

| Problem Type | Time Complexity | Space Complexity | Condition Check |
|--------------|----------------|-------------------|-----------------|
| **Standard** | O(log(n) × f(n)) | O(1) | O(f(n)) |
| **Capacity** | O(n × log(sum)) | O(1) | O(n) |
| **Distance** | O(n × log(max)) | O(1) | O(n) |
| **Splitting** | O(n × log(sum)) | O(1) | O(n) |

---

## When to Use

- **Optimization Problems**: Finding minimum/maximum value satisfying constraints
- **Monotonic Conditions**: When validity function is monotonic
- **Large Answer Space**: When brute force is too slow
- **Efficient Validation**: When we can quickly check if answer is valid

---

## Related Patterns

- **Binary Search**: Searching in sorted arrays
- **Two Pointers**: Often used in condition checking
- **Greedy Algorithms**: Sometimes combined with binary search on answer

---

## Further Reading

- "Algorithm Design Manual" by Steven Skiena
- "Competitive Programming" by Halim & Halim
- LeetCode problems: Capacity to Ship Packages, Split Array Largest Sum

---

**Note**: The condition function must be monotonic for binary search on answer to work correctly. Always verify the monotonicity property before applying this pattern.

---

_Last Updated: December 2025_
