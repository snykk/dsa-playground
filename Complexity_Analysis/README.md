# Complexity Analysis

Complexity analysis measures what an algorithm costs as its input grows. Time complexity counts steps, space complexity counts memory, and amortized analysis bounds the cost of a whole sequence of operations when one operation alone can be expensive.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Time Complexity](Time_Complexity/) | How running time scales with n. Big-O, Big-Omega and Big-Theta are bounds, and best, average and worst are cases. | 3 topics |
| 2 | [Space Complexity](Space_Complexity/) | How much extra memory an algorithm needs, including the recursion stack. It decides whether a program fits at all. | Beginner |
| 3 | [Amortized Analysis](Amortized_Analysis/) | The cost per operation over a whole sequence. It explains why a dynamic array append is O(1) although one append can cost O(n). | Intermediate |

All three use the same notation and the same habit: pick the function you are measuring, then bound it.

## How They Compare

| Area | Question | What is measured | Example from the repository |
|------|----------|------------------|-----------------------------|
| Time complexity | how fast does the cost grow? | steps, as a function of n, for one case | binary search: best case Theta(1), worst case Theta(log n) |
| Space complexity | how much extra memory? | auxiliary memory, including the call stack | Heap Sort uses O(1) extra space; Merge Sort uses O(n) |
| Amortized analysis | what does one operation cost over a sequence? | total cost of a sequence divided by its length | dynamic array append: O(n) at worst, O(1) amortized |

The growth rates the three topics use, as the Big-O topic classes them:

| Class | Growth | Practical limit |
|-------|--------|-----------------|
| Fast | O(1), O(log n), O(n) | scales to millions or billions of items |
| Acceptable | O(n log n) | sorting-class cost, about 2 x 10^7 steps for n = 10^6 |
| Slow | O(n^2), O(n^3) | fine for thousands of items, hopeless for millions |
| Infeasible | O(2^n), O(n!) | only tiny n, about 20 to 25 for 2^n and 10 to 12 for n! |

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| comparing the speed of two algorithms | time complexity | growth rate decides at large n |
| stating a guarantee or a lower bound | Big-O or Big-Omega | one bounds from above, the other from below |
| stating the exact order of one case | Big-Theta | it needs matching bounds |
| a program runs out of memory, or recursion is deep | space complexity | frames and buffers add up |
| an operation is usually cheap and occasionally expensive | amortized analysis | it bounds the total over every sequence |

## Common Pitfalls

- Equating O with the worst case. O, Omega and Theta are bounds; best, average and worst are cases, and any case can take any bound.
- Counting only the input for space. The usual convention counts auxiliary memory, and recursion adds one frame per active call. Naive Fibonacci makes O(2^n) calls but uses O(n) space.
- Mistaking amortized for average case. Amortized O(1) is a guarantee over every sequence, with no probability.
- Ignoring the growth rule. A dynamic array that adds a constant amount on each resize loses the O(1) amortized append; multiplying the capacity keeps it.
- Forgetting that constants are hidden. `3n` and `300n` are both O(n), so growth rate alone does not say which is faster at small sizes.

## Related

- [Sorting Algorithms](../Algorithms/Sorting/): the cases and bounds applied to nine sorts.
- [Searching Algorithms](../Algorithms/Searching/): linear and binary search, the first examples of best and worst case.
- [Array](../Data_Structures/Linear/Array/): the dynamic array behind amortized O(1) append.
- [Problem Solving Patterns](../Problem_Patterns/): the O(n) scans that these costs justify.
