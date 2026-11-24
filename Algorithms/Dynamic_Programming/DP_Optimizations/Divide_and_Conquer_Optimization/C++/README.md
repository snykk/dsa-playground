# Divide and Conquer Optimization -- C++ Implementation

The layered DP `dp[g][i] = min over j < i of dp[g-1][j] + C(j, i)` with each layer computed by the divide-and-conquer recursion, the plain DP beside it, and the groups read back from the best `j` of every cell. The example cost is the square of a group's sum. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `divide_and_conquer_optimization.cpp` | the functions below and a demo `main` (compiled out when `IS_TEST_BUILD` is defined) |
| `divide_and_conquer_optimization_test.cpp` | 10 assert-based test functions: the worked example and its cost evaluations, the recursion against the plain DP and brute force, the groups, the quadrangle inequality, a cost that breaks it, edge cases, invalid input, overflow, the number of cost evaluations, and 44 + 12 + 8 cases pinned to the Python outputs; it `#include`s `divide_and_conquer_optimization.cpp` |

## API

- `struct Partition { long long cost; std::vector<int> bounds; }`: the best total, and `k + 1` bounds with group `g` = `values[bounds[g] .. bounds[g + 1] - 1]`.
- `Partition minCostPartition(const std::vector<long long>& values, int k)`: the least sum of `(group sum)^2` over `k` contiguous non-empty groups, with the recursion. O(k n log n).
- `Partition minCostPartitionPlain(const std::vector<long long>& values, int k)`: the same answer and bounds from the plain DP. O(k n^2).
- `template <typename Cost> Partition partitionDp(int n, int k, Cost cost, bool optimized = true)`: any callable `long long cost(int j, int i)` for the group `[j, i)`; `optimized = false` is the plain DP.

They throw `std::invalid_argument` for `k < 1`, `k > n` (so for every `k` on an empty vector) and, in the two concrete functions, a negative value; `std::overflow_error` when the total passes 3037000499 (the concrete functions) or a sum of costs does not fit (`partitionDp`).

```cpp
std::vector<long long> values = {3, 1, 4, 1, 5, 9, 2, 6};
Partition best = minCostPartition(values, 3);   // cost 341, bounds {0, 4, 6, 8}
minCostPartitionPlain(values, 3).cost;          // 341

std::vector<long long> p = {0, 1, 3, 7, 2};     // prefix sums of 1, 2, 4, -5
auto square = [&p](int j, int i) { return (p[i] - p[j]) * (p[i] - p[j]); };
partitionDp(4, 2, square, true).cost;           // 10: wrong, opt is not monotone
partitionDp(4, 2, square, false).cost;          // 2
```

## C++-Specific Notes

- **`long long`, checked once.** Every number the DP forms is at most the square of the total, and the DP forms that square itself (`dp[1][n]`). So `minCostPartition` checks, while it builds the prefix sums, that the total stays at most 3037000499 (`3037000499^2 <= LLONG_MAX < 3037000500^2`), and throws `std::overflow_error` otherwise. Python returns the exact number there: `{3037000499, 1}` in two groups costs 9223372030926249002 in Python and throws here.
- **`partitionDp` checks every sum** `dp[g-1][j] + cost(j, i)` before forming it, since the costs come from the caller.
- **The cost is a template parameter**, so a lambda is called directly rather than through a `std::function`. The tests pass a callable object that counts its calls: that is how they count the cost evaluations and check the bound.
- **Helpers.** The checks, `bestSplit` and the recursion `solveRange` live in `namespace dnc_optimization_detail`. The middle cell is `lo + (hi - lo) / 2`, the same as Python's `(lo + hi) // 2` for these non-negative indices.
- **Same output as Python.** `j` is tried upward with a strict `<`, as in Python; the agreement test checks the cost and the bounds of both versions on inputs computed by the Python code, including the wrong answers on a failing cost and the number of cost evaluations.
- **Test build.** The test `#include`s the `.cpp`, so build only the test file and define `IS_TEST_BUILD` to drop the demo `main`. CI also runs it under AddressSanitizer and UndefinedBehaviorSanitizer.

## How to Run

```bash
cd "Algorithms/Dynamic_Programming/DP_Optimizations/Divide_and_Conquer_Optimization/C++"
# tests
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD divide_and_conquer_optimization_test.cpp -o divide_and_conquer_optimization_test
./divide_and_conquer_optimization_test

# demo
g++ -std=c++17 -O2 -Wall divide_and_conquer_optimization.cpp -o divide_and_conquer_optimization_demo
./divide_and_conquer_optimization_demo
```

## Key Takeaways

1. Two recursive calls per cell, each with the half of the `j` range on its side of `opt(mid)`.
2. Check the total once and no sum in the DP can overflow; check every sum when the costs come from outside.
3. A template over the cost takes any lambda, including one that counts its calls in the tests.
