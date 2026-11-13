# LFU Cache -- Python Implementation

An O(1) least frequently used cache. Ties are broken by evicting the least recently used key. See the [topic README](../README.md) for the idea.

## Files

- `lfu_cache.py`: the `LFUCache` class.
- `lfu_cache_test.py`: unit tests (basic, eviction, ties, updates, capacity 0 and 1, LeetCode 460 trace, empty-bucket cleanup).

## API

| Method | Description | Time |
|--------|-------------|------|
| `LFUCache(capacity)` | `ValueError` if capacity is negative | O(1) |
| `get(key)` | value, or -1 on a miss; promotes the key | O(1) |
| `put(key, value)` | insert or update; evicts the LFU key when full | O(1) |

## Python-Specific Notes

- Each count bucket is an `OrderedDict`: head is the LRU key, tail is the MRU key. `popitem(last=False)` evicts in O(1).
- `freq_to_keys` is a `defaultdict(OrderedDict)`. Emptied buckets are deleted on both promotion and eviction.
- `key_to_val` holds `(value, freq)`; the bucket also keeps the value, which is never read back.

## How to Run

```bash
python3 -m unittest lfu_cache_test
```

## Key Takeaways

- `OrderedDict` is the doubly linked list you do not have to write.
- `min_freq` moves only on a promotion that empties its bucket, and resets to 1 on insert.
- Keep recency order inside each bucket: it is the tie-break.
