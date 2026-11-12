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

- [Big-O Notation](Complexity_Analysis/Time_Complexity/Big_O_Notation/)
- [Big-Theta (Θ)](Complexity_Analysis/Time_Complexity/Big_Theta/)
- [Big-Omega (Ω)](Complexity_Analysis/Time_Complexity/Big_Omega/)
- [Space Complexity](Complexity_Analysis/Space_Complexity/)
- [Amortized Analysis](Complexity_Analysis/Amortized_Analysis/)

### 2. Linear Data Structures
The primitive building blocks of every other structure.

- [Array](Data_Structures/Linear/Array/) — static and dynamic
- [String](Data_Structures/Linear/String/) — introduction + manipulation
- [Linked List](Data_Structures/Linear/Linked_List/) — singly, doubly, circular
- [Stack](Data_Structures/Linear/Stack/)
- [Queue](Data_Structures/Linear/Queue/) — simple, circular, deque

### 3. Basic Sorting & Searching
Classical algorithms; every interview touches them.

- [Bubble / Selection / Insertion Sort](Algorithms/Sorting/) — O(n²), educational
- [Merge Sort](Algorithms/Sorting/Merge_Sort/) — divide & conquer introduction
- [Quick Sort](Algorithms/Sorting/Quick_Sort/) — pivot strategy matters
- [Linear Search](Algorithms/Searching/Linear_Search/)
- [Binary Search](Algorithms/Searching/Binary_Search/) — **master this**

**Milestone:** you can solve LeetCode Easy problems reliably.

---

## 📅 Phase 2: Core Structures (Week 4-6)

**Goal:** make hash tables, trees, and heaps feel natural.

### 4. Hashing
- [Hash Table / Map / Set](Data_Structures/Hashing/)
- [Collision Handling](Data_Structures/Hashing/Collision_Handling/) — chaining vs open addressing
- [Bloom Filter](Data_Structures/Hashing/Bloom_Filter/) — probabilistic variant

### 5. Trees — Essentials
- [Binary Tree](Data_Structures/Non_Linear/Trees/Binary_Tree/)
- [Binary Search Tree (BST)](Data_Structures/Non_Linear/Trees/Binary_Search_Tree/)
- [AVL Tree](Data_Structures/Non_Linear/Trees/AVL_Tree/) — first balanced BST
- [Trie](Data_Structures/Non_Linear/Trees/Trie/) — string-keyed tree

### 6. Heaps
- [Min / Max Heap](Data_Structures/Non_Linear/Heaps/)
- [Priority Queue](Data_Structures/Linear/Queue/Priority_Queue/) — heap in disguise

### 7. Graph Basics
- [Adjacency List / Matrix](Data_Structures/Non_Linear/Graph/)
- [BFS](Algorithms/Graph_Algorithms/Traversal/BFS/)
- [DFS](Algorithms/Graph_Algorithms/Traversal/DFS/)
- [Topological Sort](Algorithms/Graph_Algorithms/Advanced_Graph/Topological_Sort/)

**Milestone:** you can solve LeetCode Medium problems in trees/graphs.

---

## 📅 Phase 3: Problem Patterns (Week 7-9)

**Goal:** recognize the _shape_ of a problem and pick the right technique.

### 8. Two Pointers & Sliding Window
These two patterns appear in 40%+ of array/string problems.

- [Two Pointers](Problem_Patterns/Two_Pointers/)
- [Sliding Window](Problem_Patterns/Sliding_Window/)
- [Binary Search on Answer](Problem_Patterns/Binary_Search_on_Answer/)

### 9. Prefix Sum & Difference Array
- [Prefix Sum / Difference Array](Problem_Patterns/Prefix_Sum_Difference_Array/)

### 10. Monotonic Structures
- [Monotonic Stack](Problem_Patterns/Monotonic_Stack/)
- [Monotonic Queue](Problem_Patterns/Monotonic_Queue/) — O(n) sliding window max/min

