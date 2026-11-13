# Greedy Algorithms

A greedy algorithm builds an answer one step at a time and always takes the choice that looks best right now, without looking back. The four topics here show where that works, and each one pairs a rule with the reason it is correct. They also show where it breaks, because the same rule fails on the 0/1 knapsack and on weighted activities.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Activity Selection](Activity_Selection/) | Sort by finish time and take every activity that fits. The model example of a greedy proof. | Beginner |
| 2 | [Fractional Knapsack](Fractional_Knapsack/) | Take items by value per unit of weight and cut the last one. Optimal because items can be split. | Beginner |
| 3 | [Huffman Coding](Huffman_Coding/) | Merge the two lightest nodes again and again. Frequent symbols get short codes in the best prefix-free code. | Intermediate |
| 4 | [Job Scheduling](Job_Scheduling/) | Highest profit first, into the latest free slot before its deadline. Two more rules cover lateness and weighted completion time. | Intermediate |

The Minimum Spanning Tree algorithms, Kruskal's and Prim's, are also greedy. They live in [Minimum Spanning Tree](../Graph_Algorithms/Minimum_Spanning_Tree/), not here. Job Scheduling holds three rules, and C++ and Go do not cover all three. Huffman Coding is implemented in Python only; its C++ and Go files are placeholders.

## How They Compare

| Topic | Greedy rule | Why it is optimal | Fails when |
|-------|-------------|-------------------|------------|
| Activity Selection | earliest finish time first | finishing early leaves the most room for the rest | activities carry weights |
| Fractional Knapsack | highest value per unit of weight first | a unit of capacity always goes to the best ratio left | items cannot be cut (0/1 knapsack) |
| Huffman Coding | merge the two least frequent nodes | in some optimal tree the two rarest symbols are siblings at the deepest level | one code per symbol is required (it is optimal in that setting) |
| Job Scheduling | highest profit first, latest free slot | a more profitable job is placed first, and a later job never displaces it | jobs are not unit-time: the deadline rule assumes unit-time jobs |

| Topic | Time | Extra space | What dominates |
|-------|------|-------------|----------------|
| Activity Selection | O(n log n) | O(n) | the sort by finish time; the scan is O(n) |
| Fractional Knapsack | O(n log n) | O(n) | the sort by ratio; the fill is O(n) |
| Huffman Coding | O(k log k) | O(k) | k heap merges; counting the text is O(N) |
| Job Scheduling (deadlines) | O(n log n + n * min(D, n)) | O(n + D) | the sort by profit, then a slot search per job |

`D` is the largest deadline and `k` the number of distinct symbols. Fractional Knapsack's O(n) extra space is the sorted copy in Python; C++ and Go sort the input in place.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| Maximum number of non-overlapping intervals | Activity Selection | earliest finish first is provably optimal for the count |
| Intervals with weights | [dynamic programming](../Dynamic_Programming/) | the greedy rule can lose |
| Fill a bag with items that can be cut | Fractional Knapsack | the best ratio first is optimal |
| Fill a bag with items that cannot be cut | [0/1 Knapsack](../Dynamic_Programming/2D_DP/0_1_Knapsack/) | a ratio rule can leave capacity unused |
| Shortest prefix-free code for known symbol frequencies | Huffman Coding | no other prefix-free code with one code per symbol is shorter |
| Unit-time jobs with deadlines and profits | Job Scheduling | highest profit first, into the latest free slot |
| Connect all vertices with the cheapest edges | [Kruskal's or Prim's](../Graph_Algorithms/Minimum_Spanning_Tree/) | both are greedy and optimal on a weighted graph |

## Common Pitfalls

- A rule that sounds right is not proof. Without a proof that the greedy choice is safe, test it against a brute force or a dynamic program on small inputs.
- Activity Selection sorts by finish time. Earliest start or shortest duration gives wrong answers on easy inputs.
- The fractional rule is optimal only because the last item can be cut. Applied to the 0/1 knapsack it can leave capacity unused.
- The greedy rule in Activity Selection maximizes the count of activities, not their total weight.
- The Huffman code is not unique: ties can be broken either way. Code lengths and total size stay optimal, but the exact bit strings can differ.

## Related

- [Merge Sort](../Sorting/Merge_Sort/): read first.
- [Dynamic Programming Algorithms](../Dynamic_Programming/): handles what greedy cannot, such as weighted activities.
- [0/1 Knapsack](../Dynamic_Programming/2D_DP/0_1_Knapsack/): the knapsack where the greedy ratio rule fails.
- [Minimum Spanning Tree](../Graph_Algorithms/Minimum_Spanning_Tree/): Kruskal's and Prim's algorithms, also greedy.
- [Sorting Algorithms](../Sorting/): most greedy rules start with a sort.
