# Monotonic Stack -- Go Implementation

Next and previous greater or smaller element, histogram, temperatures and stock span. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `main.go` | Seven exported functions and a demo `main` |
| `main_test.go` | One test function per algorithm |
| `go.mod` | Module definition |

## API

- `NextGreaterElement(arr []int) []int`, `NextSmallerElement`, `PreviousGreaterElement`, `PreviousSmallerElement`: values, `-1` if none.
- `LargestRectangleHistogram(heights []int) int`
- `DailyTemperatures(temperatures []int) []int`: days to wait, `0` if none.
- `StockSpan(prices []int) []int`

## Go-Specific Notes

- The stack is a slice of indices (`append` to push, reslice to pop).
- `int` is 64 bits on common platforms, so histogram areas rarely overflow.
- `-1` is the "no answer" value, so an input containing -1 is ambiguous.

## How to Run

```bash
go test ./...
go run main.go
```

## Key Takeaways

- A slice is all the stack you need.
- Each index is pushed and popped at most once.
- Return indices instead of values if -1 can appear in the input.
