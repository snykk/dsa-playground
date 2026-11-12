# B+ Tree -- Go Implementation

A B+ tree over `int` keys with `string` values. See the [topic README](../README.md) for the algorithms.

## Files

| File | Contents |
| ---- | -------- |
| `main.go` | `BPlusTreeNode`, `BPlusTree`, `KeyValue` and a small `main` demo |
| `main_test.go` | unit tests, a split test, a duplicate-key test and a randomized test against a map with an invariant checker |
| `go.mod` | module `b_plus_tree` (Go 1.24.2) |

## API

| Call | Result |
| ---- | ------ |
| `NewBPlusTree(minDegree int) *BPlusTree` | empty tree |
| `Insert(key int, value string)` | stores the pair; an existing key is overwritten |
| `Search(key int) string` | the value, or `""` when missing |
| `RangeSearch(start, end int) []KeyValue` | pairs with `start <= key <= end`, in key order |
| `Traverse() []KeyValue` | every pair in key order |

There is no delete.

## Go-Specific Notes

- Garbage collection frees nodes, so there is no destructor; the leaf `next` pointers are ordinary references.
- `Search` returns `""` for a missing key, which is also a valid stored value.
- Everything is in `package main`; the demo `main` is not run by `go test`.

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/B_Plus_Tree/Go"
go test ./...
go run .
```

## Key Takeaways

- Leaf splits copy the separator up; internal splits push the median up.
- Range queries and traversal follow the `next` chain.
- The random test checks fill bounds, separator order, leaf depth and the chain.
