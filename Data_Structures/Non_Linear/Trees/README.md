# Trees

Seventeen trees share one idea. They arrange data in a hierarchy so that one comparison or lookup discards a large part of it. By purpose they are ordered search trees and balanced variants, multiway trees for disks, range-query structures, string trees and a few specialists.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Binary Tree](Binary_Tree/) | The shape every other tree builds on. At most two children per node, and the four traversals. | Beginner |
| 2 | [Binary Search Tree](Binary_Search_Tree/) | Keys ordered so each comparison drops a subtree. O(h), which is O(n) when the tree is a chain. | Beginner |
| 3 | [AVL Tree](AVL_Tree/) | A BST kept within 1 in subtree height by rotations. O(log n) in the worst case. | Intermediate |
| 4 | [Red-Black Tree](Red_Black_Tree/) | A BST with a color bit. The longest path is at most twice the shortest. Insert only here, no delete. | Advanced |
| 5 | [Splay Tree](Splay_Tree/) | No balance data. Every access rotates the node to the root, so cost is O(log n) amortized. | Advanced |
| 6 | [Treap](Treap/) | A BST on keys and a max-heap on random priorities. O(log n) expected, built on split and merge. | Advanced |
| 7 | [B-Tree](B_Tree/) | Many sorted keys per node, so the tree is shallow. Built for disk pages. | Advanced |
| 8 | [B+ Tree](B_Plus_Tree/) | A B-tree with all data in linked leaves. A range query is one descent plus a leaf walk. Insert only here. | Advanced |
| 9 | [Fenwick Tree](Fenwick_Tree/) | Prefix sums in one array, driven by the lowest set bit. Point update and range sum in O(log n). | Intermediate |
| 10 | [Segment Tree](Segment_Tree/) | Block sums in a complete tree. Range sum and point assignment in O(log n), built bottom-up. | Intermediate |
| 11 | [Segment Tree (Lazy Propagation)](Segment_Tree_Lazy_Propagation/) | Adds pending tags so that a range add also costs O(log n) instead of touching every element. | Advanced |
| 12 | [Sparse Table](Sparse_Table/) | Windows of power-of-two length. O(1) range min or max, but static and O(n log n) in space. | Intermediate |
| 13 | [Interval Tree](Interval_Tree/) | A BST on interval left ends with a subtree maximum, so an overlap query skips whole subtrees. | Advanced |
| 14 | [Cartesian Tree](Cartesian_Tree/) | An array as a min-heap-ordered tree that reads back in order. Built in O(n); range minimum is an LCA. | Advanced |
| 15 | [K-D Tree](K_D_Tree/) | Points in k dimensions, split by one axis per level. Nearest-neighbour and rectangle queries. | Advanced |
| 16 | [Trie](Trie/) | One character per edge, so words share prefixes. Insert, search and prefix search in O(L). | Intermediate |
| 17 | [Suffix Tree](Suffix_Tree/) | A compressed trie of every suffix. Pattern search in O(m + occ), built here in O(n^2). | Advanced |

By purpose: the shape (1), search trees and balanced variants (2 to 6), multiway trees for disks (7 and 8), range-query structures (9 to 12), string trees (16 and 17) and others (13 to 15). The sparse table sits here although it is a table of windows, not a tree; it is read with the range structures.

## How They Compare

| Tree | Idea | Search | Insert | Delete | Balanced |
|------|------|--------|--------|--------|----------|
| Binary Tree | at most two children, no ordering | O(n) | O(n) | not provided | height O(log n), the insert keeps it complete |
| Binary Search Tree | left keys smaller, right keys larger | O(h) | O(h) | O(h) | no; O(n) on sorted input |
| AVL Tree | rotations keep subtree heights within 1 | O(log n) | O(log n) | O(log n) | yes, strictly |
| Red-Black Tree | five color rules | O(log n) | O(log n) | not implemented | yes, loosely |
| Splay Tree | rotate every accessed node to the root | O(log n) amortized | O(log n) amortized | O(log n) amortized | no, amortized only |
| Treap | BST on keys, max-heap on random priorities | O(log n) expected | O(log n) expected | O(log n) expected | in expectation |
| B-Tree | many sorted keys per node | O(log n) | O(log n) | O(log n) | yes |
| B+ Tree | keys and values only in linked leaves | O(log n) | O(log n) | not implemented | yes |

