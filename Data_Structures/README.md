# Data Structures

Four areas that organize data in different ways: sequences in a line, key lookups by hash, trees and graphs with branching links, and structures built from the others to solve one job. What separates them is which operation each makes cheap. In all, 47 topics, each with Python, C++ and Go code.

## Topics

| # | Section | What it adds | Level |
|---|---------|--------------|-------|
| 1 | [Linear Data Structures](Linear/) | Elements in a sequence. Arrays, strings, linked lists, stacks and queues are the building blocks of everything else. | 15 topics |
| 2 | [Hashing](Hashing/) | Find a key without searching. Hash tables and sets, collision handling, and the Bloom filter. | 4 topics |
| 3 | [Non-Linear Data Structures](Non_Linear/) | Elements with branching links. Trees keep order and range queries, heaps give the minimum or maximum, and graphs model relations. | 25 topics |
| 4 | [Advanced Data Structures](Advanced_Structures/) | Disjoint set union, and the LRU and LFU caches. Each combines simpler structures to do one job in O(1) or near O(1). | 3 topics |

No structure makes every operation cheap, so each area is a different trade.

## How They Compare

| Area | Organizes data as | Cheap operations | Gives up |
|------|-------------------|------------------|----------|
| Linear | a sequence | index access, and push or pop at an end | search by value, and inserting in the middle |
| Hashing | buckets chosen by a hash | insert, lookup and remove by key, O(1) on average | sorted order, and a worst case of O(n) |
| Non-Linear | nodes with links: trees, heaps, graphs | ordered search, min or max, neighbours | simplicity, because balancing and layouts add code |
| Advanced | a combination of the above | one specialized job, such as a cache or a merge of groups | generality |

Costs from the topic articles: array index O(1), array insert in the middle O(n), hash table O(1) average and O(n) worst case, AVL tree search O(log n), LRU cache O(1).

## Where to Start

The [study guide](../STUDY_GUIDE.md) takes them in this order:

1. **Linear.** Array first, then strings, linked lists, stacks and queues.
2. **Hashing.** Hash tables and sets, then collision handling, then the Bloom filter.
3. **Trees.** Binary tree, binary search tree, AVL tree and trie, then heaps. The priority queue in Linear is a heap in disguise, so read Heaps beside it.
4. **Graphs.** Adjacency list and matrix, which BFS and DFS in [Algorithms](../Algorithms/) then use.
5. **Advanced trees.** Segment tree, Fenwick tree, lazy propagation and treap, for range queries.
6. **Advanced structures.** The LRU and LFU caches. Disjoint set union comes earlier, with the group and graph problems of the problem-patterns phase.

## Common Pitfalls

- Expecting a hash table to be ordered. It gives O(1) average lookups and no sorted order; use a tree for ordered keys or ranges.
- Reading O(1) as always O(1). Hash operations are O(n) in the worst case, and an array append is O(1) amortized.
- Using a plain binary search tree on sorted input. It becomes a chain and every operation is O(n); an AVL tree keeps O(log n).
- Searching Non-Linear for the priority queue. It lives under Linear, in Queue, although it is implemented as a heap.

## Related

- [Complexity Analysis](../Complexity_Analysis/): read first.
- [Algorithms](../Algorithms/): Dijkstra uses a heap, Kruskal uses disjoint set union and Aho-Corasick uses a trie.
- [Problem Solving Patterns](../Problem_Patterns/): reusable solution shapes that run on these structures.
