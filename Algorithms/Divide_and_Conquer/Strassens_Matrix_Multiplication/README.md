# Strassen's Matrix Multiplication

Strassen's algorithm multiplies two n x n matrices with seven half-size products instead of eight. That lowers the cost from O(n^3) to O(n^log2(7)), about O(n^2.81), and makes it the textbook example of a divide and conquer algorithm that wins by saving one recursive call.

## Intuition

Split each matrix into four quadrants. The schoolbook rule for blocks needs eight block products, which gives T(n) = 8 T(n/2) + O(n^2) = O(n^3): no gain. Strassen found seven products, built from sums and differences of blocks, whose combinations still give every block of the result. Adding blocks costs only O(n^2), so replacing one product by a few extra additions is a win, and the win repeats at every level of the recursion.

The invariant is algebraic: each result block equals the schoolbook value, because all the cross terms of the seven products cancel. For example C12 = P1 + P2 = A11 (B12 - B22) + (A11 + A12) B22 = A11 B12 + A12 B22.

## Visual

```text
        A                B                C = A x B
  +-----+-----+    +-----+-----+    +-----+-----+
  | A11 | A12 |    | B11 | B12 |    | C11 | C12 |
  +-----+-----+  x +-----+-----+  = +-----+-----+
  | A21 | A22 |    | B21 | B22 |    | C21 | C22 |
  +-----+-----+    +-----+-----+    +-----+-----+

  7 products of (n/2) x (n/2) blocks:
     P1 .. P7  ->  C11 = P5 + P4 - P2 + P6      C12 = P1 + P2
                   C21 = P3 + P4                C22 = P5 + P1 - P3 - P7
```

## How It Works

1. Base cases: a 1 x 1 matrix is one multiplication; for n <= 64 use the naive triple loop (the cutoff in all three implementations).
2. If n is odd, pad both matrices with one zero row and column, multiply, and cut the result back to n x n.
3. Split A and B into quadrants.
4. Compute the seven products recursively:

   | Product | Left factor | Right factor |
   |---------|-------------|--------------|
   | P1 | A11 | B12 - B22 |
   | P2 | A11 + A12 | B22 |
   | P3 | A21 + A22 | B11 |
   | P4 | A22 | B21 - B11 |
   | P5 | A11 + A22 | B11 + B22 |
   | P6 | A12 - A22 | B21 + B22 |
   | P7 | A11 - A21 | B11 + B12 |

5. Combine: C11 = P5 + P4 - P2 + P6, C12 = P1 + P2, C21 = P3 + P4, C22 = P5 + P1 - P3 - P7.
6. Join the four blocks into the n x n result.

## Step-by-Step Trace

A = [[1, 2], [3, 4]] and B = [[5, 6], [7, 8]]. Every block is one number, so the products are plain multiplications (values from the Python code):

| Product | Expression | Value |
|---------|------------|-------|
| P1 | 1 * (6 - 8) | -2 |
| P2 | (1 + 2) * 8 | 24 |
| P3 | (3 + 4) * 5 | 35 |
| P4 | 4 * (7 - 5) | 8 |
| P5 | (1 + 4) * (5 + 8) | 65 |
| P6 | (2 - 4) * (7 + 8) | -30 |
| P7 | (1 - 3) * (5 + 6) | -22 |

- C11 = 65 + 8 - 24 - 30 = 19
- C12 = -2 + 24 = 22
- C21 = 35 + 8 = 43
- C22 = 65 - 2 - 35 + 22 = 50

The result is [[19, 22], [43, 50]], the same as the schoolbook product, from 7 multiplications instead of 8.

## Complexity

| Quantity | Value | Why |
|----------|-------|-----|
| Time | O(n^log2(7)) = O(n^2.81) | T(n) = 7 T(n/2) + O(n^2); the leaves dominate: 7^(log2 n) = n^log2(7) |
| Extra space | O(n^2) | block sums and the seven products at each level |
| Multiplications after k levels | 7^k (schoolbook: 8^k) | one fewer product per split |

The running time does not depend on the values, so there is no best or worst case. With the cutoff of 64, a 128 x 128 product needs 7 * 64^3 = 1,835,008 multiplications instead of 128^3 = 2,097,152, with 18 block additions on top.

## When to Use

Use it for large dense matrices with exact entries (integers, or elements of a finite field), where the size is in the hundreds or more and a tuned cutoff is available.

Do not use it for small matrices, sparse matrices, or floating-point work where rounding behavior matters: Strassen is less numerically stable than the schoolbook method.

## Strassen vs. Alternatives

| Method | Time | Notes |
|--------|------|-------|
| Schoolbook (naive) | O(n^3) | simple, cache friendly, best for small n |
| Strassen | O(n^2.81) | wins for large n; extra memory; weaker rounding behavior on floats |
| Asymptotically faster methods | exponent below 2.4 | not practical: the constants are enormous |

## Common Pitfalls

- **Odd sizes.** Splitting at n / 2 drops the last row and column when n is odd. All three implementations now pad an odd size by one zero row and column.
- **No cutoff.** Recursing down to 1 x 1 is slower than the schoolbook method.
- **A flipped sign in a combination.** It gives a plausible but wrong matrix. Test against the naive product on random matrices larger than the cutoff (the tests do for 65, 128 and 130).
- **Integer overflow.** C++ and Go use fixed-width `int`; large entries can overflow.
- **Assuming it is faster everywhere.** Below a few hundred rows a tuned naive kernel usually wins.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `strassen_matrix.py` | Arbitrary-size ints; `strassen_multiply_general` also accepts rectangular matrices |
| C++ | [C++/](C++/) | `strassen_matrix.cpp` | `vector<vector<int>>`, square matrices; the test includes the .cpp file |
| Go | [Go/](Go/) | `main.go` | `[][]int`, square matrices; library-style `package main` with tests only |

## Practice Problems

- [Sparse Matrix Multiplication (LeetCode 311)](https://leetcode.com/problems/sparse-matrix-multiplication/) - a case where exploiting zeros beats Strassen.
- [Fibonacci Numbers (CSES)](https://cses.fi/problemset/task/1722) - matrix power; every step is a matrix product.
- [Graph Paths I (CSES)](https://cses.fi/problemset/task/1723) - count walks of length k with a matrix power.

## Related

- [Closest Pair of Points](../../Computational_Geometry/Advanced_Geometry/Closest_Pair_of_Points/) - another divide and conquer algorithm with a non-trivial combine step.
- [Merge Sort](../../Sorting/Merge_Sort/) - the standard T(n) = 2 T(n/2) + O(n) divide and conquer.
- [Quick Sort](../../Sorting/Quick_Sort/) - divide and conquer with the work done before the recursion.

References: V. Strassen, "Gaussian elimination is not optimal", Numerische Mathematik, 1969; CLRS, the chapter on divide and conquer.
