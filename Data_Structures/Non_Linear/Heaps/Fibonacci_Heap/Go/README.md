# Fibonacci Heap -- Go Implementation

A lazy forest of heap-ordered trees with a circular root list, cascading cuts and handles. See the [topic README](../README.md) for the theory.

## Files

- `main.go`: `FibonacciHeapNode` (also the handle) and `FibonacciHeap`, plus a small `main` demo
- `main_test.go`: tests: the handles, decrease-key, cascading cuts on hand-built trees, delete, merge, the script whose trees Python computed, long random runs against a sorted slice with the invariants checked, and the link and cut counts
- `go.mod`: module `fibonacci_heap`

## API

- `NewFibonacciHeap() *FibonacciHeap`
- `Insert(key int) *FibonacciHeapNode`: O(1); returns the handle
- `ExtractMin() int`: O(log n) amortized; panics when empty
- `Peek() int`: panics when empty
- `DecreaseKey(node *FibonacciHeapNode, newKey int)`: O(1) amortized; panics for a stale or nil handle, then for a larger key
- `Delete(node *FibonacciHeapNode)`: O(log n) amortized; panics for a stale or nil handle
- `Merge(other *FibonacciHeap)`: O(1); empties `other`; panics when `other` is the same heap
- `Size() int`, `IsEmpty() bool`; `Clear()`: O(n)
- `LinkCount() int`, `CutCount() int`: the work counters of the amortized analysis
- On a handle: `Key() int` (panics on nil), `InHeap() bool` (false for nil)

## Go-Specific Notes

Keys are `int`. The handle is the node pointer itself; its fields are unexported, so code outside the package reads it only through `Key` and `InHeap`. A node that leaves the heap gets `inHeap = false` and its links reset, so a stale handle keeps no other node alive, and the garbage collector frees the node once no handle refers to it.

Misuse panics, as an empty `ExtractMin` already did; the messages are the ones Python and C++ use ("stale handle: the node is no longer in a heap", "new key is greater than the current key", "cannot merge a heap with itself"). The degree table is a `map[int]*FibonacciHeapNode`, with a slice of degrees in insertion order to pick the same node as Python among equal minimums, because ranging over a map has no fixed order.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- Insert and merge are splices; `ExtractMin` consolidates equal-degree trees.
- `DecreaseKey` cuts a node that beats its parent, and a parent's second lost child cuts the parent too.
- A handle goes stale when its node leaves the heap, and the heap panics on it.
