# Knuth Optimization -- C++ Implementation

Knuth's optimization of the interval DP `dp[i][j] = min over k of dp[i][k] + dp[k+1][j] + C(i, j)`: each cell tries only the splits between `split[i][j-1]` and `split[i+1][j]`, O(n^2) instead of O(n^3). Applied to Interval DP's pile merging (with the merges read back) and to the optimal binary search tree. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `knuth_optimization.cpp` | the functions below and a demo `main` (compiled out when `IS_TEST_BUILD` is defined) |
| `knuth_optimization_test.cpp` | 11 assert-based test functions: the worked example, the tables against an independent plain DP and brute force, the window and the monotone split table, both conditions and a cost that breaks them, the merges replayed and their tie rule, the optimal binary search tree, edge cases, invalid input, overflow, the exact number of splits tried, and 40 + 20 + 16 inputs pinned to the Python outputs; it `#include`s `knuth_optimization.cpp` |

## API

- `long long splitDp(int n, const std::function<long long(int, int)>& cost, bool knuth = true)`: `dp[0][n-1]` for `dp[i][j] = min over i <= k < j of dp[i][k] + dp[k+1][j] + cost(i, j)`; with `knuth = false` every `k` is tried.
- `long long mergePiles(const std::vector<long long>& piles)`: the minimum total cost of merging neighbouring piles into one.
- `struct Merge { int i, k, j; }`, `struct MergePlan { long long cost; std::vector<Merge> merges; }` and `MergePlan mergePilesPlan(piles)`: the cost and the merges, in post-order, the smallest `k` on ties; the same list as Interval DP's `mergePilesPlan`.
- `long long optimalBst(const std::vector<long long>& freq)`: the least `sum(freq[t] * depth(t))` over the binary search trees on the keys, the root at depth 1.

They throw `std::invalid_argument` for a value below 0 (a pile, a frequency, a cost, or `n`) and `std::overflow_error` when the answer does not fit in a `long long`.

```cpp
std::vector<long long> piles = {3, 2, 4, 1};
mergePiles(piles);              // 20
mergePilesPlan(piles).merges;   // {0, 0, 1}, {2, 2, 3}, {0, 1, 3}
optimalBst({34, 8, 50});        // 142
splitDp(4, [&](int i, int j) { return 1LL * (j - i); });  // any cost of 0 or more
```

## C++-Specific Notes

- **`long long`, checked.** Costs are never negative, so -1 (`kTooLarge`) stands for "more than `LLONG_MAX`": a candidate that does not fit never wins, and only the answer's own cell decides. A total of the piles or frequencies that does not fit throws at once, since the top cell adds the whole total.
- **A cell that does not fit.** It keeps its window's first `k` as its split, so the windows that read it stay inside the table (the tests run such a row under the sanitizers); the answer is then too large too, since its range contains the cell's.
- **The cost type.** `splitDp` takes a `std::function`; the internal `knuth_detail::fill` is a template over the cost, which `mergePiles` and `optimalBst` call with a lambda over their prefix sums.
- **Helpers.** The tables, `window`, `trySplit` and `fill` live in `namespace knuth_detail`. `fill`, `fillMerge` and `fillBst` take an optional `Counters*` that counts the splits tried; the tests use it to check the telescoped sum and `(n^3 - n) / 6` exactly.
- **Same output as Python.** The windows are tried in increasing order with a strict `<`, and the merges are read with the same stack; the agreement test checks the costs, the merges and the number of splits tried on inputs computed by the Python code.
- **Test build.** The test `#include`s the `.cpp`, so build only the test file and define `IS_TEST_BUILD` to drop the demo `main`. CI also runs it under AddressSanitizer and UndefinedBehaviorSanitizer.

## How to Run

```bash
cd "Algorithms/Dynamic_Programming/DP_Optimizations/Knuth_Optimization/C++"
# tests
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD knuth_optimization_test.cpp -o knuth_optimization_test
./knuth_optimization_test

# demo
g++ -std=c++17 -O2 -Wall knuth_optimization.cpp -o knuth_optimization_demo
./knuth_optimization_demo
```

## Key Takeaways

1. Two loops over lengths and starts, and a third over a window that is O(n) per diagonal in all.
2. Even a cell that overflows must leave a split inside its window.
3. Build only the test file; it already includes the implementation.
