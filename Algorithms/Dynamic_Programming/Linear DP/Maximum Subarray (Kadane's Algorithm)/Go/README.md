# Maximum Subarray - Kadane's Algorithm (Go)

Go implementation of Kadane's Algorithm to find the maximum sum of a contiguous subarray in linear time.

## Files

| File | Description |
|------|-------------|
| `main.go` | Main implementation of Kadane's Algorithm |
| `main_test.go` | Test cases for maximum subarray computation |
| `go.mod` | Go module definition (`kadane`) |

## How to Run

```bash
go test ./...
```

## Key Functions

| Function | Description | Time Complexity |
|----------|-------------|-----------------|
| `KadaneAlgorithm(arr []int) int` | Finds the maximum sum of any contiguous subarray | O(n) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(n) single pass through the array |
| Space | O(1) only two tracking variables used |

## Notes

- Maintains `currentSum` (best sum ending at current position) and `maxSum` (global best).
- Resets `currentSum` to the current element when it drops below zero; otherwise extends.
- Handles all-negative arrays correctly by initializing both sums to `arr[0]`.
- Returns 0 for empty arrays as an edge case.

---

_Last Updated: April 2026_
