# Binary Search Tree -- Go Implementation

## Files

- `main.go`: `BinarySearchTree` and a small `main` with an example.
- `main_test.go`: unit tests.
- `go.mod`: module definition.

## API

- `NewBinarySearchTree() *BinarySearchTree`
- `Insert(int)`, `Search(int) bool`, `Delete(int)`: duplicates and missing keys are ignored.
- `FindMin()`, `FindMax()`: return `(int, error)`, with an error on an empty tree.
- `InorderTraversal()`, `PreorderTraversal()`, `PostorderTraversal()`, `LevelOrderTraversal()`: return `[]int`.
- `Height()` in edges (empty = -1), `Size()`, `IsEmpty()`.

```go
bst := NewBinarySearchTree()
for _, k := range []int{50, 30, 70, 20, 40, 60, 80} {
	bst.Insert(k)
}
bst.Delete(50)
fmt.Println(bst.InorderTraversal()) // [20 30 40 60 70 80]
```

## Go-Specific Notes

- Operations are recursive. Go grows goroutine stacks on demand, so deep chains are fine in practice.
- The package is `main`, so the example is run with `go run .`.
- Garbage collection frees deleted nodes.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- Each comparison discards a subtree; cost is the height.
- Errors, not panics, signal an empty tree.
- The two-child delete uses the in-order successor.
