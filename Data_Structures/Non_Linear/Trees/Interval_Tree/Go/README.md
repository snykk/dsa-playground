# Interval Tree -- Go Implementation

An augmented binary search tree of closed `int` intervals. See the [topic README](../README.md) for the algorithms.

## Files

| File | Contents |
| ---- | -------- |
| `main.go` | `Interval`, `IntervalTree` and a small demo `main` |
| `main_test.go` | unit tests with exact results, a 100000-insert scaling test and a randomized test against brute force |
| `go.mod` | module `intervaltree` (Go 1.24.2) |

## API

| Call | Result |
| ---- | ------ |
| `NewInterval(low, high int) Interval` | closed interval; a low greater than high swaps the bounds |
| `Overlaps(other)`, `ContainsPoint(x)` | predicates on `Interval` |
| `NewIntervalTree() *IntervalTree` | empty tree |
| `Insert(Interval)` | adds an interval |
| `Delete(Interval) bool` | removes one equal interval; false if none |
| `SearchOverlapping(q)`, `SearchContainingPoint(x)`, `SearchContainedIn(q)` | `[]Interval` results |
| `InorderTraversal() []Interval`, `Size() int`, `IsEmpty() bool` | sorted by low, count, emptiness |

## Go-Specific Notes

- Garbage collection frees deleted nodes.
- The package has a `main` function (a demo), so `go build` works.
- `Size` walks the tree, so it is O(n).

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/Interval_Tree/Go"
go test ./...
go run .
```

## Key Takeaways

- `max` is recomputed only along the path of an insert or delete.
- Equal lows go right, so delete keeps going right until the high matches.
- The tree is not balanced; sorted input makes a chain.
