# Red-Black Tree -- Go Implementation

## Files

- `main.go`: `RBNode`, `RedBlackTree`, an unexported `checkInvariants` helper and a small demo `main`.
- `main_test.go`: tests, including random invariant checks.
- `go.mod`: module `red_black_tree`.

## API

- `NewRedBlackTree() *RedBlackTree`
- `Insert(data int)`: duplicates allowed. O(log n).
- `Search(data int) bool`: O(log n).
- `InorderTraversal() []int`: sorted keys. O(n).
- `Size() int`, `IsEmpty() bool`.

There is no delete, height, min or max in Go.

## Go-Specific Notes

- Keys are `int`.
- The shared sentinel is stored in a struct field named `nil` (legal, because the field is accessed as `rbt.nil`).
- `checkInvariants()` returns an empty string when all rules hold, otherwise a message naming the broken rule. It is used by the tests.
- Garbage collection handles node memory; there is no destructor.

## How to Run

```bash
cd "Data Structures/Non_Linear/Trees/Red-Black Tree/Go"
go test ./...
go run .
```

## Key Takeaways

- Insert is iterative; the tree height stays within 2 log2(n + 1).
- The same five rules are checked in all three languages.
