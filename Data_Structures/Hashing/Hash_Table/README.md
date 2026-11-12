# Hash Table

A hash table, also called a hash map, dictionary or associative array, stores key-value pairs in an array of buckets and finds a key by hashing it to a bucket. With separate chaining and a doubling resize, put, get and remove take O(1) on average and O(n) in the worst case. This topic includes the everyday map helpers: get with a default, insert if absent, bulk update, copy and iteration.

## Intuition

A hash table is a filing cabinet with `c` drawers. A function turns any key into a drawer number, so you open one drawer instead of searching the cabinet. Two keys can share a drawer (a collision), so each drawer holds a short list. When the cabinet gets crowded (more than 0.75 pairs per drawer on average) you buy one twice as large and refile everything.

Invariant: a pair lives in the bucket `hash(key) mod capacity`, so a lookup only ever examines that bucket.

## Visual

```text
capacity 4, keys 5, 9, 13 (all give key mod 4 = 1)

  bucket 0: (empty)
  bucket 1: [5] -> [9] -> [13]
  bucket 2: (empty)
  bucket 3: (empty)
```

## Operations

| Operation | Description | Time |
|-----------|-------------|------|
| `put(key, value)` | update if present, else append; resize if load > 0.75 | O(1) average, amortized |
| `get(key)` | walk the key's bucket | O(1) average |
| `remove(key)` | unlink from the bucket | O(1) average |
| `contains(key)` | presence test | O(1) average |
| size, is empty, clear | bookkeeping | O(1) |
| `get_or_default(key, default)` | value, or the default if the key is absent | O(1) average |
| `put_if_absent(key, value)` | store only if the key is new; returns whether it stored | O(1) average |
| `update(other)` | put every pair of another table (or dict in Python) | O(m) |
| `copy()` | independent table with the same pairs (Python, Go) | O(m) |
| iteration | every `(key, value)` pair (Python `for`, Go `Items`) | O(capacity + n) |

Per language: Python has `put`, `get(key, default)`, `remove`, `contains`, `keys`, `values`, `items`, `clear`, `is_empty`, and dict-style `in`, `len`, `[]`, `del`. C++ has `put`, `get` (pointer or `nullptr`), `remove`, `contains`, `getSize`, `isEmpty`, `clear`. Go has the same without iteration, using `interface{}` keys. Iteration is a Python (`for`, `items()`) and Go (`Items()`) feature; C++ has none.

Map helpers by language: Python `get_or_default`, `put_if_absent`, `update(dict or HashTable)`, `copy`, `__iter__`; C++ `getOrDefault`, `putIfAbsent`, `update(std::map or unordered_map)`; Go `GetOrDefault`, `PutIfAbsent`, `Update`, `Copy`, `Items`. "Absent" means the key is missing: a key stored with None (or a zero value) is present, so `put_if_absent` does not overwrite it. Iteration follows the buckets, so its order is neither insertion nor sorted order and changes after a resize. Python iteration yields `(key, value)` tuples, not keys.

Capacity must be positive: Python raises `ValueError`, C++ throws `std::invalid_argument`, and Go uses 16 instead.

## Step-by-Step Trace

Capacity 4, keys 5, 9, 13, 2, 7, 12 (real run of the Python code):

| Step | Capacity | Buckets (non-empty) | Note |
|------|----------|---------------------|------|
| `put` 5, 9, 13 | 4 | 1: [5, 9, 13] | load 3/4 = 0.75, not above the threshold |
| `put` 2 | 4 then 8 | 1: [9], 2: [2], 5: [5, 13] | load 4/4 > 0.75: double and rehash with mod 8 |
| `put` 7 | 8 | 1: [9], 2: [2], 5: [5, 13], 7: [7] | |
| `put` 12 | 8 | 1: [9], 2: [2], 4: [12], 5: [5, 13], 7: [7] | load 6/8, no resize |
| `get(13)` | 8 | bucket 5 | compare 5 (no), 13 (yes) |

Counting words with the helpers: `count[w] = get_or_default(w, 0) + 1` gives `to` 2, `be` 2, `or` 1, `not` 1 for "to be or not to be". Then `put_if_absent('to', 99)` returns False and the count stays 2.

## Complexity

| Operation | Average | Worst | Why |
|-----------|---------|-------|-----|
| get, contains, remove | O(1) | O(n) | worst case: every key in one bucket |
| put | O(1) amortized | O(n) | a resize costs O(n) |
| iterate | O(capacity + n) | same | visits every bucket |
| get_or_default, put_if_absent | O(1) | O(n) | one lookup, plus one put |
| update, copy (m pairs) | O(m) | O(m n) | one put per pair |

Why O(1): with an even hash, a chain has `n / capacity` pairs on average, and resizing keeps that at most 0.75. Why amortized: resizes happen when the size doubles, so their cost over n inserts is n/2 + n/4 + ... < n. Space is O(n + capacity).

## When to Use

- You need fast lookup, insert and delete by key and do not need sorted order. This is the usual map: lookup by an arbitrary key.
- Counting, grouping, deduplicating, caching, two-sum style lookups.
- Not when you need ordered iteration, ranges or the minimum (use a balanced tree or a heap).

## Hash Table vs. Alternatives

| Structure | Lookup | Insert | Ordered iteration |
|-----------|--------|--------|-------------------|
| Hash table | O(1) average | O(1) amortized | no |
| Balanced BST | O(log n) | O(log n) | yes |
| Sorted array | O(log n) | O(n) | yes |
| Unsorted list | O(n) | O(1) | no |

## Common Pitfalls

- A weak hash. The string hash `h*31 + c` mod a power-of-two capacity sends `abcd` and `cdab` to the same bucket at every capacity up to 64. For the 4096 four-letter words over a to h, capacity 32 uses 29 buckets with a longest chain of 344 (ideal 128).
- Testing membership with `get(key) is not None`: a key stored with None looks absent. The `contains`/`in` of the Python code checks the key itself.
- Capacity 0 (divide by zero) and negative remainders (a negative index in Go).
- Holding a C++ pointer from `get` across a `put`: the resize splices nodes, so the pointer stays valid, but not after `remove`.
- Mutating a key after inserting it.
- Relying on iteration order, or changing the table while iterating over it.
- Passing a list of pairs to Python `update`: only a dict or a `HashTable` works.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [`Python/`](Python/) | `hash_table.py` | list of tuples per bucket; dict-style access; iteration; map helpers |
| C++ | [`C++/`](C++/) | `hash_table.cpp` | template with `std::list` buckets; resize splices nodes; map helpers |
| Go | [`Go/`](Go/) | `main.go` | `interface{}` keys; any key type; `Items`; map helpers |

## Practice Problems

- [LeetCode 1 - Two Sum](https://leetcode.com/problems/two-sum/)
- [LeetCode 706 - Design HashMap](https://leetcode.com/problems/design-hashmap/)
- [LeetCode 49 - Group Anagrams](https://leetcode.com/problems/group-anagrams/)
- [LeetCode 217 - Contains Duplicate](https://leetcode.com/problems/contains-duplicate/)

## Related

- [Collision Handling](../Collision_Handling/README.md)
- [Hash Set](../Hash_Set/README.md)
- [Bloom Filter](../Bloom_Filter/README.md)
- [Hashing overview](../README.md)
