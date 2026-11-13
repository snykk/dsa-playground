# Monotonic Queue -- Go Implementation

Sliding window maximum and minimum with a slice as the deque. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `main.go` | `SlidingWindowMax`, `SlidingWindowMin` and a demo `main` |
| `main_test.go` | Table-driven tests |
| `go.mod` | Module definition |

## API

- `SlidingWindowMax(arr []int, k int) []int`: empty slice (not nil) for `k <= 0`, an empty array or `k > len(arr)`.
- `SlidingWindowMin(arr []int, k int) []int`

## Go-Specific Notes

- The deque is a slice of indices: pop front with `dq = dq[1:]`, pop back with `dq = dq[:len(dq)-1]`, push with `append`.
- Reslicing the front keeps the old backing array alive until the call returns, which is fine for one-shot use.
- The result slice is pre-sized with `make([]int, 0, n-k+1)`.
- The functions are stateless and safe to call from several goroutines.

## How to Run

```bash
go test ./...
go run main.go
```

## Key Takeaways

- A plain slice is enough for a deque here; `container/list` is not needed.
- Guard `k <= 0`, empty input and `k > n` once at the top.
- No Go counterpart of the Python `MonotonicDeque` class exists.
