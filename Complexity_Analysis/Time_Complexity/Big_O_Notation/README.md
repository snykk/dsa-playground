# Big-O Notation

Big-O gives an asymptotic **upper bound on a function**. In algorithm analysis the function is a running time (or memory use) as a function of the input size `n`. Big-O is a bound on that function: it is not a synonym for "worst case".

## Intuition

Big-O keeps only the part of a formula that dominates for large `n`.

- Constants are dropped: `5n` and `n` grow the same way, so `O(5n) = O(n)`.
- Lower-order terms are dropped: `n^2 + 100n` is `O(n^2)`.
- It is only an upper bound: `3n + 1` is `O(n)`, and also `O(n^2)` and `O(2^n)`. Those statements are true but weak. When you want a tight bound, use Big-Theta.

**Formal definition.** `f(n) = O(g(n))` if there exist constants `c > 0` and `n0` such that

```text
0 <= f(n) <= c * g(n)   for all n >= n0
```

The `=` is read as "is in the set": `n = O(n^2)` is true, `O(n^2) = n` is meaningless.

**Cases are separate from notations.** Best, average and worst case are three different functions of `n`. Each of them can be bounded with O, Omega or Theta. For linear search the best case is `O(1)` (and `Theta(1)`), and the worst case is `O(n)` (and `Theta(n)`). Writing "O is the worst case" mixes up the notation with the case.

## Visual

```text
f(n) = 3n^2 + 5n + 2   against   c * g(n) = 4n^2   (c = 4)

n       1    2    3    4    5     6     7     8     9
f(n)   10   24   44   70  102   140   184   234   290
4n^2    4   16   36   64  100   144   196   256   324
f<=cg?  no   no   no   no   no   yes   yes   yes   yes
                                  ^ n0 = 6
```

## How It Works

To prove `f(n) = O(g(n))`, find `c` and `n0` and show the inequality for all `n >= n0`.

1. Take each term of `f` and bound it by a multiple of `g`: for `n >= 1`, `5n <= 5n^2` and `2 <= 2n^2`.
2. Add the multiples: `3n^2 + 5n + 2 <= (3 + 5 + 2) n^2 = 10 n^2`.
3. Read off `c = 10` and `n0 = 1`.

To show that `f` is **not** `O(g)`, show that no constant works. `n^2 = O(n)` would need `n <= c` for all large `n`, which is impossible.

Reading code:

| Code shape | Bound |
|------------|-------|
| a fixed number of steps | `O(1)` |
| halving a value in a loop | `O(log n)` |
| one pass over the input | `O(n)` |
| all pairs (two nested loops) | `O(n^2)` |
| three nested loops | `O(n^3)` |
| two recursive calls on `n - 1` and `n - 2` (naive Fibonacci) | `O(2^n)` |

Rules: sequential steps add (`O(f) + O(g) = O(max(f, g))`), nested steps multiply, and several inputs need several variables (graph search is `O(V + E)`).

## Step-by-Step Trace

Growth of the common classes (log base 2):

| Class | Name | n = 10 | n = 100 | n = 1,000 |
|-------|------|--------|---------|-----------|
| O(1) | constant | 1 | 1 | 1 |
| O(log n) | logarithmic | 3.3 | 6.6 | 10 |
| O(n) | linear | 10 | 100 | 1,000 |
| O(n log n) | linearithmic | 33 | 664 | 9,966 |
| O(n^2) | quadratic | 100 | 10,000 | 1,000,000 |
| O(n^3) | cubic | 1,000 | 1,000,000 | 1,000,000,000 |
| O(2^n) | exponential | 1,024 | 1.27 x 10^30 | 1.07 x 10^301 |
| O(n!) | factorial | 3,628,800 | 9.3 x 10^157 | about 4 x 10^2567 |

Ordering: `O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(n^3) < O(2^n) < O(n!)`.

## Complexity

Big-O is the notation, so there is no "complexity of Big-O". The examples in this folder have these costs:

| Function | Time | Space | Note |
|----------|------|-------|------|
| `constant_time_example` | O(1) | O(1) | |
| `logarithmic_time_example` | O(log n) | O(1) | halving loop |
| `linear_time_example` | O(n) | O(1) | sum of a list |
| `linearithmic_time_example` | O(n log n) | O(n) | Python: merge sort; C++ and Go: library sort |
| `quadratic_time_example` | O(n^2) | O(n^2) | all pairs |
| `cubic_time_example` | O(n^3) | O(1) | counts iterations |
| `exponential_time_example` | O(2^n) | O(n) | naive Fibonacci; valid but loose, exact growth is about 1.618^n |
| `factorial_time_example` (Python only) | O(n * n!) | O(n * n!) | builds all permutations by slicing; not O(n!) |

## When to Use

- To compare how algorithms scale, ignoring machine and language constants.
- To state a guarantee: "the worst case is O(n log n)", "the average case is O(1)".
- Not for small inputs, where constants decide, and not as a substitute for measurement.

## Big-O vs. Other Notations

| Notation | Meaning | Reads as |
|----------|---------|----------|
| O(g) | upper bound | grows at most as fast as g |
| Omega(g) | lower bound | grows at least as fast as g |
| Theta(g) | tight bound | grows exactly as fast as g (both O and Omega) |

Linear search bounds, per case: best `Theta(1)`, worst `Theta(n)`, average `Theta(n)`. Each can also be stated with a plain `O`.

## Common Pitfalls

- Reading O as "worst case". The case is a separate choice, and every case can be bounded with O, Omega or Theta.
- Assuming `O(n)` beats `O(n^2)` for every `n`. `100n` is larger than `n^2` until `n = 100`.
- Treating `n = O(n^2)` as a precise statement. It is true but loose; use Theta for a tight bound.
- Worrying about the log base. It only changes a constant factor.
- Hiding variables: `O(V + E)` is not `O(n)`.
- Mislabeling examples: building all permutations costs `O(n * n!)`, because each permutation takes `O(n)` to write.

## Implementations

- [Python](Python/big_o_notation.py): eight examples, including a merge sort and the factorial one.
- [C++](C++/big_o_notation.cpp): seven examples (no factorial); the linearithmic one calls `std::sort`.
- [Go](Go/main.go): seven examples (no factorial); the linearithmic one calls `sort.Ints`.

## Practice Problems

- [Contains Duplicate (LeetCode 217)](https://leetcode.com/problems/contains-duplicate/): compare `O(n^2)`, `O(n log n)` and `O(n)` solutions.
- [Two Sum (LeetCode 1)](https://leetcode.com/problems/two-sum/): brute force `O(n^2)` versus a hash map `O(n)`.
- [Sort an Array (LeetCode 912)](https://leetcode.com/problems/sort-an-array/): bound the cost of a hand-written sort.
- Prove with explicit `c` and `n0` that `n^2 + 10n` is `O(n^2)`, and that `2^n` is not `O(n^100)`.

## Related

- [Big-Omega](../Big_Omega/)
- [Big-Theta](../Big_Theta/)
- [Space Complexity](../../Space_Complexity/)
- [Amortized Analysis](../../Amortized_Analysis/)
- [Quick Sort](../../../Algorithms/Sorting/Quick_Sort/)
- [Binary Search](../../../Algorithms/Searching/Binary_Search/)
