# LFU Cache (Least Frequently Used)

A fixed-capacity cache that evicts the entry with the fewest accesses when full. Among entries with the same count it evicts the least recently used one. With a hash map and one ordered bucket per count, `get` and `put` both run in O(1).

## Intuition

A bookstore shelf holds 100 books. LRU removes the book nobody touched recently. LFU removes the book nobody reads often, even if someone glanced at it yesterday. LFU suits a stable popularity pattern: some items are genuinely hot, others were touched once.

A naive version scans for the smallest count (O(n)), or uses a heap (O(log n)). To be O(1) the cache keeps the smallest count in a variable.

Invariant: every key is in exactly one bucket, its bucket number is its access count, and `min_freq` is the smallest non-empty bucket.

## Visual

```text
key_to_val:   A -> (valA, 1)   B -> (valB, 1)   C -> (valC, 1)
              D -> (valD, 2)   E -> (valE, 2)   F -> (valF, 3)

freq_to_keys (LRU on the left, MRU on the right):
  count 1:  A  B  C        <- min_freq = 1: evict A first
  count 2:  D  E
  count 3:  F
```

## Operations

`get(key)`:

1. If the key is absent return `-1`.
2. Otherwise promote it: remove it from bucket f, add it at the MRU end of bucket f + 1.
3. If bucket f became empty, delete it, and if `f == min_freq` set `min_freq = f + 1`.
4. Return the value.

`put(key, value)`:

1. If the key exists, update the value and promote it. Nothing is evicted.
2. Otherwise, if the cache is full, remove the LRU key of bucket `min_freq` (and the bucket if it is now empty).
3. Insert the new key at the MRU end of bucket 1 and set `min_freq = 1`.

Capacity 0 is valid: `get` returns -1 and `put` does nothing. A negative capacity raises `ValueError` (Python) or `std::invalid_argument` (C++); Go treats it as 0. A miss returns -1, so a stored -1 looks like a miss.

## Step-by-Step Trace

Capacity 2 (buckets listed LRU first):

| Call | Returns | Buckets | min_freq |
|------|---------|---------|----------|
| `put(1, 10)` | - | 1: [1] | 1 |
| `put(2, 20)` | - | 1: [1, 2] | 1 |
| `get(1)` | 10 | 1: [2], 2: [1] | 1 |
| `put(3, 30)` | - | 1: [3], 2: [1] (evicted 2) | 1 |
| `get(2)` | -1 | unchanged | 1 |
| `get(3)` | 30 | 2: [1, 3] | 2 |
| `put(4, 40)` | - | 1: [4], 2: [3] (evicted 1) | 1 |

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| `get(key)` | O(1) | O(1) |
| `put(key, value)` | O(1) | O(1) |
| Whole cache | - | O(capacity) |

Each step is a hash lookup or a list unlink and insert. `min_freq` is maintained incrementally: it resets to 1 on a new insert and moves up only when a promotion empties the `min_freq` bucket. Empty buckets are deleted, which keeps space at O(capacity).

## When to Use

- Content or page caches with a stable hot set.
- Workloads where one scan would flush an LRU cache.
- Not for workloads whose popularity shifts quickly: old hot keys stay because counts never decay.
- Not when plain LRU already works: LFU adds state.

## LFU vs. LRU and Others

| Policy | Evicts | Weakness |
|--------|--------|----------|
| LFU | lowest count, then least recent | slow to forget old popularity |
| LRU | least recent | a scan flushes the cache |
| FIFO | oldest inserted | ignores reuse |
| LFU with aging | count discounted over time | more complex |
| ARC | balances recency and frequency | more complex |

Start with LRU; move to LFU if profiling shows scan pollution.

## Common Pitfalls

1. Resetting `min_freq` wrongly. Set it to 1 on a new insert; on a promotion bump it only if the emptied bucket was `min_freq`.
2. Losing the LRU tie-break by using an unordered set per bucket instead of an ordered list.
3. Evicting during an update of an existing key.
4. Leaving empty buckets behind after an eviction (the Python version did; it no longer does).
5. Copying the C++ cache: entries hold iterators into the bucket lists, so the copy operations are deleted. Moves are allowed.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [`Python/`](Python/) | `lfu_cache.py` | `defaultdict(OrderedDict)`, MRU at the tail |
| C++ | [`C++/`](C++/) | `lfu_cache.h` | `std::list` buckets with a stored iterator; not copyable |
| Go | [`Go/`](Go/) | `main.go` | `container/list` buckets; negative capacity becomes 0 |

## Practice Problems

- [LeetCode 460 - LFU Cache](https://leetcode.com/problems/lfu-cache/)
- [LeetCode 146 - LRU Cache](https://leetcode.com/problems/lru-cache/)

## Related

- [LRU Cache](../LRU_Cache/README.md)
- [Doubly Linked List](../../Linear/Linked_List/Doubly/README.md)
- [Hash Map](../../Hashing/Hash_Map/README.md)

Part of [Advanced Structures](../README.md).
