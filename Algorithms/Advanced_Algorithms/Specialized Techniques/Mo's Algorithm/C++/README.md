# Mo's Algorithm -- C++ Implementation

## Files

| File | Contents |
|------|----------|
| `mos_algorithm.cpp` | the `MoSAlgorithm` class, `countDistinctInRanges` and a demo `main()` (compiled out with `-DIS_TEST_BUILD`) |
| `mos_algorithm_test.cpp` | assert-based tests |

## API

| Function | Description |
|----------|-------------|
| `MoSAlgorithm(const vector<int>& arr)` | copies the array; block size is `max(1, (int)sqrt(n))` |
| `vector<int> processQueries(const vector<pair<int,int>>& queries)` | distinct counts for 0-indexed inclusive `(l, r)` pairs, in input order |
| `int add(int, int, unordered_map<int,int>&)`, `int remove(...)` | update the distinct count |
| `vector<int> countDistinctInRanges(arr, queries)` | convenience wrapper |

## C++-Specific Notes

- Uses `unordered_map` for frequencies; a plain array indexed by value is faster when values are small.
- `using namespace std;` is at file scope because the tests `#include` the `.cpp`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD mos_algorithm_test.cpp -o test && ./test
g++ -std=c++17 -O2 mos_algorithm.cpp -o demo && ./demo
```

## Key Takeaways

- Same algorithm as Python.
- Answers come back in input order.
