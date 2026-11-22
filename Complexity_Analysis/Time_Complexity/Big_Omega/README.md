# Big-Omega (Omega) Notation

Big-Omega gives an asymptotic **lower bound on a function**. In algorithm analysis it says a running time is at least some growth rate, and it is the tool behind results such as "no comparison sort beats n log n". It is a bound on a function, not a synonym for "best case".

## Intuition

Big-O says "at most this much"; Big-Omega says "at least this much". Together they sandwich a function. Like Big-O, an Omega bound can be loose: `n^2 + 1` is `Omega(n^2)`, and also `Omega(n)` and `Omega(1)`. `Omega(1)` is true of every algorithm and says nothing, so a useful lower bound is the largest one you can prove.

**Formal definition.** `f(n) = Omega(g(n))` if there exist constants `c > 0` and `n0` such that

```text
0 <= c * g(n) <= f(n)   for all n >= n0
```

It is the mirror of Big-O: `f = Omega(g)` exactly when `g = O(f)`.

**Cases are separate from notations.** Best, average and worst case are three different functions of `n`. Each of them can be bounded with O, Omega or Theta. An Omega bound on the **worst case** ("some input of size `n` takes at least `n log n` steps") and an O bound on the **best case** ("the fastest input takes at most `n` steps") are both valid. "Omega means best case" mixes up the notation with the case.

## Visual

```text
Decision tree of a comparison sort on 3 elements (a, b, c): 6 leaves, depth 3

                    a < b?
                 yes /    \ no
              b < c?        a < c?
           yes /   \ no  yes /   \ no
          abc   a < c?    bac   b < c?
              yes/  \no       yes/  \no
              acb   cab       bca   cba

n! leaves  ->  height >= log2(n!)  ->  Omega(n log n) comparisons in the worst case
```

## How It Works

To prove `f(n) = Omega(g(n))`, find `c` and `n0` and show `c * g(n) <= f(n)` for all `n >= n0`.

Example: `f(n) = n^2 / 2 - 3n` is `Omega(n^2)`. Take `c = 1/4`. Then `n^2 / 4 <= n^2 / 2 - 3n` is the same as `n >= 12`, so `n0 = 12`. At `n = 11` it fails (30.25 against 27.5).

Lower bound for a **problem**: a comparison sort is a binary decision tree with one leaf per possible output order. A correct sort needs at least `n!` leaves, a binary tree with `n!` leaves has height at least `log2(n!)`, and

```text
log2(n!) >= log2((n/2)^(n/2)) = (n/2) * log2(n/2)  =  Omega(n log n)
```

This is a worst-case (and average-case) statement. It does not say that every input needs `n log n` comparisons: insertion sort and early-exit bubble sort finish a sorted input in `n - 1` comparisons.

## Step-by-Step Trace

The repository examples, per case:

| Function | Best case | Worst case | Omega for all inputs |
|----------|-----------|------------|----------------------|
| `linear_search_best_case` | Theta(1): target first | Theta(n): target absent | Omega(1) |
| `bubble_sort_best_case` (early exit) | Theta(n): already sorted | Theta(n^2): reversed | Omega(n) |
| `quick_sort_best_case` (3-way, Python only) | Theta(n): all keys equal | Theta(n^2): lopsided pivots | Omega(n) |
| `matrix_traversal_lower_bound` | Theta(n^2) | Theta(n^2) | Omega(n^2) |

Bubble sort has `Omega(n)` on every input even though its worst case is `Theta(n^2)`. The function names in the code keep a historical "best case" wording; read them as the example each bound is illustrated with.

## Complexity

| Algorithm | Best case | Average case | Worst case |
|-----------|-----------|--------------|------------|
| Linear search | Theta(1) | Theta(n) | Theta(n) |
| Binary search | Theta(1) | Theta(log n) | Theta(log n) |
| Bubble sort (early exit) | Theta(n) | Theta(n^2) | Theta(n^2) |
| Merge sort | Theta(n log n) | Theta(n log n) | Theta(n log n) |
| Quick sort (fixed pivot) | Theta(n log n) | Theta(n log n) | Theta(n^2) |

Each cell is a statement about one case function with a tight (Theta) bound; every cell also implies the matching O and Omega bounds.

## When to Use

- To show that no algorithm can do better: match an upper bound with a lower bound (Merge Sort is `O(n log n)` and comparison sorting is `Omega(n log n)`, so it is optimal).
- To say that every input of a given size costs at least some amount (searching an unsorted array must look at every element in the worst case: `Omega(n)`).
- When the output is large: listing all subsets of `n` items takes `Omega(2^n)` just to write them.

## Big-Omega vs. Big-O and Big-Theta

| Notation | Meaning | Relation |
|----------|---------|----------|
| O(g) | upper bound | `f = O(g)` means f is at most c * g |
| Omega(g) | lower bound | `f = Omega(g)` exactly when `g = O(f)` |
| Theta(g) | tight bound | `f = Theta(g)` when f is both `O(g)` and `Omega(g)` |

## Common Pitfalls

- Treating Omega as "best case". Omega bounds a function; any of the best, average or worst case can have an Omega bound.
- Saying "no comparison sort can beat n log n" without the case. The bound is for the worst and average case; sorted input can be much faster.
- Reporting `Omega(1)` as a result. It is true for every algorithm; prove the largest bound you can.
- Calling binary search `Theta(log n)` without a case. Its best case is `Theta(1)`; its worst case is `Theta(log n)`.
- Swapping the roles in a comparison: `f = Omega(g)` means `g = O(f)`.
- Reading `quick_sort_best_case` as an `Omega(n log n)` best case. It is a three-way, out-of-place quick sort that sorts all-equal input in linear time, and it allocates new lists at every call, so its space is not `O(log n)`.

## Implementations

- [Python](Python/big_omega.py): four examples (linear search, bubble sort, three-way quick sort, matrix traversal).
- [C++](C++/big_omega.cpp): three examples (no quick sort).
- [Go](Go/main.go): three examples (no quick sort).

## Practice Problems

- [Search in Rotated Sorted Array (LeetCode 33)](https://leetcode.com/problems/search-in-rotated-sorted-array/)
- [Search in Rotated Sorted Array II (LeetCode 81)](https://leetcode.com/problems/search-in-rotated-sorted-array-ii/)
- [Sort Colors (LeetCode 75)](https://leetcode.com/problems/sort-colors/)
- [Maximum Gap (LeetCode 164)](https://leetcode.com/problems/maximum-gap/)
- Prove with `c` and `n0` that `n^2 - 10n` is `Omega(n^2)`.
- Use the decision tree to find the minimum worst-case number of comparisons needed to sort 5 elements (`ceil(log2(120)) = 7`).

## Related

- [Big-O Notation](../Big_O_Notation/)
- [Big-Theta](../Big_Theta/)
- [Space Complexity](../../Space_Complexity/)
- [Merge Sort](../../../Algorithms/Sorting/Merge_Sort/)
- [Linear Search](../../../Algorithms/Searching/Linear_Search/)
