# Hash Map -- Go Implementation

`HashMap` embeds a private chaining `HashTable` and adds two helpers. See the [topic README](../README.md).

## Files

- `main.go`: `KeyValue`, a private `HashTable` copy (not shared with the Hash Table folder) and `HashMap`.
- `main_test.go`: plain unit tests for `GetOrDefault`, `PutIfAbsent`, negative keys and float64 keys.
- `go.mod`: module file.

## API

| Function | Description | Time |
|----------|-------------|------|
| `NewHashMap(capacity)` | capacity 0 or less becomes 16 | O(capacity) |
| `Put(key, value)`, `Get(key)`, `Contains(key)` | from the embedded table; `Get` returns `(value, found)` | O(1) average |
| `GetOrDefault(key, default)` | value or default | O(1) average |
| `PutIfAbsent(key, value)` | true if stored, false if the key exists | O(1) average |

There is no `Remove`, `Size`, `Update`, `Copy` or iteration in this copy.

## Go-Specific Notes

- Struct embedding (`*HashTable` inside `HashMap`) promotes the table methods.
- Negative ints are folded into range. Any other key type is hashed through `fmt.Sprintf("%T:%v")`; before that every non-int, non-string key landed in bucket 0.
- Keys are compared with `==`, so a non-comparable key panics.
- In real code use the built-in `map`.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Embedding is Go's version of inheritance for adding helpers.
- A default hash that returns a constant turns a map into a list.
- Go's own `map[K]V` already does all of this.
