# Advanced Data Structures

These three structures combine simpler ones to get one operation pattern in O(1) or nearly so. The two caches pair a hash map with ordered lists and differ in what they evict. The disjoint set union keeps groups of items and merges them in near constant time.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [LRU Cache](LRU_Cache/) | A hash map plus a doubly linked list. Evicts the entry unused for the longest time. O(1) get and put. | Intermediate |
| 2 | [LFU Cache](LFU_Cache/) | A hash map plus one ordered list per use count. Evicts the least used entry, then the least recent of those. O(1). | Advanced |
| 3 | [Disjoint Set Union](Disjoint_Set_Union/) | Union-find on a parent array. Merges groups and tests membership in nearly constant amortized time. | Intermediate |

Both caches return `-1` from `get` for a missing key, with integer keys and values. The DSU offers `find`, `union`, `connected` and component counts.

## How They Compare

| Structure | Built from | Key property | Operation | Time | Space |
|-----------|------------|--------------|-----------|------|-------|
| LRU cache | hash map and doubly linked list | a get or put moves the entry to the front; the back is evicted | get, put | O(1) | O(capacity) |
| LFU cache | hash map and one ordered list per frequency | a get or put raises the count; the lowest count is evicted | get, put | O(1) | O(capacity) |
| Disjoint set union | a parent array, with rank and size arrays | merges only: no split, no delete | find, union | O(alpha(n)) amortized | O(n) |

Building a DSU is O(n). Here alpha is the inverse Ackermann function, which stays below 5 for any input that fits in memory. On the sequence `put(1)`, `put(2)`, `get(1)`, `put(3)`, `get(1)`, `get(2)`, `get(3)`, `put(4)` with capacity 2, both caches evict `2` first. Then LRU evicts `1` (used before `3`) and LFU evicts `3` (used 2 times against 3 for `1`).

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| Keep recent data and drop what has gone cold | LRU cache | one rule, one list, and every use moves an entry to the front |
| Keep the entries that are used most overall | LFU cache | a one-off burst does not push out a key that is read all the time |
| Group items and ask whether two are connected | Disjoint set union | merging and testing are nearly constant time |
| Cycle checks in Kruskal or connected components of an edge list | Disjoint set union | edges arrive one at a time, and the structure only merges |
| Groups must also be split, or items deleted | another structure | the DSU cannot undo a union |

## Common Pitfalls

- In both caches a read is a use: `get` changes the order or the count, not only `put`.
- `get` returns `-1` for a missing key, so a stored value of `-1` looks like a miss.
- LFU adapts slowly: an old key with a high count stays even after it stops being used.
- Among equal counts, LFU evicts the least recently used entry.
- The DSU has no operation to split a set and no delete.

## Related

- [Hash Table](../Hashing/Hash_Table/): read first.
- [Doubly Linked List](../Linear/Linked_List/Doubly/): read first.
- [Array](../Linear/Array/): read first.
- [Deque](../Linear/Queue/Deque/): the other double-ended structure.
- [Union-Find Applications](../../Problem_Patterns/Union_Find_Applications/): problems that use the DSU.
- [Kruskal's Algorithm](../../Algorithms/Graph_Algorithms/Minimum_Spanning_Tree/Kruskals_Algorithm/): uses the DSU to reject edges that close a cycle.
