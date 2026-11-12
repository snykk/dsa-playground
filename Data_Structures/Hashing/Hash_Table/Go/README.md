# Hash Table -- Go Implementation

A chaining hash table over `interface{}` keys, with a doubling resize. See the [topic README](../README.md).

## Files

- `main.go`: `HashTable` and `KeyValue`.
- `main_test.go`: plain unit tests, including a chain longer than one, resize, negative keys and other key types.
- `go.mod`: module file.

## API

| Function | Description | Time |
|----------|-------------|------|
| `NewHashTable(capacity)` | capacity 0 or less becomes 16 | O(capacity) |
| `Put(key, value)` | insert or update; resize at load > 0.75 | O(1) amortized |
| `Get(key) (value, found)` | lookup | O(1) average |
| `Remove(key) bool` | true if removed | O(1) average |
| `Contains(key) bool` | presence | O(1) average |
| `Size()`, `IsEmpty()`, `Clear()` | bookkeeping | O(1) |

No iteration.

## Go-Specific Notes

- Ints hash as `key mod capacity`, folded into `[0, capacity)` for negative keys. Strings use `h*31 + c`. Any other key type is hashed through `fmt.Sprintf("%T:%v")`, so `int64(7)` and `int(7)` are different keys.
- Keys are compared with `==`: a non-comparable key (a slice) panics at runtime.
- `Remove` shifts the bucket slice with `append`; pairs are stored by value, not by pointer.
- In real code use the built-in `map`.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- A negative remainder needs folding back into range.
- `interface{}` keys need a hash for every type, not just int and string.
- Resizing re-puts every pair, which costs O(n) but is rare.
