# Data Structures

A comprehensive collection of data structure implementations with explanations and complexity analysis.

## Categories

| Category | Description |
|----------|-------------|
| [Linear](Linear/) | Arrays, Linked Lists, Stacks, Queues |
| [Trees](Non_Linear/Trees/) | Binary trees, BST, AVL, red-black, segment trees, tries and more |
| [Graphs](Non_Linear/Graph/) | Graph representations: adjacency list and matrix, edge list |
| [Hashing](Hashing/) | Hash tables, hash maps, hash sets, collision handling, Bloom filter |
| [Heaps](Non_Linear/Heaps/) | Min and max heaps, Fibonacci heap |
| [Advanced structures](Advanced_Structures/) | Disjoint set union, LRU and LFU caches |

## Complexity Reference

### Linear Data Structures
| Structure | Access | Search | Insert | Delete |
|-----------|--------|--------|--------|--------|
| Array | O(1) | O(n) | O(n) | O(n) |
| Linked List | O(n) | O(n) | O(1) | O(1) |
| Stack | O(n) | O(n) | O(1) | O(1) |
| Queue | O(n) | O(n) | O(1) | O(1) |

### Tree Data Structures
| Structure | Search | Insert | Delete |
|-----------|--------|--------|--------|
| Binary Search Tree | O(h) | O(h) | O(h) |
| AVL Tree | O(log n) | O(log n) | O(log n) |
| Red-Black Tree | O(log n) | O(log n) | O(log n) |
| Segment Tree | O(log n) | O(log n) | - |

### Hash-Based Structures
| Structure | Search | Insert | Delete |
|-----------|--------|--------|--------|
| Hash Table | O(1)* | O(1)* | O(1)* |

*Average case, O(n) worst case

### Advanced Structures
| Structure | Build | Query | Update |
|-----------|-------|-------|--------|
| Fenwick Tree | O(n) | O(log n) | O(log n) |
| Sparse Table | O(n log n) | O(1) | - |
| Union-Find | - | O(α(n)) | O(α(n)) |

## Implementation Structure

Each data structure folder contains:
- Implementation files (C++, Python, Go)
- Test files
- README with explanation and complexity analysis

