# Monotonic Stack -- C++ Implementation

Next and previous greater or smaller element, histogram, temperatures and stock span. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `monotonic_stack.cpp` | Seven functions and a demo `main` |
| `monotonic_stack_test.cpp` | Assert-based tests (includes the `.cpp`) |

## API

- `vector<int> nextGreaterElement(const vector<int>& arr)`, `nextSmallerElement`, `previousGreaterElement`, `previousSmallerElement`: values, `-1` if none.
- `int largestRectangleHistogram(const vector<int>& heights)`
- `vector<int> dailyTemperatures(const vector<int>& temperatures)`: days to wait, `0` if none.
- `vector<int> stockSpan(const vector<int>& prices)`

## C++-Specific Notes

- The area is an `int`: `height * width` can overflow for very large inputs.
- `-1` is the "no answer" value, so an input containing -1 is ambiguous.
- The demo `main` is compiled out when `IS_TEST_BUILD` is defined.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD monotonic_stack_test.cpp -o ms_test && ./ms_test
```

The test file has its own `main`, so it must be built with `-DIS_TEST_BUILD`.

## Key Takeaways

- Indices on the stack give widths and distances.
- Use a wider integer type if areas can exceed 2 billion.
- Every function returns a fresh vector; inputs are not modified.
