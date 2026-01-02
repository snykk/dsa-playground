# Sliding Window - Python

This folder contains a Python implementation of the **Sliding Window** technique for solving subarray and substring problems.

---

## Concept

The sliding window technique maintains a window (subarray or substring) that slides through the array/string. It can be:
- **Fixed Size**: Window size is constant
- **Variable Size**: Window size changes based on conditions

**Key Features:**
- Efficient O(n) time complexity
- O(1) or O(k) space complexity
- Avoids redundant calculations
- Useful for substring/subarray problems

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `max_sum_subarray(arr, k)` | Maximum sum of subarray of size k | O(n) |
| `longest_substring_k_distinct(s, k)` | Longest substring with k distinct chars | O(n) |
| `min_window_substring(s, t)` | Minimum window containing all chars of t | O(\|s\| + \|t\|) |
| `longest_substring_no_repeat(s)` | Longest substring without repeating chars | O(n) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Fixed Window | O(n) | O(1) |
| Variable Window | O(n) | O(k) or O(min(n, m)) |

---

## Usage

```python
from sliding_window import max_sum_subarray, longest_substring_no_repeat

# Fixed window: Maximum sum
arr = [1, 4, 2, 10, 23, 3, 1, 0, 20]
result = max_sum_subarray(arr, 4)  # Returns 39

# Variable window: Longest substring
s = "abcabcbb"
result = longest_substring_no_repeat(s)  # Returns 3
```

---

## Running Tests

```bash
python sliding_window_test.py
```

---

## Examples

1. **Fixed Window**: Maximum sum of subarray of size k
   - Array: [1, 4, 2, 10, 23, 3, 1, 0, 20], k = 4
   - Result: 39 (subarray [2, 10, 23, 3])

2. **Variable Window**: Longest substring with k distinct characters
   - String: "eceba", k = 2
   - Result: 3 ("ece")

3. **Minimum Window**: Smallest substring containing all characters
   - Source: "ADOBECODEBANC", Target: "ABC"
   - Result: "BANC"

---

_Last Updated: December 2025_

