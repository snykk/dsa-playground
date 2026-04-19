# LFU Cache — Python Implementation

An O(1) **Least Frequently Used** cache. Evicts the least-frequently-accessed item first; on a tie, the least-recently-used among them.

For the full conceptual overview, visuals, and LFU vs. LRU comparison, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `lfu_cache.py` | `LFUCache` class with `get(key)` and `put(key, value)` |
| `lfu_cache_test.py` | Unit tests covering basic, eviction, ties, updates, and LeetCode trace |

---

## Python-Specific Notes

- **`OrderedDict` as the per-frequency DLL.** `OrderedDict` is a doubly linked hash table — it gives us `move_to_end` in O(1) and `popitem(last=False)` (LRU) in O(1). Using it avoids hand-rolling a linked list.
- **`defaultdict(OrderedDict)`** avoids the "does this key exist?" boilerplate when inserting into a brand-new frequency bucket.
- **Value storage**: we keep `(value, freq)` tuples in `key_to_val` plus a redundant copy in the OrderedDict. A little duplication, but the indirection keeps each lookup O(1) without extra wrapping objects.
- **`min_freq` maintenance**: only increments when the promoted node left an empty bucket, and resets to 1 on insert. This is the subtle invariant that keeps `put` O(1) (no scan for "what's the new min?").

---

## How to Run

```bash
python3 -m unittest lfu_cache_test.py
```

---

## Key Takeaways for Learners

1. **`OrderedDict` is the secret weapon.** It's the DLL you don't have to write yourself. Most Python O(1) LRU/LFU implementations lean on it.
2. **Two hash maps, one counter.** `key_to_val`, `freq_to_keys`, and `min_freq`. That's all you need — no fancier structures.
3. **The LRU tiebreak matters.** Two items with the same frequency: the older one in its bucket gets evicted. Try writing your own LFU without this tiebreak and see how quickly the cache churns.
