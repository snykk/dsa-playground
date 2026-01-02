# Binary Search on Answer - Python

This folder contains a Python implementation of **Binary Search on Answer** technique for optimization problems.

---

## Concept

Binary Search on Answer searches for the optimal answer in the answer space rather than the input array. It's used when:
- We need to find optimal value satisfying conditions
- Answer space is monotonic (if answer X works, all answers > X work)
- Checking if an answer is valid is easier than finding the answer directly

**Key Features:**
- Efficient for optimization problems
- O(log(max_answer) * T(check)) time complexity
- Works when answer space is monotonic

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `binary_search_answer(left, right, check)` | Generic binary search on answer | O(log(max) * T(check)) |
| `find_min_capacity(weights, days)` | Minimum ship capacity | O(n log(sum)) |
| `split_array_largest_sum(nums, m)` | Minimum largest sum | O(n log(sum)) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Binary Search on Answer | O(log(max_answer) * T(check)) | O(1) |
| Find Min Capacity | O(n log(sum(weights))) | O(1) |
| Split Array | O(n log(sum(nums))) | O(1) |

---

## Usage

```python
from binary_search_on_answer import find_min_capacity

weights = [1, 2, 3, 4, 5]
result = find_min_capacity(weights, 2)  # Returns minimum capacity
```

---

## Running Tests

```bash
python binary_search_on_answer_test.py
```

---

## Examples

1. **Minimum Ship Capacity**: Find minimum capacity to ship packages
   - Weights: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days = 5
   - Result: 15

2. **Split Array**: Minimum largest sum when splitting into m subarrays
   - Array: [7, 2, 5, 10, 8], m = 2
   - Result: 18

---

_Last Updated: December 2025_

