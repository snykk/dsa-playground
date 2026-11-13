# Time Complexity

Big-O, Big-Omega and Big-Theta are three bounds on a function: an upper bound, a lower bound and a tight bound. Best, average and worst case are three different functions of the input size, and any of the three notations can bound any of the three cases.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Big-O Notation](Big_O_Notation/) | The upper bound and the ladder of growth rates from O(1) to O(2^n). Start here. | Beginner |
| 2 | [Big-Omega Notation](Big_Omega/) | The lower bound, behind results such as no comparison sort beats n log n. | Intermediate |
| 3 | [Big-Theta Notation](Big_Theta/) | The tight bound. It meets O and Omega, and it attaches to one case function at a time. | Intermediate |

A running time depends on n and on which input of that size you pick. So an algorithm has a best-case time, an average-case time and a worst-case time, three functions of n, and each can take any of the three bounds. "O is the worst case" and "Omega is the best case" are both wrong.

## How They Compare

| Notation | Says | Definition | Typical use |
|----------|------|------------|-------------|
| `O(g)` | at most this fast-growing | `f(n) <= c * g(n)` for all `n >= n0` | a guarantee: a promise the running time stays under |
| `Omega(g)` | at least this fast-growing | `c * g(n) <= f(n)` for all `n >= n0` | a lower bound, for a case or for a whole problem |
| `Theta(g)` | exactly this fast-growing | `c1 * g(n) <= f(n) <= c2 * g(n)` for all `n >= n0` | stating the order of one case precisely |

Theta holds exactly when O and Omega both hold. O and Omega are loose by default: n is O(n^2), and n^2 is Omega(n).

Every cell below is a tight bound on one case function:

| Algorithm | Best case | Average case | Worst case | One Theta for all inputs? |
|-----------|-----------|--------------|------------|---------------------------|
| Binary search | Theta(1) | Theta(log n) | Theta(log n) | No |
| Linear search | Theta(1) | Theta(n) | Theta(n) | No |
| Bubble sort (early exit) | Theta(n) | not given | Theta(n^2) | No |
| Quick Sort (fixed pivot) | Theta(n log n) | Theta(n log n) | Theta(n^2) | No |
| Merge Sort | Theta(n log n) | Theta(n log n) | Theta(n log n) | Yes: Theta(n log n) |
| Naive matrix multiplication | Theta(n^3) | Theta(n^3) | Theta(n^3) | Yes: Theta(n^3) |

## Choosing One

| You want to say | Use | Why |
|-----------------|-----|-----|
| the running time never exceeds this order | O | an upper bound is the usual promise |
| it cannot be faster than this, or no algorithm can solve the problem faster | Omega | a lower bound for one case, or for the problem as a whole |
| this is exactly the order of that case | Theta | it needs matching upper and lower bounds |
| an upper bound, when the lower bound is unknown | O | say so, and do not call it Theta |
| cost per operation over a whole sequence | [Amortized Analysis](../Amortized_Analysis/) | it bounds the total, not one case |

## Common Pitfalls

- Calling O the worst case, or Omega the best case. They are bounds on a function; any case can be bounded by any of the three.
- Believing Theta needs best = worst. Quick Sort's average case is `Theta(n log n)` and its worst case is `Theta(n^2)`, and both statements are correct.
- Saying an algorithm is Theta(log n) when it returns early. Binary search is `Theta(log n)` only for its worst and average cases.
- Treating library sorts as Merge Sort. In the C++ and Go examples, the `mergeSortExample` functions call `std::sort` and `sort.Ints`, so they are `O(n log n)` in the worst case but not `Theta(n log n)` on every input.
- Dropping the variable. Graph search is `O(V + E)`, not `O(n)`.

## Related

- [Space Complexity](../Space_Complexity/): the same notation applied to memory.
- [Amortized Analysis](../Amortized_Analysis/): the cost of a whole sequence, not one case.
- [Sorting Algorithms](../../Algorithms/Sorting/): best, average and worst cases of nine sorts.
- [Searching Algorithms](../../Algorithms/Searching/): the best and worst case of linear and binary search.
