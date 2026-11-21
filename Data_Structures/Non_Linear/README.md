# Non-Linear Data Structures

In a non-linear structure an element can have several successors, and sometimes several predecessors. Trees add a hierarchy, heaps add a priority order on top of a tree, and graphs allow any connection at all.

## Topics

Read them in this order.

| # | Section | What it adds | Level |
|---|---------|--------------|--------|
| 1 | [Trees](Trees/) | A hierarchy with one root. Search trees, range-query structures, multiway trees for disks and string trees. | 17 topics |
| 2 | [Heaps](Heaps/) | A tree with a priority order between parent and child. The smallest or largest element is at the root. | 3 topics |
| 3 | [Graph](Graph/) | Vertices joined by arbitrary edges. How to store them and what direction and weight change. | 5 topics |

A linear structure puts its elements in one sequence, so most questions end in a scan. These structures drop the sequence, which lets a single step discard a large part of the data. Each topic is implemented in Python, C++ and Go.

## How They Compare

| Sub-area | Shape | What it is for | Typical cost |
|----------|-------|----------------|--------------|
| Trees | hierarchy, one parent per node | ordered search, range queries, prefix and substring lookup | O(log n) when balanced |
| Heaps | complete binary tree in an array (the Fibonacci heap is a linked forest) | the minimum or the maximum, priority queues, heap sort | peek O(1), insert and extract O(log n) (Fibonacci insert O(1)) |
| Graph | vertices and edges, cycles allowed | networks and relations; the base of the graph algorithms | depends on the layout: O(V + E) space for a list |

## Where to Start

1. Start with [Trees](Trees/), and read the Binary Tree and the Binary Search Tree first. Every other tree, and every heap, builds on the binary tree.
2. Then [Heaps](Heaps/). The min heap is short and shows how a tree can live in an array. It leads into priority queues and heap sort.
3. Then [Graph](Graph/). The adjacency list is the most common layout. The rest of the folder compares it with the matrix and the edge list.
4. Return to Trees for the specialist topics, such as the range-query structures, the B-tree and the tries, when a problem calls for them.

| Situation | Look at | Why |
|-----------|---------|-----|
| Keys that must stay sorted under inserts and deletes | Trees | a balanced search tree keeps every operation O(log n) |
| Sums or minimums over a range of an array | Trees | Fenwick, segment tree and sparse table answer them |
| Words, prefixes or substrings | Trees | the trie and the suffix tree; the suffix array is under [Advanced String Algorithms](../../Algorithms/String_Algorithms/Advanced_String/Suffix_Array/) |
| Always take the best element next | Heaps | O(1) peek and O(log n) extract |
| Relations that are not a hierarchy, such as roads or links | Graph | a tree cannot hold cycles or several parents |

## Common Pitfalls

- A heap is not a search structure. Siblings are not ordered, so finding a value is O(n) and reading the array does not give sorted output.
- A tree is a connected graph with no cycles, so a tree traversal needs no visited set. A general graph does.
- A plain binary search tree on sorted input becomes a chain, and every operation is O(n).
- This section covers how a graph is stored. BFS, DFS, shortest paths and spanning trees live under Graph Algorithms.

## Related

- [Linear Data Structures](../Linear/): read first.
- [Big O Notation](../../Complexity_Analysis/Time_Complexity/Big_O_Notation/): read first.
- [Graph Algorithms](../../Algorithms/Graph_Algorithms/): BFS, DFS, shortest paths and spanning trees run on the graph layouts stored here.
- [Heap Sort](../../Algorithms/Sorting/Heap_Sort/): the sorting algorithm built on the heaps.
