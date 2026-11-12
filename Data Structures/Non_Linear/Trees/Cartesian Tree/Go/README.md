# Cartesian Tree -- Go Implementation

## Files

- `main.go`: `CartesianTree` and a small `main` with an example.
- `main_test.go`: build, empty, single and sorted inputs, traversals, range queries compared with brute force, invalid ranges, and a 100,000-element chain.
- `go.mod`: module `cartesian_tree`.

## API

- `NewCartesianTree() *CartesianTree`, `NewCartesianTreeFromArray([]int) *CartesianTree`: O(n) build.
- `GetMinIndex(left, right int) int`: leftmost index of the minimum in `array[left..right]`; -1 for an empty tree or an invalid range. O(h).
- `InorderTraversal()`, `PreorderTraversal()`, `PostorderTraversal()`: return `[]int`.
- `Height()` in edges (empty = -1), `Size()`, `IsEmpty()`, `GetRootValue()` (-1 when empty).

```go
tree := NewCartesianTreeFromArray([]int{9, 3, 7, 1, 8, 12, 10, 20, 15, 18, 5})
fmt.Println(tree.GetRootValue())     // 1
fmt.Println(tree.GetMinIndex(4, 8))  // 4
```

## Go-Specific Notes

- The package is `main`, so it cannot be imported by other packages; copy the file or run the example with `go run .`.
- Traversals are recursive. Go grows goroutine stacks on demand, so a chain of 100,000 nodes is fine.
- `GetRootValue` returns -1 for an empty tree, which collides with a real value of -1; check `IsEmpty()` first.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- A range minimum is the LCA of its ends; walk down from the root.
- The stack build is linear because each element is popped at most once.
- Check `IsEmpty()` before trusting `GetRootValue()`.
