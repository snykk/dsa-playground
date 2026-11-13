# LRU Cache (Least Recently Used)

A fixed-capacity cache that evicts the least recently used entry when it is full. A hash map gives O(1) lookup and a doubly linked list keeps entries in recency order, so `get` and `put` both run in O(1).

## Intuition

Think of a desk with room for three books. Each time you read a book it goes on top of the pile; when you need space you put away the book at the bottom, the one untouched the longest. The bet is temporal locality: what you used recently you will probably use again.

The list gives the order and the map gives direct access to any node, so a hit can move its node to the front without searching. Each node stores its own key, because evicting the back node must also delete that key from the map.

Invariant: the map and the list always hold exactly the same keys, and list order is recency order.

## Visual

```text
capacity 3, after put(1,A) put(2,B) put(3,C)

map:   1 -> node1   2 -> node2   3 -> node3

front (MRU)                           back (LRU)
  [3:C] <-> [2:B] <-> [1:A]
                         ^ next victim
```

## Operations

| Operation | Description | Time |
|-----------|-------------|------|
| `LRUCache(capacity)` | empty cache; capacity 0 or less stores nothing | O(1) |
| `get(key)` | value (or -1 on a miss); moves the node to the front | O(1) |
| `put(key, value)` | insert or update at the front; evict from the back if over capacity | O(1) |
| `size` | number of entries | O(1) |

`get(key)`: look up the node; on a miss return -1; otherwise unlink it, insert it at the front, return its value.

`put(key, value)`: if the key exists, update it and move it to the front. Otherwise insert a new node at the front; if the size exceeds capacity, remove the back node and delete its key from the map.

A stored -1 looks like a miss, because -1 is the miss marker.

## Step-by-Step Trace

Capacity 3, front of the list first:

| Call | Returns | List |
|------|---------|------|
| `put(1,A)` | - | 1 |
| `put(2,B)` | - | 2, 1 |
| `put(3,C)` | - | 3, 2, 1 |
| `get(1)` | A | 1, 3, 2 |
| `put(4,D)` | - | 4, 1, 3 (2 evicted) |
| `get(2)` | -1 | 4, 1, 3 |
| `put(3,C2)` | - | 3, 4, 1 (update, nothing evicted) |

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| `get` | O(1) | O(1) |
| `put` | O(1) | O(1) |
| Whole cache | - | O(capacity) |

Every step is one hash lookup plus a constant number of pointer changes. The hash lookup is O(1) on average.

## When to Use

- A cache where recent use predicts future use: pages, query results, lookups.
- Not when a scan over many cold keys is common, because the scan evicts the hot keys (try [LFU](../LFU_Cache/README.md) or 2Q).
- Not as is for concurrent code: even `get` changes the list, so it needs a lock.

## LRU vs. Alternatives

| Policy | Evicts | Weakness |
|--------|--------|----------|
| LRU | least recently used | a scan flushes the cache |
| LFU | least frequently used | slow to forget old popularity |
| FIFO | oldest inserted | ignores reuse |
| CLOCK | approximates LRU with a reference bit | not exact |

Python's `OrderedDict.move_to_end` and `functools.lru_cache` do the same job in the standard library.

## Common Pitfalls

- Map and list falling out of sync (deleting from only one).
- Not storing the key in the node, so eviction cannot find the map entry.
- Treating `get` as read-only: it must move the node to the front.
- Capacity 0 or negative: the C++ version used to crash or never evict; it now ignores `put`.
- Copying the C++ cache: the map holds iterators into the original list, so copying is deleted.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [`Python/`](Python/) | `lru_cache.py` | hand-written list with sentinel head and tail |
| C++ | [`C++/`](C++/) | `lru_cache.cpp` | `std::list` plus `splice`; not copyable |
| Go | [`Go/`](Go/) | `main.go` | hand-written list with sentinels |

## Practice Problems

- [LeetCode 146 - LRU Cache](https://leetcode.com/problems/lru-cache/)
- [LeetCode 460 - LFU Cache](https://leetcode.com/problems/lfu-cache/)

## Related

- [LFU Cache](../LFU_Cache/README.md)
- [Doubly Linked List](../../Linear/Linked_List/Doubly/README.md)
- [Hash Table](../../Hashing/Hash_Table/README.md)

Part of [Advanced Structures](../README.md).
