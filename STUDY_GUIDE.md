# 📘 DSA Study Guide — A Structured Learning Path

> A week-by-week curriculum that takes you from "I know basic programming" to "I can tackle advanced competitive programming problems," using only the topics in this repository. Each step has a _single_ directory to study, plus LeetCode / Codeforces problems to practice on.

This is intentionally opinionated — if you're studying DSA for the first time, picking a path is harder than following one. You can safely skip levels you already know, or dig deeper on any topic you find interesting.

---

## 🎯 How to Use This Guide

- **Read the parent README first** — they explain intuition, complexity, and when to use each technique.
- **Pick one language** (recommendation: Python if you're new; C++ for competitive programming; Go if you already know Python and want more performance).
- **Run the tests** — all implementations have `_test.py` / `_test.cpp` / `_test.go` files. Running them confirms your environment works.
- **Solve 3-5 practice problems per topic** — the "Practice Problems" section at the bottom of most topic READMEs has curated LeetCode / Codeforces links.
- **Don't rush.** Depth > breadth. Implementing one sort from scratch teaches more than reading about five.

---

## 📅 Phase 1: Foundations (Week 1-3)

**Goal:** understand how data is represented, how programs use memory, and how to measure algorithm cost.

### 1. Complexity Analysis
Start here — you'll use Big-O notation for the rest of your career.

- [Big-O Notation](Complexity_Analysis/Time%20Complexity/Big-O%20Notation/)
- [Big-Theta (Θ)](Complexity_Analysis/Time%20Complexity/Big-Theta%20(Θ)/)
- [Big-Omega (Ω)](Complexity_Analysis/Time%20Complexity/Big-Omega%20(Ω)/)
- [Space Complexity](Complexity_Analysis/Space%20Complexity/)
- [Amortized Analysis](Complexity_Analysis/Amortized%20Analysis/)

### 2. Linear Data Structures
The primitive building blocks of every other structure.

- [Array](Data%20Structures/Linear/Array/) — static and dynamic
- [String](Data%20Structures/Linear/String/) — introduction + manipulation
- [Linked List](Data%20Structures/Linear/Linked%20List/) — singly, doubly, circular
- [Stack](Data%20Structures/Linear/Stack/)
- [Queue](Data%20Structures/Linear/Queue/) — simple, circular, deque

### 3. Basic Sorting & Searching
Classical algorithms; every interview touches them.

- [Bubble / Selection / Insertion Sort](Algorithms/Sorting/) — O(n²), educational
- [Merge Sort](Algorithms/Sorting/Merge%20Sort/) — divide & conquer introduction
- [Quick Sort](Algorithms/Sorting/Quick%20Sort/) — pivot strategy matters
- [Linear Search](Algorithms/Searching/Linear%20Search/)
- [Binary Search](Algorithms/Searching/Binary%20Search/) — **master this**

**Milestone:** you can solve LeetCode Easy problems reliably.

---

## 📅 Phase 2: Core Structures (Week 4-6)

**Goal:** make hash tables, trees, and heaps feel natural.

### 4. Hashing
- [Hash Table / Map / Set](Data%20Structures/Hashing/)
- [Collision Handling](Data%20Structures/Hashing/Collision%20Handling/) — chaining vs open addressing
- [Bloom Filter](Data%20Structures/Hashing/Bloom%20Filter/) — probabilistic variant

### 5. Trees — Essentials
- [Binary Tree](Data%20Structures/Non_Linear/Trees/Binary%20Tree/)
- [Binary Search Tree (BST)](Data%20Structures/Non_Linear/Trees/Binary%20Search%20Tree/)
- [AVL Tree](Data%20Structures/Non_Linear/Trees/AVL%20Tree/) — first balanced BST
- [Trie](Data%20Structures/Non_Linear/Trees/Trie/) — string-keyed tree

### 6. Heaps
- [Min / Max Heap](Data%20Structures/Non_Linear/Heaps/)
- [Priority Queue](Data%20Structures/Linear/Queue/Priority%20Queue/) — heap in disguise

### 7. Graph Basics
- [Adjacency List / Matrix](Data%20Structures/Non_Linear/Graph/)
- [BFS](Algorithms/Graph_Algorithms/Traversal/BFS/)
- [DFS](Algorithms/Graph_Algorithms/Traversal/DFS/)
- [Topological Sort](Algorithms/Graph_Algorithms/Advanced_Graph/Topological_Sort/)

**Milestone:** you can solve LeetCode Medium problems in trees/graphs.

---

## 📅 Phase 3: Problem Patterns (Week 7-9)

**Goal:** recognize the _shape_ of a problem and pick the right technique.

### 8. Two Pointers & Sliding Window
These two patterns appear in 40%+ of array/string problems.

- [Two Pointers](Problem_Patterns/Two%20Pointers/)
- [Sliding Window](Problem_Patterns/Sliding%20Window/)
- [Binary Search on Answer](Problem_Patterns/Binary%20Search%20on%20Answer/)

### 9. Prefix Sum & Difference Array
- [Prefix Sum / Difference Array](Problem_Patterns/Prefix%20Sum%20Difference%20Array/)

### 10. Monotonic Structures
- [Monotonic Stack](Problem_Patterns/Monotonic%20Stack/)
- [Monotonic Queue](Problem_Patterns/Monotonic%20Queue/) — O(n) sliding window max/min

### 11. Dynamic Programming (start here!)
- [Fibonacci / Climbing Stairs](Algorithms/Dynamic_Programming/Basic%20DP/) — 1D DP intro
- [Maximum Subarray (Kadane's)](Algorithms/Dynamic_Programming/Linear%20DP/Maximum%20Subarray/)
- [Longest Increasing Subsequence](Algorithms/Dynamic_Programming/Linear%20DP/Longest%20Increasing%20Subsequence/)
- [Coin Change](Algorithms/Dynamic_Programming/Linear%20DP/Coin%20Change/)
- [Longest Common Subsequence](Algorithms/Dynamic_Programming/2D%20DP/Longest%20Common%20Subsequence/) — **2D DP gateway**
- [Edit Distance](Algorithms/Dynamic_Programming/2D%20DP/Edit%20Distance/)
- [0/1 Knapsack](Algorithms/Dynamic_Programming/2D%20DP/0-1%20Knapsack/)

**Milestone:** you can solve LeetCode Medium DP problems consistently.

---

## 📅 Phase 4: Advanced Algorithms (Week 10-13)

**Goal:** the topics that separate "can pass interviews" from "can tackle ICPC."

### 12. Advanced Graph
- [Dijkstra](Algorithms/Graph_Algorithms/Shortest_Path/Dijkstra's_Algorithm/)
- [Bellman-Ford](Algorithms/Graph_Algorithms/Shortest_Path/Bellman-Ford_Algorithm/)
- [Floyd-Warshall](Algorithms/Graph_Algorithms/Shortest_Path/Floyd-Warshall_Algorithm/)
- [MST: Kruskal / Prim](Algorithms/Graph_Algorithms/Minimum_Spanning_Tree/)
- [Union-Find (DSU)](Algorithms/Graph_Algorithms/Advanced_Graph/Union-Find_DSU/) — essential
- [Strongly Connected Components](Algorithms/Graph_Algorithms/Advanced_Graph/Strongly_Connected_Components/)
- [Tarjan's Bridges & Articulation Points](Algorithms/Graph_Algorithms/Advanced_Graph/Tarjan_Bridges_Articulation/)

### 13. Advanced String
- [KMP / Rabin-Karp / Boyer-Moore](Data%20Structures/Linear/String/Pattern%20Matching/)
- [Z-Algorithm](Algorithms/String_Algorithms/Advanced_String/Z-Algorithm/)
- [Manacher's Algorithm](Algorithms/String_Algorithms/Advanced_String/Longest%20Palindromic%20Substring%20(Manacher's)/)
- [Aho-Corasick](Algorithms/String_Algorithms/Advanced_String/Aho-Corasick/) — multi-pattern

### 14. Advanced Trees
- [Segment Tree](Data%20Structures/Non_Linear/Trees/Segment%20Tree/)
- [Fenwick Tree (BIT)](Data%20Structures/Non_Linear/Trees/Fenwick%20Tree/)
- [Segment Tree with Lazy Propagation](Data%20Structures/Non_Linear/Trees/Segment%20Tree%20(Lazy%20Propagation)/)
- [Treap](Data%20Structures/Non_Linear/Trees/Treap/) — randomized BST

### 15. Caches (System Design Interview)
- [LRU Cache](Data%20Structures/Advanced_Structures/LRU%20Cache/)
- [LFU Cache](Data%20Structures/Advanced_Structures/LFU%20Cache/)

**Milestone:** you can solve LeetCode Hard problems; interview-ready for senior roles.

---

## 📅 Phase 5: Competitive Programming (Week 14+)

**Goal:** the techniques that win ICPC / Codeforces contests.

### 16. Advanced DP
- [DP on Trees](Algorithms/Dynamic_Programming/Advanced%20DP/DP%20on%20Trees/)
- [Bitmask DP](Algorithms/Dynamic_Programming/Advanced%20DP/Bitmask%20DP/)
- [Digit DP](Algorithms/Dynamic_Programming/Advanced%20DP/Digit%20DP/)
- [Convex Hull Trick / Li Chao Tree](Algorithms/Dynamic_Programming/DP_Optimizations/Convex_Hull_Trick/) — linear-function optimization

### 17. Decomposition Techniques
- [Square Root Decomposition](Algorithms/Advanced_Algorithms/Specialized%20Techniques/Square%20Root%20Decomposition/)
- [Heavy-Light Decomposition](Algorithms/Advanced_Algorithms/Specialized%20Techniques/Heavy-Light%20Decomposition/)
- [Centroid Decomposition](Algorithms/Advanced_Algorithms/Specialized%20Techniques/Centroid%20Decomposition/)
- [Mo's Algorithm](Algorithms/Advanced_Algorithms/Specialized%20Techniques/Mo's%20Algorithm/)

### 18. Special Techniques
- [2-SAT Solver](Algorithms/Graph_Algorithms/Advanced_Graph/2-SAT/) — SAT via SCC
- [Network Flow](Algorithms/Graph_Algorithms/Advanced_Graph/Network_Flow/) — Ford-Fulkerson / Edmonds-Karp
- [FFT](Algorithms/Mathematical_Algorithms/Advanced%20Math/Fast%20Fourier%20Transform%20(FFT)/)
- [Matrix Exponentiation](Algorithms/Mathematical_Algorithms/Advanced%20Math/Matrix%20Exponentiation/)

### 19. Specialized Patterns
- [Meet in the Middle](Problem_Patterns/Meet%20in%20the%20Middle/) — 2^n → 2^(n/2)
- [Coordinate Compression](Problem_Patterns/Coordinate%20Compression/)
- [Inclusion-Exclusion Principle](Problem_Patterns/Inclusion-Exclusion%20Principle/)

**Milestone:** Codeforces Div 2 A-D reliably; eligible for ICPC regionals.

---

## 🎓 Learning Tips

1. **Implement before memorizing.** Every topic here has full implementations — read them, then close the file and write your own from scratch.
2. **Test edge cases.** Empty input, single element, duplicates, sorted / reversed input. The test files in this repo demonstrate what to check.
3. **Understand the _why_, not just the _how_.** Each parent README has a "When to use / When NOT to use" section — that's the interview-critical knowledge.
4. **Time yourself.** If you can't solve a Medium LeetCode problem in 30 minutes, review the pattern, don't just read the answer.
5. **Revisit old topics.** DSA knowledge compounds — after learning DP, come back to graph algorithms; you'll see them differently.

---

## 🔗 Resource Recommendations

- **Books**: _Introduction to Algorithms_ (CLRS), _Competitive Programming_ (Halim), _The Algorithm Design Manual_ (Skiena)
- **Problem sets**: LeetCode (interview prep), Codeforces (contests), AtCoder DP Contest (DP mastery), CSES Problem Set (complete catalog)
- **Visualizations**: [VisuAlgo](https://visualgo.net/), [Algorithm Visualizer](https://algorithm-visualizer.org/)
- **Theory**: [CP-Algorithms](https://cp-algorithms.com/), [USACO Guide](https://usaco.guide/)

---

**Happy learning! 🚀** Every topic in this repo is there because it matters. Take your time — depth beats breadth.
