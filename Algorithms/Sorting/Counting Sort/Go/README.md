# Counting Sort -- Go Implementation

## Files

- `main.go`: `CountingSort`.
- `main_test.go`: tests (basic, negative numbers, too-small `maxVal`, larger-than-needed `maxVal`).
- `go.mod`: the Go module for the folder.

## API

- `CountingSort(arr []int, maxVal int) []int`: stable counting sort; returns a new slice (an empty input is returned as is). Panics if an element is larger than `maxVal`. Negative values are allowed.

```go
sorted := CountingSort([]int{4, 2, 2, 8, 3, 3, 1}, 8)
```

## Go-Specific Notes

- `maxVal` is required (Python detects it) and may be larger than the real maximum, which only wastes count slots.
- The count array has `maxVal - minVal + 1` entries. An extreme range can overflow `int` or exhaust memory.
- The input slice is not modified.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Offset by the minimum so that negative values index correctly.
- Back-to-front placement keeps equal values in input order.
