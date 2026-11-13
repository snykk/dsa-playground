# Splay Tree -- Go Implementation

## Files

- `main.go`: `SplayNode`, `SplayTree`, a small demo `main` and an unexported `consistent` helper.
- `main_test.go`: tests, including a randomized comparison with a map and a parent-pointer check.
- `go.mod`: module `splay_tree`.

## API

- `NewSplayTree() *SplayTree`
- `Insert(key int, value string)`: insert or overwrite, then splay.
- `Search(key int) (string, bool)`: splays the last visited node on a miss too.
- `Delete(key int) bool`
- `FindMin() (int, bool)`, `FindMax() (int, bool)`: `(0, false)` when empty.
- `InorderTraversal() []int`, `Size() int`, `IsEmpty() bool`

## Go-Specific Notes

- Garbage collection frees nodes; there is no destructor.
- Traversal and size are iterative, so a 200,000-node path is fine.
- Copying a `SplayTree` value copies only the root pointer, so both values share nodes. Pass `*SplayTree`.

## How to Run

```bash
cd "Data Structures/Non_Linear/Trees/Splay Tree/Go"
go test ./...
go run .
```

## Key Takeaways

- `Search` and `Delete` splay on a miss, which keeps the amortized bound.
- Delete is split and join, with parent pointers cleared first.
