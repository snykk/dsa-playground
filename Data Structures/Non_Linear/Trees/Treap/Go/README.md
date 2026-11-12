# Treap -- Go Implementation

## Files

- `main.go`: `Treap`, the package-level `split`, `merge` and `dropMin` helpers, and a small demo `main`.
- `main_test.go`: unit tests, a 1000-operation randomized stress test and a regression test for `math.MaxInt` and `math.MinInt` keys.
- `go.mod`: module `treap`.

## API

- `NewTreap() *Treap`
- `Insert(key int) bool`: `false` if already present.
- `Delete(key int) bool`: `false` if absent.
- `Contains(key int) bool`, `Len() int`
- `Inorder() []int`: sorted keys.
- `CheckHeapProperty() bool`: diagnostic.

## Go-Specific Notes

- Priorities come from `rand.Uint32()` in `math/rand`. The top-level functions are safe for concurrent use, but they share one lock; use a per-goroutine `*rand.Rand` if that matters.
- `split`, `merge` and `dropMin` are free functions because they need no `Treap` state; `nil` is a valid empty treap.
- `Delete` does not compute `key+1`, which would wrap around at `math.MaxInt`.
- Garbage collection frees dropped nodes.

## How to Run

```bash
cd "Data Structures/Non_Linear/Trees/Treap/Go"
go test ./...
go run .
```

## Key Takeaways

- `nil` as the empty treap removes special cases from split and merge.
- Delete drops the minimum of the right part of a split.
