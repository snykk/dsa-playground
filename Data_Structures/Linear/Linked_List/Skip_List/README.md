# Skip List

A skip list is a sorted linked list with extra "express lane" pointers above it. Each key gets a random tower height, so a search skips many nodes at once: search, insert and delete take expected O(log n) time, with no rotations or rebalancing.

## Intuition

Think of a subway line with local and express trains. The local train stops at every station (level 0, every key). Express lines stop at fewer stations (higher levels). To travel far you ride the express as long as it does not overshoot, then switch to a slower line. Each key joins the next higher line with probability `p` (0.5 here), decided by a coin flip when the key is inserted.

Invariants: every level is a sorted linked list; every key on level `i` is also on level `i - 1`; level 0 holds all keys; `level` equals the highest non-empty level.

## Visual

```text
Level 3: H -------------------------------------> 25 -> nil
Level 2: H ----------------> 6 ------------------> 25 -> nil
Level 1: H ------> 3 ------> 6 ------> 12 ------> 25 -> nil
Level 0: H -> 3 -> 6 -> 9 -> 12 -> 19 -> 25 -> nil

Search 19: level 3: next is 25 (too big), drop
           level 2: move to 6, next is 25, drop
           level 1: move to 12, next is 25, drop
           level 0: next is 19 -> found
```

H is the header, a sentinel node with a pointer on every level. The tower heights above (2, 3, 1, 2, 1, 4 levels) are one possible outcome of the coin flips.

## Operations

| Operation | What it does | Time |
| --- | --- | --- |
| `search(key)` | descend from the top level, move right while the next key is smaller, then check the node after the stop | O(log n) expected |
| `insert(key)` | search recording `update[i]` (the last node on each level), draw a random height, splice the tower in; an existing key is ignored | O(log n) expected |
| `delete(key)` | search with `update`, unlink the node on every level it appears, lower `level` while the top level is empty; returns whether the key was present | O(log n) expected |
| `display()` | walk level 0 | O(n) |

Names: `insert`, `search`, `delete`, `display` (Python); `insert`, `search`, `deleteNode`, `display` (C++); `Insert`, `Search`, `Delete`, `Display` (Go). Python and C++ default to `max_level = 16`, `p = 0.5`; Go's `NewSkipList(maxLevel, p)` requires both.

### Random height

Start at 0; while a coin with probability `p` comes up heads and the height is below `max_level`, add one. So `P(height >= k) = p^k`, and a key has `height + 1` forward pointers.

## Step-by-Step Trace

Insert `15` into the list above with a drawn height of 1:

| Level | `update[level]` | Action |
| --- | --- | --- |
| 3 | header | not spliced (height 1 < 3) |
| 2 | 6 | not spliced |
| 1 | 12 | splice: 12 -> 15 -> 25 |
| 0 | 12 | splice: 12 -> 15 -> 19 |

Then `delete(6)` unlinks 6 on levels 2, 1 and 0. `delete(25)` unlinks 25 on levels 3, 2, 1 and 0; levels 3 and 2 become empty, so `level` drops from 3 to 1.

## Complexity

| Quantity | Value | Why |
| --- | --- | --- |
| search, insert, delete | O(log n) expected | about `(1/p) * log2(n)` moves |
| worst case | O(n) | every height unlucky; vanishingly unlikely |
| pointers per key | `1 / (1 - p)` = 2 expected | `P(height >= k) = p^k`, sum 1 + p + p^2 + ... |
| space | O(n) expected | about 2n pointers, plus the header's `max_level + 1` |

Heights are capped at `max_level`, so with the default 16 and `p = 0.5` the list stays efficient up to roughly 2^16 = 65,536 keys. Choose `max_level` near `log(n) / log(1/p)`. The worst-case space is O(n * max_level), not O(n log n).

## When to Use

Use it for an ordered set or map where you want simple code, ordered iteration, neighbour or range queries and easy concurrency. Do not use it when you need a hard worst-case bound (use a balanced tree) or the best memory locality (use a sorted array or B-tree).

## Skip List vs. Alternatives

| Structure | Search | Balancing | Notes |
| --- | --- | --- | --- |
| Skip list | O(log n) expected | random heights | ordered walk on level 0 |
| AVL / red-black tree | O(log n) worst case | rotations | hard bounds, more code |
| Treap | O(log n) expected | random priorities and rotations | also randomized, but a tree |
| Sorted array | O(log n) | none | inserts shift O(n) elements |
| Sorted linked list | O(n) | none | what the skip list improves on |

Skip lists are used in practice: Redis sorted sets, the LevelDB memtable and Java's `ConcurrentSkipListMap` are examples.

## Common Pitfalls

- Not lowering `level` after a delete: searches stay correct but start on empty levels.
- Mixing up the per-level predecessors in `update`.
- Re-seeding the random generator for each list: lists made in the same second share heights, and global `rand()` users are disturbed. The C++ class has a per-instance generator.
- A `max_level` too small for the data size.
- The header's key `-1` is a placeholder that is never compared; negative keys, including `-1`, work.
- C++: copying a list double-frees its nodes, so the copy operations are deleted.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [`Python/`](Python) | `skip_list.py` | `random.random()`; defaults (16, 0.5) |
| C++ | [`C++/`](C++) | `skip_list.cpp` | destructor; copy deleted; per-instance `mt19937`; `deleteNode` |
| Go | [`Go/`](Go) | `main.go` | `NewSkipList(maxLevel, p)`; global `math/rand` |

## Practice Problems

- [Design Linked List (LeetCode 707)](https://leetcode.com/problems/design-linked-list/)
- [My Calendar I (LeetCode 729)](https://leetcode.com/problems/my-calendar-i/)
- [Design Skiplist (LeetCode 1206)](https://leetcode.com/problems/design-skiplist/)
- [Traffic Lights (CSES 1163)](https://cses.fi/problemset/task/1163)

## Related

- [Singly Linked List](../Singly)
- [Binary Search Tree](../../../Non_Linear/Trees/Binary_Search_Tree)
- [Treap](../../../Non_Linear/Trees/Treap)
- [AVL Tree](../../../Non_Linear/Trees/AVL_Tree)
