# Binary Search on Answer -- C++ Implementation

Binary search over the answer range with a greedy feasibility check. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `binary_search_answer.cpp` | The search, three problems and a demo `main` |
| `binary_search_answer_test.cpp` | Assert-based tests (includes the `.cpp`) |

## API

- `int binarySearchAnswer(int left, int right, function<bool(int)> condition)`: smallest value with `condition` True, or `-1`.
- `int findMinCapacity(const vector<int>& weights, int days)`
- `int findKthSmallestDistance(vector<int>& nums, int k)`: sorts `nums` in place; `-1` if fewer than `k` pairs.
- `int splitArrayLargestSum(const vector<int>& nums, int m)`

## C++-Specific Notes

- All values are `int`: sums above about 2.1 billion overflow. Switch to `long long` for large inputs.
- The checks are lambdas capturing the input by reference, passed through `std::function`.
- Empty input is not handled: `max_element` on an empty vector is undefined behaviour.
- The demo `main` is compiled out when `IS_TEST_BUILD` is defined.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD binary_search_answer_test.cpp -o bsa_test && ./bsa_test
g++ -std=c++17 -O2 -Wall binary_search_answer.cpp -o bsa_demo && ./bsa_demo
```

## Key Takeaways

- The loop uses `left + (right - left) / 2`, which cannot overflow.
- Return `-1` when nothing is feasible.
- Sort a copy if the caller's order matters.
