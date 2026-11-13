# Problem Types

Three kinds of contest problem that are defined by their format rather than by a data structure: build an object that meets constraints, decide who wins a game, and talk to a judge program within a query budget. Each needs its own way of thinking and its own proof.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Constructive Algorithms](Constructive_Algorithms/) | Build a permutation, array, string or graph that meets every constraint by design, or say that none exists. | Intermediate |
| 2 | [Interactive Problems](Interactive_Problems/) | Query a judge program while it runs and find the hidden value within a budget. Flushing and strict formats matter most. | Intermediate |
| 3 | [Game Theory (Nim and Sprague-Grundy)](Game_Theory/) | Nim reduces to one XOR, and Sprague-Grundy turns any impartial game into Nim with Grundy numbers. The Advanced topic. | Advanced |

Most problems ask you to compute a value from the input. These three do not, and a data structure or a search is the wrong first thought.

## How They Compare

| Type | Operation | Time | Notes |
|------|-----------|------|-------|
| Constructive | permutation, array, string, tree | O(n) | one pass |
| Constructive | graph from a degree sequence (Havel-Hakimi) | O(E log n) | each edge is a heap pop and push |
| Interactive | binary search for a hidden number | O(log n) queries | the budget is the cost that counts |
| Game theory | Nim winner and winning move | O(k) | k piles, one XOR pass |
| Game theory | Grundy of a sum of games | O(number of games) | XOR the tabulated numbers |

For interactive problems the number of queries matters more than the running time.

## Choosing One

| The statement says | Think | Why |
|--------------------|-------|-----|
| print any array, string or permutation with property X | Constructive | find a rule, and check feasibility before building |
| print the object, or -1 if none exists | Constructive | the impossible case needs a proof as well |
| read answers to your queries from the judge | Interactive | plan the queries and flush every one |
| at most about 30 queries for n up to 10^9 | Interactive with binary search | log2(10^9) is about 30 |
| two players, the same moves, the player who cannot move loses | Game theory | compute Grundy numbers instead of searching the tree |
| several independent piles or games | Game theory | the game sum is the XOR of the Grundy numbers |

## Common Pitfalls

- Building without checking feasibility. A constructive problem usually has impossible inputs, and the answer for them is part of the output.
- Forgetting to flush. In an interactive problem the judge sees nothing until you flush, so the program waits and the judge times out.
- Exceeding the query budget. A correct but wasteful strategy fails; count the queries before you code.
- Assuming misere play is the same as normal play. The Nim rule changes when every pile has at most 1 object.
- Applying Sprague-Grundy to a partisan game. It needs both players to have the same moves.

## Related

- [Greedy Algorithms](../../Algorithms/Greedy/): read first.
- [Binary Search](../../Algorithms/Searching/Binary_Search/): read first.
- [Optimization Techniques](../Optimization_Techniques/): Fast I/O and flushing matter in interactive problems.
- [Bit Manipulation](../../Problem_Patterns/Bit_Manipulation/): the XOR that Game Theory uses.
- [Binary Search on Answer](../../Problem_Patterns/Binary_Search_on_Answer/): binary search as a pattern.
- [Dynamic Programming Algorithms](../../Algorithms/Dynamic_Programming/): Grundy numbers are computed by DP over positions.
