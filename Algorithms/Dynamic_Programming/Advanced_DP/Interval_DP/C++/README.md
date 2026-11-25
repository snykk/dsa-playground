# Interval DP -- C++ Implementation

Three interval DPs filled by increasing length: merging piles at the minimum cost (with the merges read back, and a top-down form), bursting balloons for the most coins, and cutting a string into palindromes. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `interval_dp.cpp` | the functions below and a demo `main` (compiled out when `IS_TEST_BUILD` is defined) |
| `interval_dp_test.cpp` | 9 assert-based test functions: the worked example, the three problems against brute force, the merges replayed and their tie rule, the top-down form, edge cases, invalid input, overflow, the exact number of candidates, and 40 + 24 + 24 inputs pinned to the Python outputs; it `#include`s `interval_dp.cpp` |

## API

- `long long mergePiles(const std::vector<long long>& piles)`: the minimum total cost of merging neighbouring piles into one; a merge costs the size of the pile it makes.
- `struct Merge { int i, k, j; }`, `struct MergePlan { long long cost; std::vector<Merge> merges; }` and `MergePlan mergePilesPlan(piles)`: the cost and the merges, each joining piles `i..k` with piles `k+1..j`, in post-order, the smallest `k` on ties.
- `long long mergePilesMemo(piles)`: the same cost, computed top-down with a memo.
- `long long burstBalloons(const std::vector<long long>& nums)`: the most coins from bursting every balloon.
- `int minPalindromeCuts(const std::string& s)`: the fewest cuts that split `s` into palindromes, comparing bytes.

The pile and balloon functions throw `std::invalid_argument` for a value below 0 and `std::overflow_error` when the answer does not fit in a `long long`.

```cpp
std::vector<long long> piles = {3, 2, 4, 1};
mergePiles(piles);                 // 20
mergePilesPlan(piles).merges;      // {0, 0, 1}, {2, 2, 3}, {0, 1, 3}
mergePilesMemo(piles);             // 20
burstBalloons({3, 1, 5, 8});       // 167
minPalindromeCuts("aab");          // 1
```

## C++-Specific Notes

- **`long long`, checked.** Merge costs are never negative, so -1 (`kTooLarge`) stands for "more than `LLONG_MAX`": a candidate that does not fit becomes -1 and never wins a minimum, and only the answer's own cell decides. So on piles 2^62, 0, 1 the split that would cost 2^63 + 1 loses and `mergePiles` returns 2^62 + 2. A total of the piles that does not fit throws at once, since the last merge costs the total.
- **Coins throw at the first overflow.** Every candidate of `burstBalloons` is at most the answer, so the first one that does not fit means the answer does not. The product checks for a zero factor before multiplying, then divides to check each step.
- **Bytes.** `std::string` holds bytes: a character that takes two bytes in UTF-8 is two positions, so an `a`, an accented `e` and an `a` need 3 cuts here and none in Python, which compares code points.
- **Helpers.** The tables, the checks and the candidate functions live in `namespace interval_dp_detail`. `fillMerge`, `fillMergeMemo`, `burst` and `cuts` take an optional `Counters*` that counts the candidates; the tests use it to check `(n^3 - n) / 6` and `n(n + 1)(n + 2) / 6` exactly. The top-down form is a small `MemoSolver` struct with a recursive `solve`.
- **Same output as Python.** The splits are tried in increasing order with a strict `<`, and the merges are read with the same stack; the agreement test checks the costs, the merges, the coins and the cuts on inputs computed by the Python code.
- **Test build.** The test `#include`s the `.cpp`, so build only the test file and define `IS_TEST_BUILD` to drop the demo `main`. CI also runs it under AddressSanitizer and UndefinedBehaviorSanitizer.

## How to Run

```bash
cd "Algorithms/Dynamic_Programming/Advanced_DP/Interval_DP/C++"
# tests
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD interval_dp_test.cpp -o interval_dp_test
./interval_dp_test

# demo
g++ -std=c++17 -O2 -Wall interval_dp.cpp -o interval_dp_demo
./interval_dp_demo
```

## Key Takeaways

1. Three nested loops: length, start, split; the cells a split reads are always shorter ranges.
2. For a minimum, let a sum that does not fit saturate and lose; for a maximum, any such sum is an overflow of the answer.
3. Build only the test file; it already includes the implementation.