### 11. Dynamic Programming (start here!)
- [Fibonacci / Climbing Stairs](Algorithms/Dynamic_Programming/Basic_DP/) — 1D DP intro
- [Maximum Subarray (Kadane's)](Algorithms/Dynamic_Programming/Linear_DP/Maximum_Subarray_Kadanes_Algorithm/)
- [Longest Increasing Subsequence](Algorithms/Dynamic_Programming/Linear_DP/Longest_Increasing_Subsequence/)
- [Coin Change](Algorithms/Dynamic_Programming/Linear_DP/Coin_Change/)
- [Longest Common Subsequence](Algorithms/Dynamic_Programming/2D_DP/Longest_Common_Subsequence/) — **2D DP gateway**
- [Edit Distance](Algorithms/Dynamic_Programming/2D_DP/Edit_Distance/)
- [0/1 Knapsack](Algorithms/Dynamic_Programming/2D_DP/0_1_Knapsack/)

**Milestone:** you can solve LeetCode Medium DP problems consistently.

---

## 📅 Phase 4: Advanced Algorithms (Week 10-13)

**Goal:** the topics that separate "can pass interviews" from "can tackle ICPC."

### 12. Advanced Graph
- [Dijkstra](Algorithms/Graph_Algorithms/Shortest_Path/Dijkstras_Algorithm/)
- [Bellman-Ford](Algorithms/Graph_Algorithms/Shortest_Path/Bellman_Ford_Algorithm/)
- [Floyd-Warshall](Algorithms/Graph_Algorithms/Shortest_Path/Floyd_Warshall_Algorithm/)
- [MST: Kruskal / Prim](Algorithms/Graph_Algorithms/Minimum_Spanning_Tree/Kruskals_Algorithm/)
- [Union-Find (DSU)](Algorithms/Graph_Algorithms/Advanced_Graph/Union_Find_DSU/) — essential
- [Strongly Connected Components](Algorithms/Graph_Algorithms/Advanced_Graph/Strongly_Connected_Components/)
- [Tarjan's Bridges & Articulation Points](Algorithms/Graph_Algorithms/Advanced_Graph/Tarjan_Bridges_Articulation/)

### 13. Advanced String
- [KMP / Rabin-Karp / Boyer-Moore](Data_Structures/Linear/String/Pattern_Matching/)
- [Z-Algorithm](Algorithms/String_Algorithms/Advanced_String/Z_Algorithm/)
- [Manacher's Algorithm](Algorithms/String_Algorithms/Advanced_String/Longest_Palindromic_Substring_Manachers/)
- [Aho-Corasick](Algorithms/String_Algorithms/Advanced_String/Aho_Corasick/) — multi-pattern

### 14. Advanced Trees
- [Segment Tree](Data_Structures/Non_Linear/Trees/Segment_Tree/)
- [Fenwick Tree (BIT)](Data_Structures/Non_Linear/Trees/Fenwick_Tree/)
- [Segment Tree with Lazy Propagation](Data_Structures/Non_Linear/Trees/Segment_Tree_Lazy_Propagation/)
- [Treap](Data_Structures/Non_Linear/Trees/Treap/) — randomized BST

### 15. Caches (System Design Interview)
- [LRU Cache](Data_Structures/Advanced_Structures/LRU_Cache/)
- [LFU Cache](Data_Structures/Advanced_Structures/LFU_Cache/)

**Milestone:** you can solve LeetCode Hard problems; interview-ready for senior roles.

---

## 📅 Phase 5: Competitive Programming (Week 14+)

**Goal:** the techniques that win ICPC / Codeforces contests.

### 16. Advanced DP
- [DP on Trees](Algorithms/Dynamic_Programming/Advanced_DP/DP_on_Trees/)
- [Bitmask DP](Algorithms/Dynamic_Programming/Advanced_DP/Bitmask_DP/)
- [Digit DP](Algorithms/Dynamic_Programming/Advanced_DP/Digit_DP/)
- [Convex Hull Trick / Li Chao Tree](Algorithms/Dynamic_Programming/DP_Optimizations/Convex_Hull_Trick/) — linear-function optimization

### 17. Decomposition Techniques
- [Square Root Decomposition](Algorithms/Advanced_Algorithms/Specialized_Techniques/Square_Root_Decomposition/)
- [Heavy-Light Decomposition](Algorithms/Advanced_Algorithms/Specialized_Techniques/Heavy_Light_Decomposition/)
- [Centroid Decomposition](Algorithms/Advanced_Algorithms/Specialized_Techniques/Centroid_Decomposition/)
- [Mo's Algorithm](Algorithms/Advanced_Algorithms/Specialized_Techniques/Mos_Algorithm/)

### 18. Special Techniques
- [2-SAT Solver](Algorithms/Graph_Algorithms/Advanced_Graph/2_SAT/) — SAT via SCC
- [Network Flow](Algorithms/Graph_Algorithms/Advanced_Graph/Network_Flow/) — Ford-Fulkerson / Edmonds-Karp
- [FFT](Algorithms/Mathematical_Algorithms/Advanced_Math/Fast_Fourier_Transform/)
- [Matrix Exponentiation](Algorithms/Mathematical_Algorithms/Advanced_Math/Matrix_Exponentiation/)

### 19. Specialized Patterns
- [Meet in the Middle](Problem_Patterns/Meet_in_the_Middle/) — 2^n → 2^(n/2)
- [Coordinate Compression](Problem_Patterns/Coordinate_Compression/)
- [Inclusion-Exclusion Principle](Problem_Patterns/Inclusion_Exclusion_Principle/)

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
