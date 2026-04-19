# LFU Cache — C++ Implementation

An O(1) **Least Frequently Used** cache. Evicts the least-frequently-accessed entry first; on ties, the least-recently-used.

For the full conceptual overview, visuals, and LFU vs. LRU comparison, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `lfu_cache.h` | Header-only `LFUCache` class |
| `lfu_cache_test.cpp` | Assertion-based test cases |

---

## C++-Specific Notes

- **`std::list<std::pair<int,int>>` per frequency bucket.** `std::list` is a doubly linked list with **stable iterators** — the one critical guarantee we need. We stash each entry's iterator in the key→entry map; splicing never invalidates that iterator.
- **`std::unordered_map<int, std::list<...>>`** maps frequency → bucket. On Python the equivalent is `defaultdict(OrderedDict)`; in C++ we use the `[]` operator, which default-inserts empty lists.
- **Single-file header** with inline methods. Including it pulls in `<list>` + `<unordered_map>`, nothing heavy.
- **No SSO / allocator magic required** — correctness is already O(1). If you need higher performance, swap `std::list` for a hand-rolled intrusive DLL to avoid node-per-entry heap allocation.
- **Rule of Zero**: we don't write destructor/copy/move. The stdlib containers handle cleanup automatically, so we don't need to.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall lfu_cache_test.cpp -o lfu_cache_test
./lfu_cache_test
```

---

## Key Takeaways for Learners

1. **`std::list`'s stable iterators are the trick.** Unlike `std::vector` / `std::deque`, inserting or erasing elsewhere doesn't invalidate iterators. This is what makes "store an iterator in a hash map" safe.
2. **Two hash maps + a min_freq int.** Don't overthink it — the data structure _looks_ like it should need a balanced tree or priority queue, but it doesn't.
3. **LeetCode 460 is a classic interview question.** Implementing LFU in O(1) (not O(log n) with a heap) demonstrates you understand the "hash map + linked list" combo that underlies most O(1) cache structures.
