# Monotonic Queue -- C++ Implementation

Header-only sliding window maximum and minimum. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `monotonic_queue.h` | `slidingWindowMax` and `slidingWindowMin` |
| `monotonic_queue_test.cpp` | Assert-based tests (it has its own `main`) |

## API

- `std::vector<int> slidingWindowMax(const std::vector<int>& arr, int k)`: empty result for `k <= 0`, an empty array or `k > arr.size()`.
- `std::vector<int> slidingWindowMin(const std::vector<int>& arr, int k)`

## C++-Specific Notes

- The deque is a `std::deque<int>` of indices.
- The functions are `inline`, so the header can be included from several translation units.
- There is no C++ counterpart of Python's `MonotonicDeque` class.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall monotonic_queue_test.cpp -o mq_test && ./mq_test
```

## Key Takeaways

- Indices let you test window expiry with one comparison.
- Pop expired indices before you read the front.
- The header has no state, so calls are independent.
