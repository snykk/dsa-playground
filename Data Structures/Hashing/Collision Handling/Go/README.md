# Collision Handling -- Go Implementation

Chaining and linear probing over `interface{}` keys. See the [topic README](../README.md).

## Files

- `main.go`: `HashTableChaining`, `HashTableOpenAddressing`, `KeyValue` and the shared `hashKey`.
- `main_test.go`: plain unit tests, including forced collisions, a full table, wrap-around, negative keys and other key types.
- `go.mod`: module file.

## API

| Function | Description |
|----------|-------------|
| `NewHashTableChaining(capacity)` | capacity 0 or less becomes 16 |
| `(*HashTableChaining).Put(key, value)`, `Get(key) (value, found)` | insert or update; lookup |
| `NewHashTableOpenAddressing(capacity)` | linear probing; capacity 0 or less becomes 16 |
| `(*HashTableOpenAddressing).Put(key, value)` | panics for a new key when the table is full |
| `(*HashTableOpenAddressing).Get(key)` | probes at most `capacity` slots |

There is no remove, no size and no quadratic probing.

## Go-Specific Notes

- `hashKey` folds negative ints into range and hashes any other key through `fmt.Sprintf("%T:%v")`, so `int64(7)` and `int(7)` are different keys.
- Keys are compared with `==`, so a key type that is not comparable (a slice, for example) panics at runtime.
- Go's built-in `map` is not implemented with these schemes (Go 1.24 and later use a Swiss-table design).

## How to Run

```bash
go test ./...
```

## Key Takeaways

- A full table must stop a probe loop explicitly.
- A negative remainder is a bug waiting in any `% capacity`.
- Use the built-in `map` in real code.
