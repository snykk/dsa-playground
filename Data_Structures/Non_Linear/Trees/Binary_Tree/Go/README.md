# Binary Tree -- Go Implementation

## Files

- `main.go`: `BinaryTree` and a small `main` with an example.
- `main_test.go`: unit tests, including a 7-node tree with every traversal and a 1,000-node height check.
- `go.mod`: module `binary_tree`.

## API

- `NewBinaryTree() *BinaryTree`
- `Insert(int)`: level-order insert.
- `Search(int) bool`: O(n).
- `InorderTraversal()`, `PreorderTraversal()`, `PostorderTraversal()`, `LevelOrderTraversal()`: return `[]int`.
- `Height()` in edges (empty = -1), `Size()`, `IsEmpty()`.

```go
t := NewBinaryTree()
for i := 1; i <= 7; i++ {
	t.Insert(i)
}
fmt.Println(t.InorderTraversal()) // [4 2 5 1 6 3 7]
```

## Go-Specific Notes

- The queue for insert and level order is `container/list`.
- The package is `main`, so the example is run with `go run .`.
- Garbage collection frees nodes.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- Pre-, in- and post-order differ only in when the node is visited.
- Level order needs a queue and uses O(width) space.
- No ordering means O(n) search.
