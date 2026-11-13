# LFU Cache -- Go Implementation

An O(1) least frequently used cache. Ties are broken by evicting the least recently used key. See the [topic README](../README.md) for the idea.

## Files

- `main.go`: the `LFUCache` type and a small demo `main`.
- `main_test.go`: plain unit tests (basic, eviction, ties, updates, capacity 0 and 1, LeetCode 460 trace).
- `go.mod`: module file.

## API

| Function | Description | Time |
|----------|-------------|------|
| `NewLFUCache(capacity)` | a negative capacity is treated as 0 | O(1) |
| `(*LFUCache).Get(key)` | value, or -1 on a miss; promotes the key | O(1) |
| `(*LFUCache).Put(key, value)` | insert or update; evicts the LFU key when full | O(1) |

## Go-Specific Notes

- Buckets are `container/list` lists with the MRU at the front. Each entry stores its `*list.Element`, so removal is O(1).
- `minFreq` changes in `promote` (when the left bucket empties) and in `Put` (reset to 1), not in `evict`.
- Not goroutine-safe; wrap calls in a `sync.Mutex` for concurrent use.
- Unlike Python and C++, a negative capacity does not fail; it becomes a no-op cache.

## How to Run

```bash
go test ./...
go run main.go
```

## Key Takeaways

- A map from key to `*list.Element` is the standard handle for O(1) caches.
- Keep the `minFreq` rule small: reset on insert, bump on an emptied bucket.
