# Randomized Quickselect -- C++ Implementation

The k-th smallest element in O(n) expected time, using a three-way partition and `std::mt19937`. For the idea, the trace and the complexity argument see the [topic README](../README.md).

## Files

- `quickselect.h` - header-only implementation.
- `quickselect_test.cpp` - 11 assert-based tests, including a cross-check against `std::sort` and large duplicate-heavy inputs.

## API

- `int quickselect(std::vector<int>& arr, int k, std::mt19937& rng)` - the k-th smallest element, 0-indexed. Reorders `arr`. Throws `std::invalid_argument` if `arr` is empty and `std::out_of_range` if `k` is invalid.
- `int quickselect(std::vector<int>& arr, int k)` - the same with a generator seeded from `std::random_device`.
- `detail::partition3` - the internal three-way partition, returning `{lt, gt}`.

There is no top-k helper in C++; after `quickselect(arr, k - 1)` the first `k` slots hold the k smallest elements.

## C++-Specific Notes

- `std::nth_element` is the production choice. The standard only guarantees linear time on average; common implementations use introselect with a guaranteed fallback. This header is for learning.
- `std::uniform_int_distribution` gives an unbiased pivot index; `rng() % n` would be slightly biased.
- The loop is iterative, so there is no recursion depth to worry about.
- The vector is reordered in place; copy it first (`auto work = arr;`) if you need the original.
- Only `std::vector<int>` is supported; the header is not a template.

## How to Run

From this folder:

```bash
g++ -std=c++17 -O2 -Wall quickselect_test.cpp -o quickselect_test
./quickselect_test
```

## Key Takeaways

- Three bands (`<`, `==`, `>`) keep duplicate-heavy input linear.
- Use `std::uniform_int_distribution` for the pivot, not a modulo.
- Prefer `std::nth_element` in real code.
