# Divide and Conquer Algorithms

Divide and conquer splits a problem into smaller copies of itself, solves them recursively and combines the answers. This folder holds one topic, Strassen's matrix multiplication, and links to the divide-and-conquer algorithms that live in other categories.

## Topics

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Strassen's Matrix Multiplication](Strassens_Matrix_Multiplication/) | Seven half-size products instead of eight lower n^3 to about n^2.81. The example that wins by saving one recursive call. | Advanced |

The other divide-and-conquer algorithms sit in the category of their problem. They are linked under How They Compare and under Related.

## How They Compare

| Algorithm | Divide | Combine | Recurrence | Time |
|-----------|--------|---------|------------|------|
| [Merge Sort](../Sorting/Merge_Sort/) | two halves of the array | merge the sorted halves in O(n) | `T(n) = 2T(n/2) + O(n)` | O(n log n) |
| [Quick Sort](../Sorting/Quick_Sort/) | partition around a pivot | nothing: the parts are already in place | two parts of sizes that depend on the pivot, O(n) to partition | O(n log n) average, O(n^2) worst |
| [Binary Search](../Searching/Binary_Search/) | compare with the middle, keep one half | nothing | `T(n) = T(n/2) + O(1)` | O(log n) |
| [Strassen](Strassens_Matrix_Multiplication/) | four blocks of each matrix, seven products | add and subtract the products | `T(n) = 7T(n/2) + O(n^2)` | O(n^2.81) |
| [Closest Pair of Points](../Computational_Geometry/Advanced_Geometry/Closest_Pair_of_Points/) | split the points at a vertical line | check a narrow strip around the line | solves both halves, then a linear strip check | O(n log n) |
| [Fast Fourier Transform](../Mathematical_Algorithms/Advanced_Math/Fast_Fourier_Transform/) | split into even and odd positions | combine the two half transforms | two half-size transforms plus a linear combine | O(n log n) |

A recurrence `T(n) = a T(n/b) + f(n)` has `a` subproblems of size `n/b` plus `f(n)` work to divide and combine. Strassen's seven products instead of eight change the exponent from 3 to `log2 7`, about 2.81. The recursion also costs memory: Merge Sort adds O(n) for its temporary halves and Strassen adds O(n^2) for its block sums.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| The problem contains smaller copies of itself and the answers combine cheaply | divide and conquer | the recursion is short and the cost follows from the recurrence |
| The subproblems overlap, as in Fibonacci numbers | [dynamic programming](../Dynamic_Programming/) | plain recursion would solve the same subproblem many times |
| A local rule is provably safe | [a greedy algorithm](../Greedy/) | no recursion over the parts is needed |
| Small inputs inside a large recursion | a direct method below a cutoff | Strassen uses the naive loop for `n <= 64` |
| Multiplying matrices in practice | the schoolbook method or a tuned library | Strassen is not numerically stable and pays off only for large matrices |

## Common Pitfalls

- A missing or wrong base case: without a direct answer for the smallest parts, the recursion never ends.
- Uneven splits: Quick Sort with a bad pivot makes one part empty at every step and becomes O(n^2).
- A combine step that is too slow: copying whole arrays at every level can turn O(n log n) into something worse.
- Using it when subproblems overlap: divide and conquer recomputes them, so use dynamic programming.
- Ignoring the cutoff: recursing all the way down costs more than a direct method on small inputs, which is why Strassen's code here switches to the naive loop at `n <= 64`.

## Related

- [Big-O Notation](../../Complexity_Analysis/Time_Complexity/Big_O_Notation/): read first.
- [Merge Sort](../Sorting/Merge_Sort/): splits cheaply and does its work when combining.
- [Quick Sort](../Sorting/Quick_Sort/): does its work when dividing and combines for free.
- [Binary Search](../Searching/Binary_Search/): discards all but one part, so it has nothing to combine.
- [Closest Pair of Points](../Computational_Geometry/Advanced_Geometry/Closest_Pair_of_Points/): divide and conquer in the plane.
- [Fast Fourier Transform](../Mathematical_Algorithms/Advanced_Math/Fast_Fourier_Transform/): splits into even and odd positions.
