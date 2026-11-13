# Static Size Array Stack -- Go Implementation

A LIFO stack of `int` with a fixed capacity. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `main.go` | the `ArrayStack` type, `DefaultCapacity` and a small `main` demo |
| `main_test.go` | tests for basic behaviour, overflow, invalid capacity, empty errors and the default capacity |
| `go.mod` | module definition |

## API

| Function | Description | Time |
| --- | --- | --- |
| `NewStack() *ArrayStack` | a stack with `DefaultCapacity` (100) | O(capacity) |
| `NewArrayStack(capacity int) (*ArrayStack, error)` | a stack with the given capacity; error if `capacity < 1` | O(capacity) |
| `Push(value int) error` | add on top; error ("stack overflow") when full | O(1) |
| `Pop() (int, error)` | remove and return the top; error if empty | O(1) |
| `Peek() (int, error)` | return the top; error if empty | O(1) |
| `IsEmpty()`, `Size()` | state queries | O(1) |

## Go-Specific Notes

- The backing slice is `make([]int, 0, capacity)` and `Push` checks `len(data) == capacity` before `append`, so the array is never reallocated.
- `Push` returns an error: check it, because a dropped error silently loses the item.
- `Pop` and `Peek` return `(int, error)`: `fmt.Println(s.Peek())` prints the value and `<nil>`.
- `Pop` reslices and does not clear the slot; the next `Push` overwrites it.

## How to Run

```bash
cd "Data_Structures/Linear/Stack/Static_Array_Stack/Go"
go test ./...
go run main.go
```

## Key Takeaways

- Capacity plus a length check turns a slice into a bounded stack.
- Always handle the error from `Push`.
