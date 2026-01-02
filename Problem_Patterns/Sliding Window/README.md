# Sliding Window Pattern

A **Sliding Window** is a technique for solving problems involving subarrays or substrings by maintaining a window that slides through the array/string. It's particularly useful for problems with constraints on contiguous subarrays, allowing us to optimize from O(n²) or O(n³) to O(n) time complexity.

---

## Overview

The sliding window pattern uses two pointers (left and right) to maintain a window of elements that satisfy certain conditions. The window "slides" through the data structure by moving the pointers, efficiently processing all valid subarrays or substrings.

There are two main types of sliding windows:
- **Fixed Window**: Window size remains constant (e.g., maximum sum of subarray of size k)
- **Variable Window**: Window size changes based on conditions (e.g., longest substring without repeating)

This pattern is fundamental in competitive programming and interview problems, providing elegant solutions to many substring/subarray problems.

---

## Key Characteristics

1. **Two Pointers**: Uses left and right pointers to maintain window boundaries
2. **Efficient**: Reduces time complexity from O(n²) to O(n) for many problems
3. **Contiguous**: Works with contiguous subarrays/substrings
4. **Adaptive**: Window size can be fixed or variable based on problem

---

## Operations

| Operation | Description | Time Complexity |
|-----------|-------------|----------------|
| `max_sum_subarray(arr, k)` | Maximum sum of subarray of size k | O(n) |
| `longest_substring_without_repeating(s)` | Longest substring without repeating chars | O(n) |
| `min_window_substring(s, t)` | Minimum window containing all chars of t | O(|s| + |t|) |
| `count_anagrams(s, p)` | Count anagram occurrences of p in s | O(|s| + |p|) |
| `max_consecutive_ones(arr, k)` | Max consecutive 1s after flipping k zeros | O(n) |

---

## Implementation Approaches

### 1. Fixed Window Size
- **Pros**: Simple, straightforward logic
- **Cons**: Window size must be known
- **Use Case**: Problems with fixed window size (e.g., maximum sum of size k)

### 2. Variable Window Size
- **Pros**: Flexible, adapts to conditions
- **Cons**: More complex boundary management
- **Use Case**: Problems with dynamic constraints (e.g., longest substring)

### 3. Two Pointers Technique
- **Pros**: Efficient, single pass
- **Cons**: Requires careful pointer management
- **Use Case**: Most sliding window problems

---

## Applications

1. **Maximum/Minimum Subarray**: Finding optimal subarray with constraints
2. **Longest Substring**: Finding longest substring satisfying conditions
3. **Anagram Problems**: Pattern matching with character frequency
4. **Binary Array Problems**: Flipping zeros, consecutive elements
5. **String Matching**: Minimum window, substring problems
6. **Frequency Counting**: Problems requiring frequency tracking within window

---

## Example Use Cases

### Maximum Sum Subarray (Fixed Window)
```python
arr = [1, 4, 2, 10, 23, 3, 1, 0, 20]
k = 4
result = max_sum_subarray(arr, k)  # Returns 39
```

### Longest Substring Without Repeating (Variable Window)
```python
s = "abcabcbb"
result = longest_substring_without_repeating(s)  # Returns 3
```

### Minimum Window Substring
```python
s = "ADOBECODEBANC"
t = "ABC"
result = min_window_substring(s, t)  # Returns "BANC"
```

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - List and dictionary-based implementation
- **C++** (`C++/`) - Vector and unordered_map-based implementation
- **Go** (`Go/`) - Slice and map-based implementation

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Complexity Summary

| Problem Type | Time Complexity | Space Complexity |
|--------------|----------------|------------------|
| **Fixed Window** | O(n) | O(1) |
| **Variable Window** | O(n) | O(min(n, m)) |
| **String Matching** | O(|s| + |t|) | O(|s| + |t|) |
| **Frequency Based** | O(n) | O(k) where k is charset size |

---

## When to Use

- **Contiguous Subarrays/Substrings**: Problems involving contiguous elements
- **Optimization Needed**: When need to optimize from O(n²) to O(n)
- **Window Constraints**: Problems with constraints on window size or content
- **Frequency Counting**: When need to track frequencies within a window
- **Maximum/Minimum**: Problems finding optimal subarray/substring

---

## Related Patterns

- **Two Pointers**: Often used together with sliding window
- **Hash Maps**: Used for frequency counting in windows
- **Prefix Sum**: Sometimes combined with sliding window

---

## Further Reading

- "Algorithm Design Manual" by Steven Skiena
- "Cracking the Coding Interview" by Gayle Laakmann McDowell
- LeetCode sliding window problems

---

**Note**: The sliding window pattern is most effective when the problem involves contiguous subarrays or substrings. Always verify that the problem constraints allow for a sliding window approach.

---

_Last Updated: December 2025_