Range structures, specialists and string trees:

| Structure | Build | Query | Update | Space |
|-----------|-------|-------|--------|-------|
| Fenwick Tree | O(n log n) | O(log n) | O(log n) | n + 1 cells |
| Segment Tree | O(n) | O(log n) | O(log n) | 2 * size |
| Segment Tree (Lazy) | O(n) | O(log n) | O(log n) range add | two arrays of 4n |
| Sparse Table | O(n log n) | O(1) | not supported | O(n log n) |
| Interval Tree | O(h) per insert | O(h + k) typical, O(n) worst | delete supported | one extra number per node |
| Cartesian Tree | O(n) | range minimum O(h) | none | O(n) |
| K-D Tree | O(n log n) | nearest O(log n) average; range O(sqrt n + k) | insert O(h), no rebalance | O(n) |
| Trie | O(L) per word | O(L) | delete O(L) | O(total characters) |
| Suffix Tree | O(n^2) here | O(m + occ) | none | O(n) |

`h` is the height, `size` the next power of two that is at least n, `k` the number of results, `L` a word length and `m` a pattern length. The K-D tree build is O(n log n) in the cost model and O(n log^2 n) in Python and Go, which sort at every level; its nearest-neighbour bound is for low dimensions and the worst case is O(n). The suffix tree is built suffix by suffix here; Ukkonen's algorithm builds it in O(n). The Fenwick build runs n updates; an O(n) build exists.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| Ordered keys, and a hard bound on every operation | AVL Tree | height below 1.44 log2(n+2), so every operation is O(log n) worst case |
| Ordered keys with cheap inserts | Red-Black Tree | at most 2 rotations per insert; this repository has no delete for it |
| Ordered keys, simple code, random input | Binary Search Tree | no rebalancing code; fine until the input is sorted |
| Ordered keys with short code | Treap | split and merge give O(log n) expected with little code |
| Recently used keys should stay close | Splay Tree | each access moves the key to the root |
| Data too large for memory | B-Tree or B+ Tree | a node is a disk page, so a search touches O(log_t n) nodes |
| A database-style range scan | B+ Tree | one descent, then a walk along the linked leaves |
| Prefix sums with point updates | Fenwick Tree | the shortest code and n + 1 cells |
| Range sums with range updates | Segment Tree (Lazy Propagation) | range add and range sum are both O(log n) |
| Range minimum on data that never changes | Sparse Table | O(1) per query after an O(n log n) build |
| Which stored intervals overlap this one | Interval Tree | the subtree maximum lets a query skip whole subtrees |
| Nearest point or points in a rectangle | K-D Tree | regions that cannot hold an answer are skipped |
| Autocomplete and prefix tests | Trie | O(L) regardless of how many words are stored |
| Many substring queries on one fixed text | Suffix Tree | O(m + occ) per query after one build |

## Common Pitfalls

- A plain BST on sorted input becomes a chain of height n - 1, and every operation is O(n).
- A splay tree is O(log n) amortized, not per operation: one call can cost O(n), and reads change the tree.
- The red-black tree and the B+ tree have no delete in this repository.
- A Fenwick tree needs an operation that can be undone, such as a sum. For a minimum or maximum use a sparse table (static data); the segment trees here sum only.
- The sparse table is static, so any change means a rebuild. The K-D tree and the interval tree never rebalance.
- A suffix tree needs a unique end symbol, or a suffix that ends inside another loses its leaf.

## Related

- [Big O Notation](../../../Complexity_Analysis/Time_Complexity/Big_O_Notation/): read first.
- [Heaps](../Heaps/): the heap order that the treap and the Cartesian tree borrow.
- [Graph](../Graph/): a tree is a graph with no cycles.
- [Binary Search](../../../Algorithms/Searching/Binary_Search/): the same halving idea on a sorted array.
- [Suffix Array](../../../Algorithms/String_Algorithms/Advanced_String/Suffix_Array/): the array form of the suffix tree; it lives with the string algorithms.
