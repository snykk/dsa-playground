# Fibonacci Heap -- Go Implementation

Lazy forest of heap-ordered trees with a circular root list. See the [topic README](../README.md) for the theory.

## Files

- `main.go`: `FibonacciHeap` plus a small `main` demo
- `main_test.go`: tests, including 2000 random keys and the empty-heap panics
- `go.mod`: module `fibonacci_heap`

## API

- `NewFibonacciHeap() *FibonacciHeap`
- `Insert(key int)`
- `ExtractMin() int`: panics when empty
- `Peek() int`: panics when empty
- `Size() int`, `IsEmpty() bool`, `Clear()` (O(1))

None of the three versions has `decrease_key`, `delete` or `merge`; the `marked` flag is stored but unused.

## Go-Specific Notes

Keys are `int`. The degree table is a `map[int]*FibonacciHeapNode`. The garbage collector frees nodes, so `Clear()` just resets the root.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- Insert is a list splice; `extract_min` consolidates equal-degree trees.
- This is the lazy core, not a complete Fibonacci heap (no decrease-key).
- Empty-heap reads are errors, not sentinel values.
