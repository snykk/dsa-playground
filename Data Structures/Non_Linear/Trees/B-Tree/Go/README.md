# B-Tree -- Go Implementation

A B-tree of minimum degree `t` over `int` keys, with insert, delete, search and sorted traversal. See the [topic README](../README.md) for the algorithms.

## Files

| File | Contents |
| ---- | -------- |
| `main.go` | `BTreeNode`, `BTree` and a small `main` demo |
| `main_test.go` | unit tests, a split regression test, and a randomized test against a map with an invariant checker |
| `go.mod` | module `b_tree` (Go 1.24.2) |

## API

| Call | Result |
| ---- | ------ |
| `NewBTree(minDegree int) *BTree` | empty tree |
| `Insert(key int)` | adds a key; an existing key is stored again |
| `Search(key int) bool` | whether the key is present |
| `Delete(key int) bool` | removes one copy; false if absent |
| `Traverse() []int` | all keys in sorted order |

## Go-Specific Notes

- The garbage collector frees removed nodes, so there is no destructor.
- Splitting reads the median key before reslicing `keys[:mid]`. Reading it afterwards panics with an index out of range, as the first version did on the sixth insert.
- Slices of a merged node are appended into the left node, which is safe because the right node is dropped.
- Everything lives in `package main`; the demo `main` is not run by `go test`.

## How to Run

```bash
cd "Data Structures/Non_Linear/Trees/B-Tree/Go"
go test ./...
go run .
```

## Key Takeaways

- Read the middle key first, then reslice.
- Merge with the right sibling unless the child is last; then merge left.
- The random test compares against a map and checks fill bounds, order and leaf depth.
