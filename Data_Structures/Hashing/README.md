# Hashing

Hashing turns a key into an array index, so lookups, inserts and deletes take O(1) on average. The four topics are the key-value map, the rules for two keys that land in one slot, the set that keeps only keys, and the Bloom filter that trades exactness for memory.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Hash Table](Hash_Table/) | The key-value map. Separate chaining and a doubling resize, plus `get_or_default`, `put_if_absent`, `update` and `copy`. | Beginner |
| 2 | [Collision Handling](Collision_Handling/) | What happens when two keys share a slot. Chaining, linear probing and quadratic probing, with tombstones for deletes. | Intermediate |
| 3 | [Hash Set](Hash_Set/) | A hash table that keeps only keys. Each element is stored once and membership is O(1) on average. | Beginner |
| 4 | [Bloom Filter](Bloom_Filter/) | A bit array and k hashes. Tiny and fast, but it can say maybe for an item never added, and it cannot delete. | Intermediate |

A hash function maps a key to a number, and the number modulo the array size gives a slot. Different keys can map to the same slot (a collision), so every structure here needs a rule for it. Hash_Table and Hash_Set double their buckets when the load exceeds 0.75.

## How They Compare

| Structure | Stores | Answers | Collisions | Core cost |
|-----------|--------|---------|------------|-----------|
| Hash table | key-value pairs | the value for a key | chaining; resizes when the load exceeds 0.75 | O(1) average |
| Collision handling | key-value pairs, with a fixed capacity | the value for a key | chaining, linear probing or quadratic probing; no resizing | O(1 + load) chaining |
| Hash set | distinct keys | is the key present | chaining; resizes when the load exceeds 0.75 | O(1) average |
| Bloom filter | bits only, no items | maybe present, or definitely absent | ignored: different items may set the same bits | O(k) |

The worst case is O(n) for the table, the set and both collision rules, when every key lands in one bucket. Space is O(n), except for open addressing (O(capacity)) and the Bloom filter (about 9.6 bits per item at 1% false positives; for 1000 items the code uses 9586 bits and 7 hashes).

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| Look up a value by key | Hash table | O(1) average, and it resizes by itself |
| Remove duplicates, or ask "have I seen this?" | Hash set | no values to store, and membership is O(1) on average |
| See how collisions change behavior | Collision handling | chaining and probing side by side, with deletes and a full table |
| Membership over a huge set, where memory matters and an occasional false yes is fine | Bloom filter | a few bits per item and no false negatives |
| Keys must come back in sorted order | a tree or a sorted list | a hash table does not keep keys in order |

## Common Pitfalls

- O(1) is an average: if every key hits one bucket, each operation is O(n).
- In open addressing, emptying a slot on delete loses keys; a tombstone is needed so later probes do not stop too early.
- The open-addressing tables in `Collision_Handling` have a fixed capacity and raise an exception when full.
- Neither the table nor the set sorts keys or keeps insertion order.
- A Bloom filter yes means maybe present. Only a no is exact, and an item cannot be deleted.

## Related

- [Array](../Linear/Array/): read first.
- [Singly Linked List](../Linear/Linked_List/Singly/): read first; chaining stores colliding keys in lists.
- [LRU Cache](../Advanced_Structures/LRU_Cache/): a hash map plus a doubly linked list.
- [LFU Cache](../Advanced_Structures/LFU_Cache/): a hash map plus one ordered list per use count.
- [String Data Structures](../Linear/String/): string keys are hashed with a polynomial rolling hash.
