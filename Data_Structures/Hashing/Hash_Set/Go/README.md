# Hash Set -- Go Implementation

A hand-written chaining hash set of `interface{}` elements that doubles its buckets at load 0.75. See the [topic README](../README.md).

## Files

- `main.go`: the `HashSet` type (no `main` function).
- `main_test.go`: plain unit tests (add, remove, resize, negative and other key types, chain and clear).
- `go.mod`: module file.

## API

| Function | Description | Time |
|----------|-------------|------|
| `NewHashSet(capacity)` | capacity 0 or less becomes 16 | O(capacity) |
| `Add(key) bool` | true if new; resizes when load exceeds 0.75 | O(1) amortized |
| `Remove(key) bool` | true if removed | O(1) average |
| `Contains(key) bool` | membership | O(1) average |
| `Size()`, `IsEmpty()` | bookkeeping | O(1) |
| `Clear()` | allocates a new empty bucket slice | O(capacity) |

No iteration.

## Go-Specific Notes

- This is not built on Go's `map`; it is hand-rolled `[][]interface{}` buckets. In real code use `map[T]struct{}`.
- Negative ints are folded into range, strings are hashed directly, and any other key type is hashed through `fmt.Sprintf("%T:%v")`, so `int64(7)` and `int(7)` are different elements.
- Elements are compared with `==`, so a non-comparable element panics.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Resizing is what makes a chaining set O(1) on average.
- `interface{}` keys need a hash for every type.
- The idiomatic Go set is `map[T]struct{}`.
