# Interactive Problems -- C++ Implementation

## Files

| File | Contents |
|------|----------|
| `interactive.cpp` | flushing examples, search strategies, a `solve` template and a `main()` (compiled out with `-DIS_TEST_BUILD`) |
| `interactive_test.cpp` | tests that swap the `cin` and `cout` buffers for an in-process fake judge |

## API

| Function | Description |
|----------|-------------|
| `queryWithEndl(int)`, `queryWithFlush(int)`, `answer(int)` | the two flushing styles and the final answer |
| `guessNumber(int n)` | binary search with `higher` / `lower` / `correct` replies |
| `int findMinimumInteractive(int n)` | minimum of a rotated sorted array by value queries (one query for `hi`, then one per step) |
| `exploreGraph(int n)` | BFS from node 1 with a neighbor query |
| `int findMaximum(int n)` | maximum by comparisons |
| `guessSubset(int n)` | one membership query per element |
| `bool checkResponse()` | reads a reply, exits on `-1` |
| `solve()` | template |

## C++-Specific Notes

- `endl` flushes but is slower; `"\n"` plus `cout.flush()` is preferred.
- Uses standard headers instead of `<bits/stdc++.h>`, so it compiles with clang on macOS.
- The tests redirect `cin` and `cout` with custom `streambuf` classes.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD interactive_test.cpp -o test && ./test
```

## Key Takeaways

- Flush every query.
- Re-use what you already know instead of re-asking.
