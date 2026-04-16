# Maximum Subarray - Kadane's Algorithm (C++)

C++ implementation of Kadane's Algorithm to find the maximum sum of a contiguous subarray in linear time.

## Files

| File | Description |
|------|-------------|
| `kadane.cpp` | Main implementation of Kadane's Algorithm |
| `kadane_test.cpp` | Test cases for maximum subarray computation |

## How to Run

```bash
g++ -std=c++17 -DTESTING -o test kadane_test.cpp
./test
```

## Key Functions

| Function | Description | Time Complexity |
|----------|-------------|-----------------|
| `kadaneAlgorithm(arr)` | Finds the maximum sum of any contiguous subarray | O(n) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(n) single pass through the array |
| Space | O(1) only two tracking variables used |

## Notes

- Maintains `currentSum` (best sum ending at current position) and `maxSum` (global best).
- At each step, decides whether to extend the current subarray or start fresh: `max(arr[i], currentSum + arr[i])`.
- Handles all-negative arrays correctly by initializing both sums to `arr[0]`.
- Returns 0 for empty arrays as an edge case.

---

_Last Updated: April 2026_
