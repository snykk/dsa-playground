# AVL Tree -- Go Implementation

## Files

- `main.go`: `AVLTree` and a small `main` that shows an example.
- `main_test.go`: unit tests plus a randomized insert and delete test that recomputes every height and checks balance factors.
- `go.mod`: module `avl_tree`.

## API

- `NewAVLTree() *AVLTree`
- `Insert(int)`, `Search(int) bool`, `Delete(int)`: duplicates and missing keys are ignored.
- `FindMin()`, `FindMax()`: return `(int, error)`, with an error on an empty tree.
- `InorderTraversal() []int`
- `Height()` (leaf = 1, empty = 0), `Size()`, `IsEmpty()`, `IsBalanced()`.

```go
avl := NewAVLTree()
for _, k := range []int{10, 20, 30, 40, 50} {
	avl.Insert(k)
}
avl.Delete(30)
fmt.Println(avl.InorderTraversal()) // [10 20 40 50]
```

## Go-Specific Notes

- Only in-order traversal exists (Python also has pre-order, post-order and level order).
- The package is `main`, so the example is run with `go run .`.
- Garbage collection frees deleted nodes; there is nothing to release by hand.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- Rebalance on the way back up after every change.
- Errors, not panics, signal an empty tree.
- Recompute heights in tests; stored heights can hide a bug.
