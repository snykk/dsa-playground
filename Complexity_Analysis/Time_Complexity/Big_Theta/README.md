# Big-Theta (Theta) Notation

Big-Theta is a **tight asymptotic bound on a function**: the function grows at exactly the rate of `g`, bounded above and below by constant multiples of it. In algorithm analysis it attaches to one function (for example the worst case) and not to the algorithm as a whole.

## Intuition

Picture `f(n)` between two copies of `g(n)`, one scaled down by `c1` and one scaled up by `c2`. Past `n0` the curve never leaves that band, so `f` grows exactly like `g`. Big-O and Big-Omega are loose by default (`n` is `O(n^2)`), but Theta pins the rate down: `n` is not `Theta(n^2)`.

**Formal definition.** `f(n) = Theta(g(n))` if there exist constants `c1, c2 > 0` and `n0` such that

```text
0 <= c1 * g(n) <= f(n) <= c2 * g(n)   for all n >= n0
```

Equivalently, `f = Theta(g)` exactly when `f = O(g)` and `f = Omega(g)`.

**Theta does not need best = average = worst.** An algorithm has several functions you can bound: the best-case, average-case and worst-case running time. Each can have its own Theta. The worst case of Quick Sort is `Theta(n^2)` and its average case is `Theta(n log n)`; both are correct statements. A single Theta for the whole algorithm exists only when every case has the same growth rate.

## Visual

```text
f(n) = 3n^2 + 5n + 2, g(n) = n^2, c1 = 3, c2 = 10, n0 = 1

n          1    2    3    4     5     6
3n^2       3   12   27   48    75   108     <- lower bound  c1 * g(n)
f(n)      10   24   44   70   102   140     <- the function
10n^2     10   40   90  160   250   360     <- upper bound  c2 * g(n)
```

## How It Works

To prove `f(n) = Theta(g(n))`, prove both sides:

1. Lower bound: `3n^2 <= 3n^2 + 5n + 2` for `n >= 1`, so `c1 = 3`.
2. Upper bound: for `n >= 1`, `5n <= 5n^2` and `2 <= 2n^2`, so `f(n) <= 10n^2`, so `c2 = 10`.
3. Take `n0 = 1`.

Handy closed forms: `n(n + 1)/2 = Theta(n^2)`; a polynomial with a positive leading coefficient is `Theta(n^k)` for its degree `k`; `log2(n!) = Theta(n log n)`; `log_a n = Theta(log n)` for every base `a > 1`.

Theta is an equivalence relation: `f = Theta(f)`, `f = Theta(g)` implies `g = Theta(f)`, and it is transitive.

## Step-by-Step Trace

Binary search returns as soon as it finds the target, so it has more than one Theta. Measured with a list that counts element reads (`n = 1,023`):

| Search | Reads | Probes | Case |
|--------|-------|--------|------|
| target 511 (the first middle element) | 1 | 1 | best case, `Theta(1)` |
| target -1 (absent) | 20 | 10 | worst case, `Theta(log n)` |

The second row costs 2 comparisons per probe. No single Theta describes "binary search"; each case gets its own.

## Complexity

| Algorithm | Best case | Average case | Worst case | One Theta for all inputs? |
|-----------|-----------|--------------|------------|---------------------------|
| Quick Sort (fixed pivot) | Theta(n log n) | Theta(n log n) | Theta(n^2) | no |
| Binary search | Theta(1) | Theta(log n) | Theta(log n) | no |
| Linear search | Theta(1) | Theta(n) | Theta(n) | no |
| Merge Sort | Theta(n log n) | Theta(n log n) | Theta(n log n) | yes |
| Naive matrix multiplication | Theta(n^3) | Theta(n^3) | Theta(n^3) | yes |

The examples in this folder:

| Function | Tight bound |
|----------|-------------|
| `tight_bound_example` (sum) | Theta(n) on every input |
| `binary_search_example` | best Theta(1), worst Theta(log n) |
| `merge_sort_example` (Python, a real merge sort) | Theta(n log n) on every input |
| `matrix_multiplication_naive` (Python only) | Theta(n^3) on every input |

In C++ and Go, `mergeSortExample` / `MergeSortExample` call the library sort. That is `O(n log n)` in the worst case but not `Theta(n log n)` in every case: Go's `sort.Ints` is a pattern-defeating quicksort and is close to linear on sorted input.

## When to Use

- When you can bound a function from both sides and want to say "exactly this order".
- To say two functions or two algorithms grow at the same rate.
- Prefer it to Big-O when a loose upper bound would mislead: `O(n)` for a loop that always does `n^2` steps is true but misleading.

When no matching lower bound is known, state O and Omega separately.

## Big-Theta vs. Big-O and Big-Omega

| Notation | Meaning | Example |
|----------|---------|---------|
| O(g) | at most g (ceiling) | `n` is `O(n^2)` |
| Omega(g) | at least g (floor) | `n^2` is `Omega(n)` |
| Theta(g) | exactly g (both) | `3n^2 + 5n + 2` is `Theta(n^2)` |

`f = Theta(g)` if and only if `f = O(g)` and `f = Omega(g)`.

## Common Pitfalls

- Believing Theta needs best = average = worst. Theta bounds one function; bound each case separately.
- Saying "Quick Sort is Theta(n log n)" with no case. Its average case is `Theta(n log n)` and its worst case is `Theta(n^2)`.
- Calling binary search `Theta(log n)` without a case. Its best case is `Theta(1)`.
- Treating C++ `std::sort` or Go `sort.Ints` as `Theta(n log n)` merge sorts.
- Forgetting that Theta hides constants: `3n` and `300n` are both `Theta(n)`.
- Writing `Theta` when only an upper bound is known.

## Implementations

- [Python](Python/big_theta.py): four examples (sum, binary search, merge sort, naive matrix multiplication).
- [C++](C++/big_theta.cpp): three examples (no matrix multiplication); the sort calls `std::sort`.
- [Go](Go/main.go): three examples (no matrix multiplication); the sort calls `sort.Ints`.

## Practice Problems

- [Binary Search (LeetCode 704)](https://leetcode.com/problems/binary-search/): state the best and worst case separately.
- [Sort an Array (LeetCode 912)](https://leetcode.com/problems/sort-an-array/): which of your sort's cases are `Theta(n log n)`?
- Prove with `c1`, `c2` and `n0` that `n^2 / 2 - 3n` is `Theta(n^2)`.
- Show that `log2(n!)` is `Theta(n log n)`.

## Related

- [Big-O Notation](../Big_O_Notation/)
- [Big-Omega](../Big_Omega/)
- [Amortized Analysis](../../Amortized_Analysis/)
- [Merge Sort](../../../Algorithms/Sorting/Merge_Sort/)
- [Quick Sort](../../../Algorithms/Sorting/Quick_Sort/)
- [Binary Search](../../../Algorithms/Searching/Binary_Search/)
