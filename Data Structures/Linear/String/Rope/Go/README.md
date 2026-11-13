# Rope -- Go Implementation

## Files

| File | Contents |
| --- | --- |
| `main.go` | `RopeNode`, `Rope`, the join and split helpers and a demo `main()` |
| `main_test.go` | tests in `package main`: operation tests, a randomized comparison with a plain string and tree-invariant checks |
| `go.mod` | module definition |

## API

- `NewRope(text string) *Rope`: balanced rope; an empty string gives an empty rope.
- `(*Rope).Index(i int) (byte, error)`: error out of range. O(log n).
- `(*Rope).Concat(other *Rope) *Rope`: sources unchanged. O(log n).
- `(*Rope).Split(i int) (*Rope, *Rope)`: `i` is clamped.
- `(*Rope).Insert(i int, text string)`, `(*Rope).Delete(i, length int)`: modify in place.
- `(*Rope).ToString() string`, `(*Rope).Len() int` (O(1), cached), `(*Rope).Height() int`.

## Go-Specific Notes

- Positions are bytes. `Split` inside a multi-byte character yields two invalid UTF-8 halves, and `Len()` counts bytes (`caf` plus an accented e has length 5).
- Nodes are never modified after creation, so ropes share subtrees; the garbage collector frees what is unreachable.
- A leaf is a node with non-empty `Data`. `Weight` is exported; the cached `length` and `height` are not.
- Recursion depth is the tree height, O(log n).
- The tests are plain sequential tests; the index test is table-driven.

## How to Run

```bash
cd "Data Structures/Linear/String/Rope/Go"
go test ./...
go run .
```

## Key Takeaways

- The AVL-style join keeps `Index` at O(log n) however the rope is edited.
- Byte positions: do not split inside a character.
- `Concat` and `Split` are persistent.
