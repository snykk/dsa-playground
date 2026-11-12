# 📚 Data Structures & Algorithms (DSA)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Language](https://img.shields.io/badge/Language-Python%20%7C%20C%2B%2B%20%20%7C%20Go-blue.svg)]()
[![Progress](https://img.shields.io/badge/Progress-98%25-brightgreen.svg)]()

> A comprehensive collection of **Data Structures** and **Algorithms** implementations, explanations, and problem-solving patterns for interview preparation and competitive programming.

> **New to DSA?** Follow the structured curriculum in **[STUDY_GUIDE.md](STUDY_GUIDE.md)** — it sequences every topic in this repo into a week-by-week learning path, from foundations through competitive-programming techniques.

> **Prefer to watch it run?** The [DSA Playground site](https://snykk.github.io/dsa-playground/) renders every topic with its README, the Python / C++ / Go sources side by side, and step-by-step visualizations (sorting, BFS / DFS / Dijkstra, BST and AVL rotations, KMP, DP tables, Reed-Solomon). To run it locally: `make web-dev` (details in [web/README.md](web/README.md)).

---

## 🎯 Purpose

This repository serves as:

- 📖 **Learning Resource** - Structured approach to mastering DSA
- 🎯 **Interview Preparation** - Common patterns and problems
- 🏆 **Competitive Programming** - Optimized templates and techniques
- 🔍 **Reference Guide** - Quick lookup for implementations

---

## 📂 Repository Structure

```
dsa-playground/
├── 📁 Data_Structures/
│   ├── 📁 Linear/
│   │   ├── Array/
│   │   ├── String/
│   │   ├── Linked List/
│   │   ├── Stack/
│   │   ├── Queue/
│   │   └── ...
│   │
│   ├── 📁 Non_Linear/
│   │   ├── Trees/
│   │   │   ├── Binary Tree/
│   │   │   ├── Binary Search Tree/
│   │   │   ├── AVL Tree/
│   │   │   ├── Red-Black Tree/
│   │   │   ├── Segment Tree/
│   │   │   ├── Fenwick Tree/
│   │   │   └── ...
│   │   ├── Heaps/
│   │   ├── Graph/
│   │   └── ...
│   │
│   └── 📁 Hashing/
│       └── ...
│
├── 📁 Algorithms/
│   ├── Sorting/
│   ├── Searching/
│   ├── Graph/
│   ├── Dynamic_Programming/
│   └── ...
│
├── 📁 Problem_Patterns/
│   └── ...
│
├── 📁 Complexity_Analysis/
│   ├── Time Complexity/
│   ├── Space Complexity/
│   └── Amortized Analysis/
│
└── 📁 Competitive_Programming/
    ├── Templates/
    ├── Optimization Techniques/
    └── Problem Types/
```

**Note:** Each data structure implementation includes:
- 📁 Python/ (implementation, tests, README)
- 📁 C++/ (implementation, tests, README)
- 📁 Go/ (implementation, tests, README, go.mod)
- 📄 README.md (overview and concepts)

---

## ✅ Progress Checklist

### 1. Data Structures

#### 🔹 Linear Data Structures

- [x] **Array**
  - [x] Static Array
  - [x] Dynamic Array
  - [x] Multi-dimensional Arrays
- [x] **String**
  - [x] String manipulation
  - [x] Pattern matching
  - [x] **Rope** (Efficient String Data Structure)
- [x] **Linked List**
  - [x] Singly Linked List
  - [x] Doubly Linked List
  - [x] Circular Linked List
  - [x] **Skip List** (Advanced Linked List)
- [x] **Stack**
  - [x] Array-based implementation
  - [x] Linked List implementation
  - [x] Applications (Expression evaluation, etc.)
- [x] **Queue**
  - [x] Simple Queue
  - [x] Circular Queue
  - [x] Deque (Double-Ended Queue)
  - [x] Priority Queue

#### 🔹 Non-Linear Data Structures

- [x] **Trees**
  - [x] Binary Tree
  - [x] Binary Search Tree (BST)
  - [x] AVL Tree
  - [x] Red-Black Tree
  - [x] Segment Tree
  - [x] Segment Tree (Lazy Propagation)
  - [x] Fenwick Tree (Binary Indexed Tree)
  - [x] Trie (Prefix Tree)
  - [x] Suffix Tree / Suffix Array
  - [x] B-Tree / B+ Tree
  - [x] Sparse Table
  - [x] Splay Tree (Self-Adjusting BST)
  - [x] Cartesian Tree
  - [x] Interval Tree
  - [x] Treap (Randomized BST)
  - [x] K-D Tree (k-dimensional BST)
- [x] **Heaps**
  - [x] Min Heap
  - [x] Max Heap
  - [x] Fibonacci Heap
- [x] **Graph**
  - [x] Adjacency Matrix
  - [x] Adjacency List
  - [x] Edge List
  - [x] Weighted & Unweighted
  - [x] Directed & Undirected

#### 🔹 Hashing

- [x] **Hash Table** (also the Hash Map)
- [x] **Hash Set**
- [x] **Collision Handling** (Chaining, Open Addressing)
- [x] **Bloom Filter**

#### 🔹 Advanced Structures

- [x] **Disjoint Set Union (DSU)**
- [x] **LRU Cache**
- [x] **LFU Cache** (Least Frequently Used)

---

### 2. Algorithms

#### 🔹 Sorting Algorithms

- [x] **Bubble Sort** - O(n²)
- [x] **Insertion Sort** - O(n²)
- [x] **Selection Sort** - O(n²)
- [x] **Merge Sort** - O(n log n)
- [x] **Quick Sort** - O(n log n) average
- [x] **Heap Sort** - O(n log n)
- [x] **Counting Sort** - O(n + k)
- [x] **Radix Sort** - O(d × (n + k))
- [x] **Bucket Sort** - O(n + k)

#### 🔹 Searching Algorithms

- [x] **Linear Search** - O(n)
- [x] **Binary Search** - O(log n)
- [x] **Ternary Search** - O(log₃ n)
- [x] **Interpolation Search** - O(log log n)

#### 🔹 Divide and Conquer

- [x] **Merge Sort**
- [x] **Quick Sort**
- [x] **Binary Search**
- [x] **Strassen's Matrix Multiplication**
- [x] **Closest Pair of Points**

#### 🔹 Greedy Algorithms

- [x] **Activity Selection**
- [x] **Huffman Coding**
- [x] **Fractional Knapsack**
- [x] **Job Scheduling**
- [x] **Minimum Spanning Tree**
  - [x] Kruskal's Algorithm
  - [x] Prim's Algorithm

#### 🔹 Dynamic Programming

- [x] **Basic DP**
  - [x] Fibonacci Numbers
  - [x] Climbing Stairs
- [x] **Linear DP**
  - [x] Longest Increasing Subsequence (LIS)
  - [x] Maximum Subarray (Kadane's Algorithm)
  - [x] Coin Change
- [x] **2D DP**
  - [x] Longest Common Subsequence (LCS)
  - [x] 0/1 Knapsack
  - [x] Edit Distance
  - [x] Matrix Chain Multiplication
- [x] **Advanced DP**
  - [x] DP on Trees
  - [x] DP on Graphs
  - [x] Bitmask DP
  - [x] Digit DP
- [x] **DP Optimizations**
  - [x] Convex Hull Trick (CHT) & Li Chao Tree

#### 🔹 Graph Algorithms

- [x] **Traversal**
  - [x] BFS (Breadth-First Search)
  - [x] DFS (Depth-First Search)
- [x] **Shortest Path**
  - [x] Dijkstra's Algorithm
  - [x] Bellman-Ford Algorithm
  - [x] Floyd-Warshall Algorithm
  - [x] A\* Search Algorithm
- [x] **Minimum Spanning Tree**
  - [x] Kruskal's Algorithm
  - [x] Prim's Algorithm
- [x] **Advanced Graph**
  - [x] Topological Sort
  - [x] Strongly Connected Components
    - [x] Kosaraju's Algorithm
    - [x] Tarjan's Algorithm
  - [x] Union-Find / DSU
  - [x] Network Flow
    - [x] Ford-Fulkerson
    - [x] Edmonds-Karp
  - [x] Tarjan's Bridges & Articulation Points
  - [x] 2-SAT Solver

#### 🔹 String Algorithms

- [x] **Pattern Matching**
  - [x] Naive Pattern Search
  - [x] KMP Algorithm
  - [x] Rabin-Karp Algorithm
  - [x] Boyer-Moore Algorithm
- [x] **Advanced String**
  - [x] Z-Algorithm
  - [x] Suffix Array / Tree
  - [x] Longest Common Substring
  - [x] Longest Palindromic Substring (Manacher's)
  - [x] Aho-Corasick Algorithm (multi-pattern matching)

#### 🔹 Mathematical Algorithms

- [x] **Number Theory**
  - [x] Euclidean Algorithm (GCD, LCM)
  - [x] Modular Arithmetic
  - [x] Modular Exponentiation
  - [x] Sieve of Eratosthenes
  - [x] Miller-Rabin Primality Test
  - [x] Chinese Remainder Theorem
- [x] **Advanced Math**
  - [x] Fast Fourier Transform (FFT)
  - [x] Matrix Exponentiation

#### 🔹 Computational Geometry

- [x] **Basic Geometry**
  - [x] Point, Line, Circle operations
  - [x] Line Intersection
- [x] **Advanced Geometry**
  - [x] Convex Hull (Graham's Scan, Jarvis March)
  - [x] Closest Pair of Points
  - [x] Rotating Calipers

#### 🔹 Advanced Algorithms

- [x] **Backtracking**
  - [x] N-Queens Problem
  - [x] Sudoku Solver
  - [x] Rat in a Maze
  - [x] Graph Coloring
- [x] **Specialized Techniques**
  - [x] Mo's Algorithm
  - [x] Heavy-Light Decomposition
  - [x] Centroid Decomposition
  - [x] Square Root Decomposition

#### 🔹 Randomized Algorithms

- [x] **Reservoir Sampling** — uniform sampling from a stream of unknown length
- [x] **Randomized Quickselect** — O(n) expected k-th smallest

#### 🔹 Coding Theory (Error Correction)

- [x] **Galois Field GF(2^8)** — finite field arithmetic for AES/Reed-Solomon
- [x] **Reed-Solomon** — encode + Berlekamp-Massey decode + Forney + Chien, with combined error + erasure decoding and configurable fcr (e.g., RS(255, 223) Voyager code)

---

### 3. Problem Solving Patterns

- [x] **Sliding Window**
- [x] **Two Pointers**
- [x] **Binary Search on Answer**
- [x] **Prefix Sum / Difference Array**
- [x] **Union-Find Applications**
- [x] **Graph Traversal Problems**
- [x] **DP Problem Patterns**
- [x] **Meet in the Middle**
- [x] **Coordinate Compression**
- [x] **Inclusion-Exclusion Principle**
- [x] **Monotonic Stack**
- [x] **Monotonic Queue**
- [x] **Bit Manipulation**

---

### 4. Complexity Analysis

- [x] **Time Complexity**
  - [x] Big-O Notation
  - [x] Big-Theta (Θ)
  - [x] Big-Omega (Ω)
- [x] **Space Complexity**
- [x] **Amortized Analysis**

---

### 5. Competitive Programming Utilities

- [x] **Templates**
  - [x] C++ Boilerplate
  - [x] Python Boilerplate
  - [x] Go Boilerplate
- [x] **Optimization Techniques**
  - [x] Fast I/O
  - [x] Modular Arithmetic Tricks
  - [x] Bitmasking
  - [x] Precomputation
- [x] **Problem Types**
  - [x] Interactive Problems
  - [x] Constructive Algorithms
  - [x] Game Theory Basics

---

## 🚀 Getting Started

### Prerequisites

- Basic programming knowledge in at least one language (Python/C++/Go)
- Understanding of basic mathematical concepts
- Familiarity with computer science fundamentals

### How to Use This Repository

1. **Choose your learning path:**

   - 🔰 **Beginner**: Start with Linear Data Structures → Basic Algorithms
   - 🔥 **Intermediate**: Focus on Trees, Graphs, and Dynamic Programming
   - 🚀 **Advanced**: Advanced algorithms and competitive programming

2. **Study Structure:**

   - Read the concept explanation
   - Review the implementation
   - Analyze time/space complexity
   - Solve practice problems
   - Check off completed topics

3. **Practice Approach:**
   - Understand before memorizing
   - Implement from scratch
   - Test with different inputs
   - Optimize when possible

---

## 💻 Implementation Languages

Each algorithm and data structure is implemented in:

- 🐍 **Python** - Readable and beginner-friendly
- ⚡ **C++** - High performance, competitive programming
- 🚀 **Go** - Modern, efficient, and concurrent programming

---

## 📊 Complexity Quick Reference

| Data Structure | Access   | Search   | Insertion | Deletion |
| -------------- | -------- | -------- | --------- | -------- |
| Array          | O(1)     | O(n)     | O(n)      | O(n)     |
| Linked List    | O(n)     | O(n)     | O(1)      | O(1)     |
| Stack          | O(n)     | O(n)     | O(1)      | O(1)     |
| Queue          | O(n)     | O(n)     | O(1)      | O(1)     |
| Hash Table     | -        | O(1)     | O(1)      | O(1)     |
| Binary Tree    | O(n)     | O(n)     | O(n)      | O(n)     |
| BST            | O(log n) | O(log n) | O(log n)  | O(log n) |

---

## 🎯 Learning Roadmap

### Phase 1: Foundation (2-4 weeks)

- Array, String, Linked List
- Stack, Queue
- Basic sorting algorithms
- Linear and binary search

### Phase 2: Intermediate (4-6 weeks)

- Trees (Binary Tree, BST)
- Heaps and Priority Queues
- Hash Tables
- Graph basics (BFS, DFS)
- Introduction to Dynamic Programming

### Phase 3: Advanced (6-8 weeks)

- Advanced Trees (AVL, Segment Tree)
- Advanced Graph Algorithms
- Complex Dynamic Programming
- String Algorithms

### Phase 4: Mastery (Ongoing)

- Competitive Programming Techniques
- Advanced Data Structures
- Optimization and Problem Solving

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### How to Contribute:

1. Fork the repository
2. Create a feature branch
3. Add your implementation with proper documentation
4. Include test cases and examples
5. Submit a pull request

---

## 📚 Additional Resources

### Books

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena
- "Competitive Programming" by Steven Halim

### Online Platforms

- [LeetCode](https://leetcode.com/)
- [HackerRank](https://www.hackerrank.com/)
- [Codeforces](https://codeforces.com/)
- [AtCoder](https://atcoder.jp/)

### Visualization Tools

- [Visualgo](https://visualgo.net/)
- [Algorithm Visualizer](https://algorithm-visualizer.org/)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⭐ Support

If you find this repository helpful, please consider giving it a star! It helps others discover this resource.

---

## 📈 Progress Tracking

**Overall Progress: 165/168 core topics completed (98%)**
_All currently scoped topics are implemented across Python, C++, and Go. Remaining items are in "Longer-Term Backlog" below._

- Data Structures: 52/52 (100%)
  - Linear Data Structures: 18/18 (100%)
  - Non-Linear Data Structures: 24/24 (100%)
    - Trees: 17/17 (100%) _(incl. Treap, K-D Tree)_
    - Heaps: 3/3 (100%)
    - Graph: 5/5 (100%)
  - Hashing: 5/5 (100%)
  - Advanced Structures: 4/4 (100%) _(DSU, LRU Cache, LFU Cache)_
- Algorithms: 82/82 core algorithms (100%)
  - Sorting Algorithms: 9/9 (100%)
  - Searching Algorithms: 4/4 (100%)
  - Divide and Conquer: 5/5 (100%)
  - Greedy Algorithms: 7/7 (100%)
  - Dynamic Programming: 14/14 (100%) _(incl. Convex Hull Trick optimization)_
  - Graph Algorithms: 16/16 (100%) _(incl. MST, SCC, DSU, Network Flow, Tarjan Bridges, 2-SAT)_
  - String Algorithms: 9/9 (100%) _(Pattern Matching + Advanced: Z, Suffix, LCS, Manacher, Aho-Corasick)_
  - Mathematical Algorithms: 8/8 (100%) _(incl. FFT, Matrix Exponentiation)_
  - Computational Geometry: 5/5 (100%)
  - Advanced Algorithms: 8/8 (100%) _(Backtracking + Specialized Techniques incl. HLD)_
  - Randomized Algorithms: 2/2 (100%) _(Reservoir Sampling, Randomized Quickselect)_
- Problem Patterns: 13/13 (100%) _(incl. Monotonic Queue)_
- Complexity Analysis: 5/5 (100%)
  - Time Complexity: 3/3 (100%)
  - Space Complexity: 1/1 (100%)
  - Amortized Analysis: 1/1 (100%)
- Utilities: 10/10 (100%)
  - Templates: 3/3 (100%)
  - Optimization Techniques: 4/4 (100%)
  - Problem Types: 3/3 (100%)

> **Note on directory layout:** The `Data_Structures/Linear/Array/Go/` folder uses sub-modules (`static_array/`, `dynamic_array/`, `multi_dimensional_array/`) — each with its own `go.mod`. They are fully implemented, just nested one level deeper than the Python/C++ counterparts.

---

## 📋 Planned / Future Topics

### ✅ Recently Completed (April 2026)

Previously-planned HIGH-priority topics now shipped with Python + C++ + Go implementations, tests, and beginner-friendly READMEs:

- [x] **LFU Cache** — Least Frequently Used cache eviction
- [x] **Aho-Corasick Algorithm** — Multi-pattern string matching
- [x] **Heavy-Light Decomposition (HLD)** — Efficient tree path queries
- [x] **2-SAT Solver** — Boolean satisfiability via SCC
- [x] **Monotonic Queue** — Sliding window max/min
- [x] **Convex Hull Trick (CHT) & Li Chao Tree** — DP optimization
- [x] **Treap** — Randomized self-balancing BST
- [x] **Tarjan's Bridges & Articulation Points** — Graph criticality
- [x] **Reservoir Sampling & Randomized Quickselect** — randomized algorithms category
- [x] **K-D Tree** — k-dimensional spatial search

### 📌 Longer-Term Backlog (MEDIUM / LOW priority)

- **Approximation Algorithms** — Vertex Cover, TSP approximation
- **Advanced DP Optimizations** — Knuth-Yao, Divide & Conquer DP
- **Persistent Data Structures** — Persistent Segment Tree, Persistent Array
- **Online Algorithms** — Ski Rental, Online Matching, Paging
- **Link-Cut Tree**, **Segment Tree Beats** — advanced specialized structures

---

**Happy Coding! 🚀**

> "The best way to learn algorithms is to implement them yourself." - Unknown

---

_Last Updated: 20 Apr 2026_
_Contributors: Najib Fikri_
