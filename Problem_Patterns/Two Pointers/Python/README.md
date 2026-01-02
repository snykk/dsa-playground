# Two Pointers - Python

This folder contains a Python implementation of the **Two Pointers** technique for solving array and string problems efficiently.

---

## Concept

The two pointers technique uses two pointers moving through a data structure:
- **Left-Right Pointers**: Start from both ends, move towards center
- **Fast-Slow Pointers**: Move at different speeds (common in linked lists)

**Key Features:**
- Efficient O(n) or O(n²) time complexity
- O(1) space complexity typically
- Works well with sorted arrays
- Useful for pair/triplet problems

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `two_sum_sorted(arr, target)` | Find two numbers summing to target | O(n) |
| `three_sum(arr, target)` | Find all triplets summing to target | O(n²) |
| `is_palindrome(s)` | Check if string is palindrome | O(n) |
| `remove_duplicates(arr)` | Remove duplicates in-place | O(n) |
| `container_with_most_water(heights)` | Find maximum water area | O(n) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Two Sum | O(n) | O(1) |
| Three Sum | O(n²) | O(1) |
| Palindrome Check | O(n) | O(1) |
| Remove Duplicates | O(n) | O(1) |

---

## Usage

```python
from two_pointers import two_sum_sorted, is_palindrome

# Two sum in sorted array
arr = [2, 7, 11, 15]
result = two_sum_sorted(arr, 9)  # Returns [0, 1]

# Palindrome check
result = is_palindrome("racecar")  # Returns True
```

---

## Running Tests

```bash
python two_pointers_test.py
```

---

## Examples

1. **Two Sum**: Find indices of two numbers summing to target
   - Array: [2, 7, 11, 15], target = 9
   - Result: [0, 1]

2. **Three Sum**: Find all triplets summing to target
   - Array: [-1, 0, 1, 2, -1, -4], target = 0
   - Result: [[-1, -1, 2], [-1, 0, 1]]

3. **Container with Most Water**: Maximum area
   - Heights: [1, 8, 6, 2, 5, 4, 8, 3, 7]
   - Result: 49

---

_Last Updated: December 2025_

