# Square Root Decomposition -- C++ Implementation

## Files

| File | Contents |
|------|----------|
| `square_root_decomposition.cpp` | the `SqrtDecomposition` class and a demo `main()` (compiled out with `-DIS_TEST_BUILD`) |
| `square_root_decomposition_test.cpp` | assert-based tests |

## API

| Member | Description |
|--------|-------------|
| `SqrtDecomposition(const vector<int>& arr)` | copies `arr`, block size `max(1, ceil(sqrt(n)))` |
| `void update(int index, int value)` | sets `arr[index]`, O(1) |
| `int query(int left, int right)` | inclusive range sum, O(sqrt n) |

## C++-Specific Notes

- Sums are `int`; very large totals overflow.
- Indices are not validated.
- `using namespace std;` is at file scope because the tests `#include` the `.cpp`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD square_root_decomposition_test.cpp -o test && ./test
g++ -std=c++17 -O2 square_root_decomposition.cpp -o demo && ./demo
```

## Key Takeaways

- Same algorithm as Python.
- Empty input is safe: the block size is clamped to 1.
