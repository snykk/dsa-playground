# Constructive Algorithms -- C++ Implementation

## Files

| File | Contents |
|------|----------|
| `constructive.cpp` | seven builders and a demo `main()` (compiled out with `-DIS_TEST_BUILD`) |
| `constructive_test.cpp` | assert-based tests, including the permutation builder over all `n <= 12` |

## API

| Function | Returns |
|----------|---------|
| `vi constructPermutation(int n, int k)` | permutation with exactly `k` distinct adjacent differences, or empty |
| `vi constructArrayWithSum(int n, ll sum, int minVal, int maxVal)` | array, or empty |
| `vector<pair<int,int>> constructGraph(vi& degrees)` | edges (Havel-Hakimi), or empty |
| `string constructString(int n, int a, int b)` | string, or empty (also when `n != a + b`) |
| `vi greedyConstruction(int n, const vi& constraints)` | sequence, or empty |
| `vector<vi> constructMatrix(vi rowSums, vi colSums)` | matrix, or empty; arguments are taken by value |
| `vi constructByDecomposition(int target)` | powers of two summing to `target`; empty for `target < 1` |

There is no tree builder and no balanced-string builder in C++.

## C++-Specific Notes

- Empty results mean "impossible", so `constructString(0, 0, 0)` and an impossible string look the same.
- Uses standard headers instead of `<bits/stdc++.h>`, so it compiles with clang on macOS.
- `using namespace std;` is at file scope because the tests `#include` the `.cpp`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD constructive_test.cpp -o test && ./test
g++ -std=c++17 -O2 constructive.cpp -o demo && ./demo
```

## Key Takeaways

- Same rules as Python for the seven builders it has.
- Impossible input is reported with an empty container.
