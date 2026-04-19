# LFU Cache (Least Frequently Used)

> A fixed-capacity cache that evicts the **least frequently accessed** item when full. On ties (multiple items with the same frequency), evict the **least recently used** among them.

---

## 🎯 Intuition

You work at a bookstore with shelf space for only 100 books. When a new book arrives, which old one do you remove?

- **LRU** says: "Remove the book nobody has _touched_ recently."
- **LFU** says: "Remove the book nobody _reads_ often, even if they glanced at it yesterday."

LFU is a better fit when the access pattern has a stable "popularity" distribution — some items are genuinely hot, others are cold drops that happened to be touched once. It's widely used in CDN caches, database page caches, and content recommendation systems.

The challenge: **`get` and `put` must be O(1)**. A naive implementation (a hash map + scanning for min frequency) is O(n). Doing it in O(1) requires a clever combination of hash maps and doubly-linked lists.

---

## 📊 Visual: The Data Structure

```
                       ┌──────────────────────┐
key → Node ────────────┼──→ { key, val, freq }│
                       └──────────────────────┘
                              │ freq = 3
                              ▼
    freq → DLL      freq=1: A → B → C    (all items with freq 1)
                    freq=2: D → E        (all items with freq 2)
                    freq=3: F            (this one)
                    freq=4: (empty)

    minFreq = 1      (the current minimum; evict from this bucket first)
```

Three structures cooperate:
1. `keyToNode`: hash map from key → the node containing `(val, freq)` plus DLL links.
2. `freqToDLL`: hash map from frequency → doubly-linked list of nodes with that frequency. The **head is most recently used**, tail is least.
3. `minFreq`: an integer tracking the smallest non-empty frequency.

---

## 🧮 Operations

### `get(key)`
1. If `key` is not in `keyToNode`, return `-1` (miss).
2. Otherwise, promote: remove the node from its current frequency list, increment `node.freq`, insert at the head of the new frequency list.
3. If the old frequency list is now empty and it was `minFreq`, increment `minFreq`.
4. Return the value.

### `put(key, value)`
1. If the key already exists, update the value and treat it as a `get` (promote).
2. Otherwise, if size equals capacity:
   - Remove the **tail** of `freqToDLL[minFreq]` (least recently used among the least frequent).
   - Delete it from `keyToNode`.
3. Insert a new node with `freq = 1`, set `minFreq = 1`.

Each step is O(1): hash-map lookup + DLL unlink + DLL insert.

---

## 🚶 Walkthrough

Capacity 2. Trace:

```
put(1, 10):   cache = {1: (10, f=1)},  minFreq = 1
put(2, 20):   cache = {1: (10, f=1), 2: (20, f=1)},  minFreq = 1
get(1):       → 10;  cache = {1: (10, f=2), 2: (20, f=1)},  minFreq = 1
put(3, 30):   evict least-freq LRU → evict 2 (freq=1, only one left)
              cache = {1: (10, f=2), 3: (30, f=1)},  minFreq = 1
get(2):       → -1 (was evicted)
get(3):       → 30;  cache = {1: (10, f=2), 3: (30, f=2)},  minFreq = 2
put(4, 40):   evict least-freq LRU → both are f=2, evict 1 (older in its list)
              cache = {3: (30, f=2), 4: (40, f=1)},  minFreq = 1
```

---

## ⏱️ Complexity — and Why

| Operation | Time | Space |
|-----------|------|-------|
| `get(key)` | **O(1)** | O(1) |
| `put(key, val)` | **O(1)** | O(1) |
| Total space | — | O(capacity) |

Every step is a constant-time hash lookup or DLL splice. The cleverness is in maintaining `minFreq` incrementally: it only ever **increases when a promoted node leaves an empty list**, or **resets to 1 on insertion**. No scan required.

---

## ⚔️ LFU vs LRU vs Others

| Policy | Evict based on | Best when... | Weakness |
|--------|---------------|--------------|----------|
| **LRU** | Recency | Working set fits partially; temporal locality | Sequential scans flush the cache |
| **LFU** | Frequency (with LRU tiebreak) | Stable popularity distribution | Slow to adapt if popularity shifts |
| **FIFO** | Insertion order | Extremely simple; queue-like workloads | Ignores reuse |
| **LFU-DA** (decayed LFU) | Frequency with age discount | Mix of both | More complex |
| **ARC** (Adaptive Replacement) | Tracks both recency and frequency | Production databases | Patented; complex |

**Rule of thumb:** start with LRU. Upgrade to LFU if profiling shows scan pollution or if you have clear evidence of a popularity long-tail.

---

## 🎯 When to Use

✅ **Good fit:**
- Content caches where some URLs are genuinely hot (viral articles, trending products)
- Database page cache with stable hot-set
- Web browser asset cache
- LRU suffers from "cache pollution" in your workload

❌ **Bad fit:**
- Sliding-window workloads (popularity shifts quickly — old hot items stay cached forever)
- You don't have evidence LRU is failing — adding complexity without need

---

## ⚠️ Common Pitfalls

1. **Maintaining `minFreq` incorrectly.** On `put` of a new key, always reset `minFreq = 1`. On `get`/`put` of existing key, only increment `minFreq` if the promoted node was the last in the `minFreq` bucket.
2. **Forgetting the LRU tiebreak.** When multiple items share the minimum frequency, you must evict the _least recently used_ among them — that's why each frequency bucket is a DLL, not a plain set.
3. **Hash map of hash maps.** `freqToDLL: map[int] → DLL` is correct; `freqToSet: map[int] → set` loses insertion order → you lose the LRU tiebreak.
4. **Not releasing capacity on update.** `put(existingKey, newValue)` should _not_ evict anything — it's an update, not an insert.
5. **Integer overflow on `freq`.** For a 64-bit counter, not a real concern. For `int32`, theoretically possible after ~2 billion accesses on a single key.

---

## 🔧 Implementations

| Language | Folder | Notes |
|----------|--------|-------|
| Python | [Python/](Python/) | Hash map + `defaultdict(OrderedDict)` for the per-freq LRU |
| C++ | [C++/](C++/) | Hash map of `std::list<Node>` with iterator stashing |
| Go | [Go/](Go/) | Hash map of `container/list.List` |

---

## 📝 Practice Problems

- [LeetCode 460. LFU Cache](https://leetcode.com/problems/lfu-cache/) — the canonical problem
- [LeetCode 146. LRU Cache](https://leetcode.com/problems/lru-cache/) — compare and contrast
- [System Design: Design a Cache](https://www.educative.io/courses/grokking-the-system-design-interview) — appears in nearly every design interview

---

## 🔗 Related

- [LRU Cache](../LRU%20Cache/README.md) — recency-based sibling
- [Doubly Linked List](../../Linear/Linked%20List/Doubly/README.md) — the workhorse structure
- [Hash Map](../../Hashing/Hash%20Map/README.md) — for O(1) key lookup

---

_Part of [Advanced Data Structures](../README.md)._
