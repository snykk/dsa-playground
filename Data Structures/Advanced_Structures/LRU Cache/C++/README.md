# LRU Cache -- C++ Implementation

An O(1) least recently used cache. See the [topic README](../README.md) for the idea.

## Files

- `lru_cache.cpp`: the `LRUCache` class (included directly by the test).
- `lru_cache_test.cpp`: assert-based tests, including capacity 0 and negative, and a not-copyable check.

## API

| Member | Description | Time |
|--------|-------------|------|
| `explicit LRUCache(int capacity)` | capacity 0 or less stores nothing | O(1) |
| `int get(int key)` | value, or -1; moves the key to the front | O(1) |
| `void put(int key, int value)` | insert or update; evicts the back entry when full | O(1) |
| `int size() const` | number of entries | O(1) |

## C++-Specific Notes

- Entries are `std::list<std::pair<int,int>>` (front is the MRU); the map stores a list iterator per key.
- `std::list::splice` moves a node to the front in O(1) and keeps every iterator valid.
- `put` returns at once when the capacity is 0 or less. Before that fix, capacity 0 popped an empty list and a negative capacity never evicted.
- The map holds iterators into the object's own list, so the copy constructor and copy assignment are deleted. Moves are defaulted and safe.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD lru_cache_test.cpp -o lru_cache_test && ./lru_cache_test
```

## Key Takeaways

- `splice` plus stable iterators is the idiomatic C++ LRU.
- Guard capacity 0 before touching the back of the list.
- Do not copy a structure that keeps iterators into itself.
