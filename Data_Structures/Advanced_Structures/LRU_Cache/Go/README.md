# LRU Cache -- Go Implementation

An O(1) least recently used cache. See the [topic README](../README.md) for the idea.

## Files

- `main.go`: the `LRUCache` type, an internal list node and a demo `main`.
- `main_test.go`: plain unit tests (hits, misses, eviction order, updates, capacity 1, capacity 0 and negative).
- `go.mod`: module file.

## API

| Function | Description | Time |
|----------|-------------|------|
| `NewLRUCache(capacity)` | capacity 0 or less stores nothing | O(1) |
| `(*LRUCache).Get(key)` | value, or -1; moves the key to the front | O(1) |
| `(*LRUCache).Put(key, value)` | insert or update; evicts the back entry when over capacity | O(1) |
| `(*LRUCache).Size()` | number of entries | O(1) |

## Go-Specific Notes

- A hand-written doubly linked list with sentinel head and tail. The standard `container/list` would also work.
- `Put` inserts first and evicts afterwards, so with capacity 0 or less the new entry is removed immediately.
- Not goroutine-safe: even `Get` changes the list, so guard calls with a `sync.Mutex`.

## How to Run

```bash
go test ./...
go run main.go
```

## Key Takeaways

- A map from key to node pointer plus a doubly linked list is the whole design.
- Sentinels remove the empty-list special cases.
- Use a mutex for concurrent callers.
