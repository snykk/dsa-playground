# Skip List -- Go Implementation

## Files

| File | Contents |
| --- | --- |
| `main.go` | `Node`, `SkipList`, `NewSkipList` and a demo `main()` |
| `main_test.go` | tests in `package main`, including a randomized check of the level invariants |
| `go.mod` | module definition |

## API

- `NewSkipList(maxLevel int, p float64) *SkipList`: both arguments are required (the demo uses 16 and 0.5).
- `Insert(key int)`: an existing key is ignored.
- `Search(key int) bool`
- `Delete(key int) bool`: `true` if the key was present.
- `Display() []int`: sorted keys; `nil` when empty.

## Go-Specific Notes

- Heights come from the global `math/rand`; Go 1.20 and later seed it randomly unless you call `rand.Seed`.
- The garbage collector frees removed nodes, so `Delete` only unlinks them.
- The header key `-1` is a placeholder that is never compared.
- The unexported fields are read directly by the tests (same package) to check each level.

## How to Run

```bash
cd "Data Structures/Linear/Linked List/Skip List/Go"
go test ./...
go run .
```

## Key Takeaways

- Search, insert and delete all share the same right-then-down walk.
- Heights are geometric: `P(height >= k) = p^k`.
- The structure behaves as a set; duplicates are ignored.
