# Hash Map

A hash map (dictionary, associative array) maps unique keys to values and finds a key in O(1) on average by hashing it. In this repository the Hash Map topic is the Hash Table plus the everyday helpers: get with a default, insert if absent, bulk update, copy and iteration.

"Hash map" and "hash table" name the same idea. Read [Hash Table](../Hash_Table/README.md) for buckets, chains and resizing; this page covers the interface and how to use it.

## Intuition

A map answers "what is the value for this key?" without scanning. The hash of the key picks a bucket, and only that bucket is searched. The helpers capture patterns you would otherwise write by hand: "use this value if the key is missing" (counting) and "store only if new" (first writer wins).

Invariant: each key appears at most once; `put` on an existing key replaces its value.

## Visual

```text
Word count for "to be or not to be":

  key    value
  "to"     2
  "be"     2
  "or"     1
  "not"    1

count[w] = get_or_default(w, 0) + 1
```

## Operations

| Operation | Description | Time |
|-----------|-------------|------|
| `put`, `get`, `contains` | inherited from the Hash Table | O(1) average |
| `remove`, size, `clear` | inherited (not in the Go copy) | O(1) average |
| `get_or_default(key, default)` | value, or the default if the key is absent | O(1) average |
| `put_if_absent(key, value)` | store only if the key is new; returns whether it stored | O(1) average |
| `update(other)` | put every pair of another map | O(m) |
| `copy()` | independent map with the same pairs (Python) | O(m) |
| iteration | visits every `(key, value)` pair (Python) | O(capacity + n) |

Names: Python `get_or_default`, `put_if_absent`, `update`, `copy`; C++ `getOrDefault`, `putIfAbsent`, `update`; Go `GetOrDefault`, `PutIfAbsent`.

What each language has: Python has everything above (`update` accepts a `dict` or a `HashMap` and silently ignores any other argument; iteration yields `(key, value)` tuples, not keys). C++ has `getOrDefault`, `putIfAbsent` and `update(std::map)`, with no copy method and no iteration. Go has only `GetOrDefault` and `PutIfAbsent` on top of `Put`, `Get` and `Contains`: its `HashMap` embeds a private copy of the table that has no `Remove`, `Size`, `Update`, `Copy` or iteration.

"Absent" means the key is missing. A key stored with None (or a zero value) is present, so `put_if_absent` does not overwrite it.

## Step-by-Step Trace

Counting words with a Python `HashMap` that starts at capacity 4:

| Word | Lookup | Stored |
|------|--------|--------|
| `to` | absent, default 0 | 1 |
| `be` | absent, default 0 | 1 |
| `or` | absent, default 0 | 1 |
| `not` | absent, default 0 | 1 (load passes 0.75: capacity 4 becomes 8) |
| `to` | 1 | 2 |
| `be` | 1 | 2 |

Then `put_if_absent('to', 99)` returns False (the count stays 2) and `put_if_absent('that', 1)` returns True. Iterating gives `to, be, or, not, that`: bucket order, not text order.

## Complexity

| Operation | Average | Worst |
|-----------|---------|-------|
| get, put, remove, contains | O(1) | O(n) |
| get_or_default, put_if_absent | O(1) | O(n) |
| update, copy (m pairs) | O(m) | O(m n) |
| iterate | O(capacity + n) | same |

Space is O(n + capacity). The worst case needs every key in one bucket.

## When to Use

- Lookup by an arbitrary key: counting, grouping, caching, indexing.
- Not when you need sorted keys or range queries (use a balanced tree) or only presence (use a hash set).
- In real code use the built-in map of the language.

## Hash Map vs. Alternatives

| Structure | Stores | Lookup | Use when |
|-----------|--------|--------|----------|
| Hash map | key to value | O(1) average | arbitrary keys |
| Hash set | keys only | O(1) average | presence only |
| Array | index to value | O(1) | dense small integer keys |
| Sorted map (tree) | key to value | O(log n) | sorted order |

## Common Pitfalls

- Treating a stored None as absent (`get(key) is not None`): this was the bug in `put_if_absent`.
- Relying on iteration order: it follows buckets and changes on resize.
- Changing the map while iterating over it.
- Passing a list of pairs to Python `update`: it is ignored without an error.
- Go: keys of non-comparable types panic, and the Go `HashMap` lacks the operations listed above.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [`Python/`](Python/) | `hash_map.py` | subclasses `HashTable` (imported through a `sys.path` entry to the sibling folder) |
| C++ | [`C++/`](C++/) | `hash_map.cpp` | inherits from `HashTable<K, V>` via `#include` of the sibling file |
| Go | [`Go/`](Go/) | `main.go` | embeds its own private table copy |

## Practice Problems

- [LeetCode 706 - Design HashMap](https://leetcode.com/problems/design-hashmap/)
- [LeetCode 1 - Two Sum](https://leetcode.com/problems/two-sum/)
- [LeetCode 49 - Group Anagrams](https://leetcode.com/problems/group-anagrams/)
- [LeetCode 242 - Valid Anagram](https://leetcode.com/problems/valid-anagram/)

## Related

- [Hash Table](../Hash_Table/README.md)
- [Hash Set](../Hash_Set/README.md)
- [Collision Handling](../Collision_Handling/README.md)
- [Hashing overview](../README.md)
