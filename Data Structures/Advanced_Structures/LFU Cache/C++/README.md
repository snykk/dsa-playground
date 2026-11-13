# LFU Cache -- C++ Implementation

An O(1) least frequently used cache. Ties are broken by evicting the least recently used key. See the [topic README](../README.md) for the idea.

## Files

- `lfu_cache.h`: header-only `LFUCache` class.
- `lfu_cache_test.cpp`: assert-based tests, including capacity 0 and 1, the LeetCode 460 trace and a not-copyable check.

## API

| Member | Description | Time |
|--------|-------------|------|
| `explicit LFUCache(int capacity)` | throws `std::invalid_argument` if capacity is negative | O(1) |
| `int get(int key)` | value, or -1 on a miss; promotes the key | O(1) |
| `void put(int key, int value)` | insert or update; evicts the LFU key when full | O(1) |

## C++-Specific Notes

- Buckets are `std::list<std::pair<int,int>>` with the MRU at the front. Each key stores an iterator into its bucket; `std::list` iterators stay valid when other nodes change.
- A promotion erases the node and pushes a new one into the next bucket (it does not `splice`), then stores the new iterator.
- Because entries hold iterators into the object's own lists, the copy constructor and copy assignment are deleted. A copy would point into the source and dangle. Moves are defaulted and safe.
- The class is header-only, so the test includes `lfu_cache.h`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD lfu_cache_test.cpp -o lfu_cache_test && ./lfu_cache_test
```

## Key Takeaways

- Stable list iterators are what make "store a handle in a hash map" work.
- Copying a structure that stores iterators into itself is a bug; delete the copy.
- Two maps plus an integer give O(1) with no heap.
