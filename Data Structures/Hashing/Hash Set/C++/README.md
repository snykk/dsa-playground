# Hash Set — C++ Implementation

A **Hash Set** stores **unique** elements and supports expected O(1) `add`, `remove`, and `contains`. Think of it as a hash map where we only care about the keys — values don't exist.

For the conceptual overview (internal hash tables, load-factor behavior, iteration ordering), see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `hash_set.cpp` | Hash set built on top of chaining (buckets of linked lists) |
| `hash_set_test.cpp` | Unit tests for `add`, `remove`, `contains`, size, and duplicates |

---

## Core Operations

| Operation | Average | Worst case | Notes |
|-----------|---------|------------|-------|
| `add(key)` | O(1) | O(n) | Worst case when every element collides |
| `contains(key)` | O(1) | O(n) | Same bucket-walk bound |
| `remove(key)` | O(1) | O(n) | |

---

## C++-Specific Notes

- **`std::unordered_set<T>`** is the stdlib equivalent. This implementation exists for learning — in production you would reach for `std::unordered_set` or a flat hash set (e.g. Abseil's `flat_hash_set`, which is usually faster due to open addressing and cache locality).
- **Hash function via `std::hash<T>`**: `<functional>` provides specializations for primitives and `std::string`. For custom structs you must specialize `std::hash` yourself or pass a functor as the second template argument.
- **Rehashing** happens at load factor threshold (commonly 1.0 for chaining). We double the bucket count and re-insert every element — expensive O(n) operation, amortized O(1) per insert.
- **Iterator invalidation**: after a rehash, all iterators become invalid. Keep this in mind when iterating while modifying.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall hash_set_test.cpp -o hash_set_test
./hash_set_test
```

---

## Key Takeaways for Learners

1. **A hash set _is_ a hash map without values.** Implementing one after a hash map is a small step — strip out the value type and `Get` / `Put` become `Contains` / `Add`.
2. **Uniqueness comes from the `contains` check before insert.** No magic — every `add` does a probe-or-walk first, and only writes on miss.
3. **Iteration order is not guaranteed.** If you iterate and later add, the bucket layout may change completely due to rehashing. If you need stable order, use `std::set` (ordered, O(log n)) or a hash set paired with a linked list (LRU-style).
