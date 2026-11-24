# Unbounded Knapsack -- C++ Implementation

The one-row table going up (each item reusable) and going down (each item once), the multiset of items read back from it, the 2D table, and the two ways of counting. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `unbounded_knapsack.cpp` | the functions below and a demo `main` (compiled out when `IS_TEST_BUILD` is defined) |
| `unbounded_knapsack_test.cpp` | 10 assert-based test functions: the worked example, both loop directions against brute force, the multiset and its ties, the table row by row, edge cases, invalid input, overflow, the counts against brute force, the number of updates, and 44 + 24 inputs pinned to the Python outputs; it `#include`s `unbounded_knapsack.cpp` |

## API

- `long long unboundedKnapsack(const std::vector<int>& weights, const std::vector<long long>& values, int capacity)`: the best total value, each item usable any number of times.
- `struct KnapsackChoice { long long value; std::vector<int> counts; }` and `KnapsackChoice unboundedKnapsackItems(weights, values, capacity)`: the best value and `counts[i]` copies of item `i` that reach it.
- `std::vector<std::vector<long long>> unboundedKnapsackTable(weights, values, capacity)`: the `(n + 1) x (W + 1)` table; row `i` uses the first `i` items.
- `long long zeroOneKnapsack(weights, values, capacity)`: the same loop with `w` going down, each item at most once.
- `long long countCombinations(const std::vector<int>& weights, int target)` and `long long countPermutations(weights, target)`: the number of multisets, and of sequences, of items whose weights add up to `target`.

They throw `std::invalid_argument` for a weight below 1, a negative capacity or target, or vectors of different sizes, and `std::overflow_error` when the result does not fit in a `long long`.

```cpp
std::vector<int> weights = {1, 3, 4, 5};
std::vector<long long> values = {1, 4, 5, 7};
unboundedKnapsack(weights, values, 10);                  // 14
unboundedKnapsackItems(weights, values, 10).counts;      // {0, 0, 0, 2}
zeroOneKnapsack(weights, values, 10);                    // 13
countCombinations({1, 2, 5}, 5);                         // 4
countPermutations({1, 2, 5}, 5);                         // 9
```

## C++-Specific Notes

- **`long long`, checked.** Before `dp[w - weight] + value` is formed, the code checks that it fits; every candidate is the value of a real multiset, so the check fires exactly when the best value passes `LLONG_MAX`. Python returns the exact number there.
- **Counts saturate first.** A table entry of the counts that passes `LLONG_MAX` becomes -1 ("too many") and stays so in every sum it enters; only the target's own entry decides. So `countPermutations({2, 4}, 191)` returns 0 although `ways[190]` is too large, and `countPermutations({1, 2}, 92)` throws.
- **Helpers.** The checks, the one-row fill and the counters live in `namespace unbounded_knapsack_detail`. `fillRow` takes an optional `Counters*` that counts the updates; the tests use it to check that item `i` costs `W - weight[i] + 1` of them.
- **Same output as Python.** The items are tried in input order with a strict `>`, as in Python; the agreement test checks the value, the counts, the downward value and both counts on inputs computed by the Python code.
- **Test build.** The test `#include`s the `.cpp`, so build only the test file and define `IS_TEST_BUILD` to drop the demo `main`. CI also runs it under AddressSanitizer and UndefinedBehaviorSanitizer.

## How to Run

```bash
cd "Algorithms/Dynamic_Programming/Linear_DP/Unbounded_Knapsack/C++"
# tests
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD unbounded_knapsack_test.cpp -o unbounded_knapsack_test
./unbounded_knapsack_test

# demo
g++ -std=c++17 -O2 -Wall unbounded_knapsack.cpp -o unbounded_knapsack_demo
./unbounded_knapsack_demo
```

## Key Takeaways

1. One loop with two directions: `for (w = weight; w <= capacity; ++w)` reuses, `for (w = capacity; w >= weight; --w)` does not.
2. Check the sum before adding; never let a signed integer wrap.
3. Build only the test file; it already includes the implementation.
