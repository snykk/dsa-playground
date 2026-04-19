# LRU Cache

The **LRU (Least Recently Used) Cache** is a data structure that stores a fixed number of key-value pairs and evicts the **least recently used** entry when the cache reaches capacity. It combines a **hash map** for O(1) key lookup with a **doubly linked list** for O(1) insertion, deletion, and reordering -- delivering constant-time `get` and `put` operations.

---

## Core Operations

| Operation | Description | Time | Space |
|-----------|-------------|------|-------|
| `LRUCache(capacity)` | Initialize cache with given capacity | O(1) | O(capacity) |
| `get(key)` | Return value for key (or -1); mark as most recently used | O(1) | O(1) |
| `put(key, value)` | Insert or update key-value pair; evict LRU if at capacity | O(1) | O(1) |

---

## How It Works

The cache maintains two complementary structures:

1. **Hash map** (`key -> node`): provides O(1) lookup by key.
2. **Doubly linked list**: orders entries from most recently used (front) to least recently used (back).

On `get(key)`: look up the node, move it to the front of the list, return its value.
On `put(key, value)`: if the key exists, update the value and move it to the front. Otherwise, create a new node at the front. If the cache exceeds capacity, remove the node at the back (the LRU entry) and delete its hash map entry.

---

## Visual Example

```
Capacity: 3

put(1,A)  ->  [1:A]
put(2,B)  ->  [2:B] <-> [1:A]
put(3,C)  ->  [3:C] <-> [2:B] <-> [1:A]
get(1)    ->  [1:A] <-> [3:C] <-> [2:B]       (1 moves to front)
put(4,D)  ->  [4:D] <-> [1:A] <-> [3:C]       (2 evicted -- LRU)
get(2)    ->  -1                                (2 was evicted)
```

---

## Use Cases

- **Browser cache**: Keep recently visited pages in memory; evict oldest on memory pressure.
- **Database query cache**: Cache frequent query results; discard stale entries automatically.
- **OS page replacement**: The LRU policy guides which memory pages to swap out.
- **DNS resolution cache**: Store recent domain lookups for fast repeated resolution.
- **Content delivery networks**: Cache popular content close to users.

---

## Implementations

| Language | Source | Tests |
|----------|--------|-------|
| Python | [`Python/lru_cache.py`](Python/lru_cache.py) | [`Python/lru_cache_test.py`](Python/lru_cache_test.py) |
| C++ | [`C++/lru_cache.cpp`](C++/lru_cache.cpp) | [`C++/lru_cache_test.cpp`](C++/lru_cache_test.cpp) |
| Go | [`Go/main.go`](Go/main.go) | [`Go/main_test.go`](Go/main_test.go) |

---

## Related

- **[LFU Cache](../LFU%20Cache/README.md)** — evicts the _least frequently_ used entry (with LRU as tiebreak) instead of the least recently used. Better when your workload has a stable popularity distribution; LRU suffers from "cache pollution" on sequential scans.
- **[Doubly Linked List](../../Linear/Linked%20List/Doubly/README.md)** — the O(1)-splice backbone this structure depends on.
- **[Hash Map](../../Hashing/Hash%20Map/README.md)** — for O(1) key → node lookup.

---

_Last Updated: April 2026_
