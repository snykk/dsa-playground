# Hash Set -- C++ Implementation

A template chaining hash set that doubles its buckets at load 0.75. See the [topic README](../README.md).

## Files

- `hash_set.cpp`: `HashSet<K>` (included directly by the test).
- `hash_set_test.cpp`: assert-based tests (add, remove, resize, invalid capacity).

## API

| Member | Description | Time |
|--------|-------------|------|
| `HashSet(size_t cap = 16)` | throws `std::invalid_argument` if `cap` is 0 | O(cap) |
| `bool add(key)` | true if new; resizes when load exceeds 0.75 | O(1) amortized |
| `bool remove(key)` | true if removed | O(1) average |
| `bool contains(key)` | membership | O(1) average |
| `getSize()`, `bucketCount()`, `isEmpty()` | bookkeeping | O(1) |
| `clear()` | clears every bucket list | O(cap + n) |

No iteration. Elements use `std::hash<K>` and `==`.

## C++-Specific Notes

- Buckets are `std::vector<std::list<K>>`. A resize splices the existing list nodes into the new buckets, with no copies.
- An earlier version initialised a load-factor field but never read it, so the set stayed at 16 buckets and chains grew with n.
- The bucket count and size are separate members, so `bucketCount()` shows the effect of a resize.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD hash_set_test.cpp -o hash_set_test && ./hash_set_test
```

## Key Takeaways

- A load factor that is never checked does nothing.
- Splicing list nodes avoids copying elements on a resize.
- Validate the capacity before taking `% capacity`.
