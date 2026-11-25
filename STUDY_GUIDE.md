# DSA Study Guide

A week-by-week path through every topic in this repository, from basic programming to competitive programming. Each phase has a goal, its topics in reading order, and a milestone. The order agrees with the READMEs of each area.

## How to Use This Guide

- Follow the phases in order; inside a phase, follow the sections and the order of the topics. Skip what you already know.
- Pick one language. Every topic has Python, C++ and Go code with tests; Python is gentle for a first pass and C++ is the usual choice for contests.
- Read the topic article first, then read the code, close it, and write your own version. Run the tests to check it.
- Solve a few practice problems per topic before you move on. Depth matters more than speed.
- The level after each topic (Beginner, Intermediate, Advanced) comes from its article. Weeks are a guide, not a deadline.

## Contents

- [Phase 1: Foundations (Weeks 1-3)](#phase-1-foundations-weeks-1-3)
- [Phase 2: Core Structures (Weeks 4-6)](#phase-2-core-structures-weeks-4-6)
- [Phase 3: Problem Patterns (Weeks 7-10)](#phase-3-problem-patterns-weeks-7-10)
- [Phase 4: Advanced Algorithms and Structures (Weeks 11-15)](#phase-4-advanced-algorithms-and-structures-weeks-11-15)
- [Phase 5: Competitive Programming (Week 16 onward)](#phase-5-competitive-programming-week-16-onward)

## Phase 1: Foundations (Weeks 1-3)

**Goal:** Measure the cost of code, then learn the sequences and the first sorts and searches. (24 topics)

**Why this order:** Everything later is judged by its cost, and every other structure is built from arrays, nodes, stacks and queues.

### Complexity analysis

Big-O, Big-Omega and Big-Theta are bounds on a function; best, average and worst are cases. Any case can take any bound.

- [Big-O Notation](Complexity_Analysis/Time_Complexity/Big_O_Notation/) (Beginner)
- [Big-Omega Notation](Complexity_Analysis/Time_Complexity/Big_Omega/) (Intermediate)
- [Big-Theta Notation](Complexity_Analysis/Time_Complexity/Big_Theta/) (Intermediate)
- [Space Complexity](Complexity_Analysis/Space_Complexity/) (Beginner)
- [Amortized Analysis](Complexity_Analysis/Amortized_Analysis/) (Intermediate)

### Arrays and strings

- [Array](Data_Structures/Linear/Array/) (Beginner)
- [Introduction to Strings](Data_Structures/Linear/String/String_Basics/) (Beginner)
- [String Manipulation](Data_Structures/Linear/String/String_Manipulation/) (Beginner)

### Linked lists, stacks and queues

The priority queue waits for heaps in Phase 2.

- [Singly Linked List](Data_Structures/Linear/Linked_List/Singly/) (Beginner)
- [Doubly Linked List](Data_Structures/Linear/Linked_List/Doubly/) (Intermediate)
- [Circular Linked List](Data_Structures/Linear/Linked_List/Circular/) (Intermediate)
- [Static Size Array Stack](Data_Structures/Linear/Stack/Static_Array_Stack/) (Beginner)
- [Dynamic Size Array Stack](Data_Structures/Linear/Stack/Dynamic_Array_Stack/) (Beginner)
- [Linked List Stack](Data_Structures/Linear/Stack/Linked_List_Stack/) (Beginner)
- [Simple Queue](Data_Structures/Linear/Queue/Simple_Queue/) (Beginner)
- [Circular Queue](Data_Structures/Linear/Queue/Circular_Queue/) (Beginner)
- [Deque](Data_Structures/Linear/Queue/Deque/) (Beginner)

### Basic sorting and searching

Binary search is the one to master.

- [Bubble Sort](Algorithms/Sorting/Bubble_Sort/) (Beginner)
- [Insertion Sort](Algorithms/Sorting/Insertion_Sort/) (Beginner)
- [Shell Sort](Algorithms/Sorting/Shell_Sort/) (Intermediate)
- [Selection Sort](Algorithms/Sorting/Selection_Sort/) (Beginner)
- [Merge Sort](Algorithms/Sorting/Merge_Sort/) (Intermediate)
- [Timsort](Algorithms/Sorting/Timsort/) (Advanced)
- [Quick Sort](Algorithms/Sorting/Quick_Sort/) (Intermediate)
- [Linear Search](Algorithms/Searching/Linear_Search/) (Beginner)
- [Binary Search](Algorithms/Searching/Binary_Search/) (Beginner)

**Milestone:** you can state the cost of a loop or a recursion, and solve LeetCode Easy problems reliably.

## Phase 2: Core Structures (Weeks 4-6)

**Goal:** Make hash tables, trees, heaps and graphs feel natural, and traverse a graph. (23 topics)

**Why this order:** Hashing and trees come first, heaps reuse the tree idea, and the graph layouts must exist before BFS and DFS can run on them.

### Hashing

- [Hash Table](Data_Structures/Hashing/Hash_Table/) (Beginner)
- [Collision Handling](Data_Structures/Hashing/Collision_Handling/) (Intermediate)
- [Hash Set](Data_Structures/Hashing/Hash_Set/) (Beginner)
- [Bloom Filter](Data_Structures/Hashing/Bloom_Filter/) (Intermediate)

### Trees

Binary tree and BST first; the AVL tree shows how balancing keeps O(log n).

- [Binary Tree](Data_Structures/Non_Linear/Trees/Binary_Tree/) (Beginner)
- [Binary Search Tree](Data_Structures/Non_Linear/Trees/Binary_Search_Tree/) (Beginner)
- [AVL Tree](Data_Structures/Non_Linear/Trees/AVL_Tree/) (Intermediate)
- [Trie](Data_Structures/Non_Linear/Trees/Trie/) (Intermediate)

### Heaps and the sorts that use them

- [Min Heap](Data_Structures/Non_Linear/Heaps/Min_Heap/) (Intermediate)
- [Max Heap](Data_Structures/Non_Linear/Heaps/Max_Heap/) (Intermediate)
- [Priority Queue](Data_Structures/Linear/Queue/Priority_Queue/) (Intermediate)
- [Heap Sort](Algorithms/Sorting/Heap_Sort/) (Intermediate)
- [Counting Sort](Algorithms/Sorting/Counting_Sort/) (Intermediate)
- [Radix Sort](Algorithms/Sorting/Radix_Sort/) (Intermediate)
- [Bucket Sort](Algorithms/Sorting/Bucket_Sort/) (Intermediate)

### Graph representations

- [Adjacency List](Data_Structures/Non_Linear/Graph/Adjacency_List/) (Beginner)
- [Adjacency Matrix](Data_Structures/Non_Linear/Graph/Adjacency_Matrix/) (Beginner)
- [Edge List](Data_Structures/Non_Linear/Graph/Edge_List/) (Beginner)
- [Directed and Undirected Graphs](Data_Structures/Non_Linear/Graph/Directed_and_Undirected/) (Beginner)
- [Weighted and Unweighted Graphs](Data_Structures/Non_Linear/Graph/Weighted_and_Unweighted/) (Beginner)

### Graph basics

- [Breadth-First Search (BFS)](Algorithms/Graph_Algorithms/Traversal/BFS/) (Beginner)
- [Depth-First Search (DFS)](Algorithms/Graph_Algorithms/Traversal/DFS/) (Beginner)
- [Topological Sort](Algorithms/Graph_Algorithms/Advanced_Graph/Topological_Sort/) (Intermediate)

**Milestone:** you can solve LeetCode Medium problems on trees and graphs.

## Phase 3: Problem Patterns (Weeks 7-10)

**Goal:** Recognize the shape of a problem and pick the technique, including greedy, backtracking and your first dynamic programming. (28 topics)

**Why this order:** The scan patterns come first because they need only arrays; groups, greedy and backtracking follow; DP comes last because it builds on all of them.

### Array and string patterns

These patterns appear in a large share of array and string problems.

- [Two Pointers](Problem_Patterns/Two_Pointers/) (Beginner)
- [Sliding Window](Problem_Patterns/Sliding_Window/) (Beginner)
- [Prefix Sum and Difference Array](Problem_Patterns/Prefix_Sum_Difference_Array/) (Beginner)
- [Binary Search on Answer](Problem_Patterns/Binary_Search_on_Answer/) (Intermediate)
- [Ternary Search](Algorithms/Searching/Ternary_Search/) (Intermediate)
- [Interpolation Search](Algorithms/Searching/Interpolation_Search/) (Intermediate)

### Monotonic structures

- [Monotonic Stack](Problem_Patterns/Monotonic_Stack/) (Intermediate)
- [Monotonic Queue](Problem_Patterns/Monotonic_Queue/) (Intermediate)

### Groups and graph problems

- [Disjoint Set Union](Data_Structures/Advanced_Structures/Disjoint_Set_Union/) (Intermediate)
- [Union-Find Applications](Problem_Patterns/Union_Find_Applications/) (Intermediate)
- [Graph Traversal Problems](Problem_Patterns/Graph_Traversal_Problems/) (Intermediate)

### Greedy

A greedy choice needs a proof; when it fails, DP is the usual fallback.

- [Activity Selection](Algorithms/Greedy/Activity_Selection/) (Beginner)
- [Fractional Knapsack](Algorithms/Greedy/Fractional_Knapsack/) (Beginner)
- [Huffman Coding](Algorithms/Greedy/Huffman_Coding/) (Intermediate)
- [Job Scheduling](Algorithms/Greedy/Job_Scheduling/) (Intermediate)

### Backtracking

- [Rat in a Maze](Algorithms/Advanced_Algorithms/Backtracking/Rat_in_a_Maze/) (Beginner)
- [N-Queens Problem](Algorithms/Advanced_Algorithms/Backtracking/N_Queens_Problem/) (Intermediate)
- [Graph Coloring](Algorithms/Advanced_Algorithms/Backtracking/Graph_Coloring/) (Intermediate)
- [Sudoku Solver](Algorithms/Advanced_Algorithms/Backtracking/Sudoku_Solver/) (Intermediate)

### Dynamic programming

Coin Change is the first problem where greedy fails; LCS opens 2D tables; the recipe topic ties them together.

- [Fibonacci Numbers](Algorithms/Dynamic_Programming/Basic_DP/Fibonacci_Numbers/) (Beginner)
- [Climbing Stairs](Algorithms/Dynamic_Programming/Basic_DP/Climbing_Stairs/) (Beginner)
- [Coin Change](Algorithms/Dynamic_Programming/Linear_DP/Coin_Change/) (Intermediate)
- [Longest Increasing Subsequence](Algorithms/Dynamic_Programming/Linear_DP/Longest_Increasing_Subsequence/) (Intermediate)
- [Maximum Subarray (Kadane's Algorithm)](Algorithms/Dynamic_Programming/Linear_DP/Maximum_Subarray_Kadanes_Algorithm/) (Intermediate)
- [Longest Common Subsequence](Algorithms/Dynamic_Programming/2D_DP/Longest_Common_Subsequence/) (Intermediate)
- [Edit Distance](Algorithms/Dynamic_Programming/2D_DP/Edit_Distance/) (Intermediate)
- [0/1 Knapsack](Algorithms/Dynamic_Programming/2D_DP/0_1_Knapsack/) (Intermediate)
- [DP Problem Patterns](Problem_Patterns/DP_Problem_Patterns/) (Intermediate)

**Milestone:** you can solve LeetCode Medium problems with patterns and DP consistently.

## Phase 4: Advanced Algorithms and Structures (Weeks 11-15)

**Goal:** Learn the topics that separate passing interviews from solving contest problems. (52 topics)

**Why this order:** Graph algorithms reuse the Phase 2 structures, strings reuse the trie, range structures come before the specialist trees, and bitmask DP needs bit manipulation.

### Shortest paths and spanning trees

Dijkstra first; the others each change one assumption.

- [Dijkstra's Algorithm](Algorithms/Graph_Algorithms/Shortest_Path/Dijkstras_Algorithm/) (Intermediate)
- [0-1 BFS](Algorithms/Graph_Algorithms/Shortest_Path/0_1_BFS/) (Intermediate)
- [Bellman-Ford Algorithm](Algorithms/Graph_Algorithms/Shortest_Path/Bellman_Ford_Algorithm/) (Intermediate)
- [Floyd-Warshall Algorithm](Algorithms/Graph_Algorithms/Shortest_Path/Floyd_Warshall_Algorithm/) (Intermediate)
- [A* Search](Algorithms/Graph_Algorithms/Shortest_Path/A_Star_Search_Algorithm/) (Intermediate)
- [Kruskal's Algorithm](Algorithms/Graph_Algorithms/Minimum_Spanning_Tree/Kruskals_Algorithm/) (Intermediate)
- [Prim's Algorithm](Algorithms/Graph_Algorithms/Minimum_Spanning_Tree/Prims_Algorithm/) (Intermediate)

### Advanced graphs

Eulerian paths need only degrees and connectivity; SCC, bridges and 2-SAT reuse DFS; network flow is self-contained.

- [Eulerian Path and Circuit](Algorithms/Graph_Algorithms/Advanced_Graph/Eulerian_Path/) (Intermediate)
- [Kosaraju's Algorithm](Algorithms/Graph_Algorithms/Advanced_Graph/Strongly_Connected_Components/Kosarajus_Algorithm/) (Advanced)
- [Tarjan's SCC Algorithm](Algorithms/Graph_Algorithms/Advanced_Graph/Strongly_Connected_Components/Tarjans_Algorithm/) (Advanced)
- [Bridges and Articulation Points](Algorithms/Graph_Algorithms/Advanced_Graph/Tarjan_Bridges_Articulation/) (Advanced)
- [2-SAT](Algorithms/Graph_Algorithms/Advanced_Graph/2_SAT/) (Advanced)
- [Ford-Fulkerson Method](Algorithms/Graph_Algorithms/Advanced_Graph/Network_Flow/Ford_Fulkerson/) (Advanced)
- [Edmonds-Karp Algorithm](Algorithms/Graph_Algorithms/Advanced_Graph/Network_Flow/Edmonds_Karp/) (Advanced)
- [Dinic's Algorithm](Algorithms/Graph_Algorithms/Advanced_Graph/Network_Flow/Dinic/) (Advanced)
- [Bipartite Matching](Algorithms/Graph_Algorithms/Advanced_Graph/Bipartite_Matching/) (Advanced)

### String algorithms

KMP's border table is the idea most later algorithms borrow.

- [Naive Pattern Search](Algorithms/String_Algorithms/Pattern_Matching/Naive_Pattern_Search/) (Beginner)
- [Rabin-Karp Algorithm](Algorithms/String_Algorithms/Pattern_Matching/Rabin_Karp_Algorithm/) (Intermediate)
- [Knuth-Morris-Pratt (KMP) Algorithm](Algorithms/String_Algorithms/Pattern_Matching/KMP_Algorithm/) (Intermediate)
- [Boyer-Moore Algorithm](Algorithms/String_Algorithms/Pattern_Matching/Boyer_Moore_Algorithm/) (Intermediate)
- [Z-Algorithm](Algorithms/String_Algorithms/Advanced_String/Z_Algorithm/) (Intermediate)
- [String Hashing](Algorithms/String_Algorithms/Advanced_String/String_Hashing/) (Intermediate)
- [Aho-Corasick](Algorithms/String_Algorithms/Advanced_String/Aho_Corasick/) (Advanced)
- [Suffix Array](Algorithms/String_Algorithms/Advanced_String/Suffix_Array/) (Advanced)
- [Manacher's Algorithm](Algorithms/String_Algorithms/Advanced_String/Longest_Palindromic_Substring_Manachers/) (Advanced)
- [Longest Common Substring](Algorithms/String_Algorithms/Advanced_String/Longest_Common_Substring/) (Intermediate)

### Range-query structures

- [Fenwick Tree](Data_Structures/Non_Linear/Trees/Fenwick_Tree/) (Intermediate)
- [Segment Tree](Data_Structures/Non_Linear/Trees/Segment_Tree/) (Intermediate)
- [Segment Tree (Lazy Propagation)](Data_Structures/Non_Linear/Trees/Segment_Tree_Lazy_Propagation/) (Advanced)
- [Sparse Table](Data_Structures/Non_Linear/Trees/Sparse_Table/) (Intermediate)
- [Coordinate Compression](Problem_Patterns/Coordinate_Compression/) (Intermediate)

### Balanced and specialist trees

- [Red-Black Tree](Data_Structures/Non_Linear/Trees/Red_Black_Tree/) (Advanced)
- [Splay Tree](Data_Structures/Non_Linear/Trees/Splay_Tree/) (Advanced)
- [Treap](Data_Structures/Non_Linear/Trees/Treap/) (Advanced)
- [Cartesian Tree](Data_Structures/Non_Linear/Trees/Cartesian_Tree/) (Advanced)
- [Interval Tree](Data_Structures/Non_Linear/Trees/Interval_Tree/) (Advanced)
- [K-D Tree](Data_Structures/Non_Linear/Trees/K_D_Tree/) (Advanced)
- [B-Tree](Data_Structures/Non_Linear/Trees/B_Tree/) (Advanced)
- [B+ Tree](Data_Structures/Non_Linear/Trees/B_Plus_Tree/) (Advanced)
- [Suffix Tree](Data_Structures/Non_Linear/Trees/Suffix_Tree/) (Advanced)

### Other advanced structures

The caches are common in system-design interviews.

- [Skip List](Data_Structures/Linear/Linked_List/Skip_List/) (Advanced)
- [Rope](Data_Structures/Linear/String/Rope/) (Advanced)
- [Fibonacci Heap](Data_Structures/Non_Linear/Heaps/Fibonacci_Heap/) (Advanced)
- [LRU Cache](Data_Structures/Advanced_Structures/LRU_Cache/) (Intermediate)
- [LFU Cache](Data_Structures/Advanced_Structures/LFU_Cache/) (Advanced)

### Advanced dynamic programming

Bit manipulation first, because bitmask DP stores a subset in an integer.

- [Bit Manipulation](Problem_Patterns/Bit_Manipulation/) (Intermediate)
- [Matrix Chain Multiplication](Algorithms/Dynamic_Programming/2D_DP/Matrix_Chain_Multiplication/) (Advanced)
- [DP on Trees](Algorithms/Dynamic_Programming/Advanced_DP/DP_on_Trees/) (Advanced)
- [DP on Graphs](Algorithms/Dynamic_Programming/Advanced_DP/DP_on_Graphs/) (Advanced)
- [Bitmask DP](Algorithms/Dynamic_Programming/Advanced_DP/Bitmask_DP/) (Advanced)
- [Digit DP](Algorithms/Dynamic_Programming/Advanced_DP/Digit_DP/) (Advanced)
- [Convex Hull Trick and Li Chao Tree](Algorithms/Dynamic_Programming/DP_Optimizations/Convex_Hull_Trick/) (Advanced)

**Milestone:** you can solve LeetCode Hard problems and are interview-ready for senior roles.

## Phase 5: Competitive Programming (Week 16 onward)

**Goal:** Pick up the techniques that win contests, plus the utilities around them. (32 topics)

**Why this order:** Decompositions need segment trees and DFS, number theory comes before matrix exponentiation and FFT, and the utilities are used together with all of it.

### Decomposition techniques

Array side first (square root, Mo), then the tree side (lowest common ancestor, heavy-light, centroid).

- [Square Root Decomposition](Algorithms/Advanced_Algorithms/Specialized_Techniques/Square_Root_Decomposition/) (Intermediate)
- [Mo's Algorithm](Algorithms/Advanced_Algorithms/Specialized_Techniques/Mos_Algorithm/) (Advanced)
- [Lowest Common Ancestor](Algorithms/Advanced_Algorithms/Specialized_Techniques/Lowest_Common_Ancestor/) (Advanced)
- [Heavy-Light Decomposition](Algorithms/Advanced_Algorithms/Specialized_Techniques/Heavy_Light_Decomposition/) (Advanced)
- [Centroid Decomposition](Algorithms/Advanced_Algorithms/Specialized_Techniques/Centroid_Decomposition/) (Advanced)

### Number theory and matrices

CRT builds on extended Euclid, Euler's totient on the sieve, Miller-Rabin on modular exponentiation, combinatorics takes its one modular inverse from Euler's theorem, matrix exponentiation reuses square and multiply, and Gaussian elimination divides modulo a prime with the same inverse.

- [Euclidean Algorithm](Algorithms/Mathematical_Algorithms/Number_Theory/Euclidean_Algorithm/) (Beginner)
- [Modular Arithmetic](Algorithms/Mathematical_Algorithms/Number_Theory/Modular_Arithmetic/) (Beginner)
- [Modular Exponentiation](Algorithms/Mathematical_Algorithms/Number_Theory/Modular_Exponentiation/) (Beginner)
- [Chinese Remainder Theorem](Algorithms/Mathematical_Algorithms/Number_Theory/Chinese_Remainder_Theorem/) (Intermediate)
- [Sieve of Eratosthenes](Algorithms/Mathematical_Algorithms/Number_Theory/Sieve_of_Eratosthenes/) (Beginner)
- [Euler's Totient](Algorithms/Mathematical_Algorithms/Number_Theory/Eulers_Totient/) (Intermediate)
- [Miller-Rabin Primality Test](Algorithms/Mathematical_Algorithms/Number_Theory/Miller_Rabin_Primality_Test/) (Advanced)
- [Combinatorics](Algorithms/Mathematical_Algorithms/Advanced_Math/Combinatorics/) (Intermediate)
- [Matrix Exponentiation](Algorithms/Mathematical_Algorithms/Advanced_Math/Matrix_Exponentiation/) (Intermediate)
- [Gaussian Elimination](Algorithms/Mathematical_Algorithms/Advanced_Math/Gaussian_Elimination/) (Intermediate)
- [Fast Fourier Transform](Algorithms/Mathematical_Algorithms/Advanced_Math/Fast_Fourier_Transform/) (Advanced)
- [Number Theoretic Transform](Algorithms/Mathematical_Algorithms/Advanced_Math/Number_Theoretic_Transform/) (Advanced)
- [Strassen's Matrix Multiplication](Algorithms/Divide_and_Conquer/Strassens_Matrix_Multiplication/) (Advanced)

### Counting and search tricks

- [Inclusion-Exclusion Principle](Problem_Patterns/Inclusion_Exclusion_Principle/) (Intermediate)
- [Meet in the Middle](Problem_Patterns/Meet_in_the_Middle/) (Advanced)

### Computational geometry

Convex hull first; rotating calipers takes a hull as input; closest pair is independent.

- [Point, Line and Circle](Algorithms/Computational_Geometry/Basic_Geometry/Point_Line_Circle/) (Beginner)
- [Line Intersection](Algorithms/Computational_Geometry/Basic_Geometry/Line_Intersection/) (Intermediate)
- [Convex Hull](Algorithms/Computational_Geometry/Advanced_Geometry/Convex_Hull/) (Intermediate)
- [Rotating Calipers](Algorithms/Computational_Geometry/Advanced_Geometry/Rotating_Calipers/) (Advanced)
- [Closest Pair of Points](Algorithms/Computational_Geometry/Advanced_Geometry/Closest_Pair_of_Points/) (Advanced)

### Randomized algorithms and coding theory

- [Randomized Quickselect](Algorithms/Randomized_Algorithms/Randomized_Quickselect/) (Intermediate)
- [Reservoir Sampling](Algorithms/Randomized_Algorithms/Reservoir_Sampling/) (Intermediate)
- [Galois Field GF(2^8)](Algorithms/Coding_Theory/Galois_Field/) (Advanced)
- [Reed-Solomon Codes](Algorithms/Coding_Theory/Reed_Solomon/) (Advanced)

### Utilities for contests

Start from the [templates](Utilities/Templates/); these topics make a correct solution fast enough or cover problems defined by their format.

- [Fast I/O](Utilities/Optimization_Techniques/Fast_IO/) (Beginner)
- [Precomputation](Utilities/Optimization_Techniques/Precomputation/) (Intermediate)
- [Bitmasking](Utilities/Optimization_Techniques/Bitmasking/) (Intermediate)
- [Modular Arithmetic Tricks](Utilities/Optimization_Techniques/Modular_Arithmetic_Tricks/) (Intermediate)
- [Constructive Algorithms](Utilities/Problem_Types/Constructive_Algorithms/) (Intermediate)
- [Interactive Problems](Utilities/Problem_Types/Interactive_Problems/) (Intermediate)
- [Game Theory (Nim and Sprague-Grundy)](Utilities/Problem_Types/Game_Theory/) (Advanced)

**Milestone:** you solve Codeforces Div 2 A-D reliably and can read an unfamiliar problem for its technique.

## Learning Tips

1. Implement before memorizing. Read an implementation, close it, and write your own from scratch.
2. Test edge cases: empty input, one element, duplicates, sorted and reversed input.
3. Learn when not to use a technique as well as when to use it. Each area README has a Choosing section and a list of common pitfalls.
4. Time yourself. If a Medium problem takes more than 30 minutes, review the pattern before you read the answer.
5. Revisit old topics. After DP, graph algorithms look different.
