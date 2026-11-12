# LRU Cache -- Python Implementation

An O(1) least recently used cache. See the [topic README](../README.md) for the idea.

## Files

- `lru_cache.py`: `Node` and `LRUCache`, plus a small demo.
- `lru_cache_test.py`: unit tests (hits, misses, eviction order, updates, capacity 1, capacity 0 and negative).

## API

| Member | Description | Time |
|--------|-------------|------|
| `LRUCache(capacity)` | capacity 0 or less stores nothing | O(1) |
| `get(key)` | value, or -1; moves the key to the front | O(1) |
| `put(key, value)` | insert or update; evicts the back entry when over capacity | O(1) |
| `size` | property: number of entries | O(1) |

## Python-Specific Notes

- Nodes use `__slots__` to save memory. Sentinel head and tail nodes remove empty-list special cases.
- `put` inserts first and evicts afterwards, so with capacity 0 or less the new entry is removed immediately and `size` stays 0.
- `collections.OrderedDict` would shorten this to a few lines; the hand-written list shows the mechanism.

## How to Run

```bash
python3 -m unittest lru_cache_test
python3 lru_cache.py
```

## Key Takeaways

- Hash map plus doubly linked list gives O(1) get and put.
- `get` must reorder the list.
- Nodes store their key so eviction can clean the map.
