# Segment Tree -- Go Implementation

A bottom-up segment tree for range sums and point assignment. See the [topic README](../README.md) for the layout and traces.

## Files

| File | Contents |
| ---- | -------- |
| `main.go` | `SegmentTree` and a small demo `main` |
| `main_test.go` | unit tests, panic tests and a randomized test against brute force |
| `go.mod` | module `segment_tree` (Go 1.24.2) |

## API

| Call | Result |
| ---- | ------ |
| `NewSegmentTree(arr []int) *SegmentTree` | builds the tree in O(n); the input slice is copied into the leaves |
| `Update(index, value int)` | assigns `value` to element `index` |
| `Query(left, right int) int` | sum of elements `left..right`, inclusive |
| `Get(index int) int` | one element |

Bad indices and `left > right` panic.

## Go-Specific Notes

- `int` is 64-bit on 64-bit platforms, so ordinary sums do not overflow.
- Errors are panics, like an out-of-range slice index, not returned errors.
- The tree is a single `[]int` of length `2 * size`.

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/Segment_Tree/Go"
go test ./...
go run .
```

## Key Takeaways

- Padding to a power of two keeps the child arithmetic (`2i`, `2i + 1`) valid.
- Check the index before adding `size`.
- `Update` assigns.
