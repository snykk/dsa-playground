# Bucket Sort -- C++ Implementation

## Files

- `bucket_sort.cpp`: `bucketSort`.
- `bucket_sort_test.cpp`: assert-based tests (basic, 1.0 and 0.0, empty, out-of-range values). It `#include`s `bucket_sort.cpp` directly.

## API

- `void bucketSort(std::vector<double>& arr)`: sorts values in `[0.0, 1.0]` in place using `n` buckets. Throws `std::invalid_argument` for a value outside the range or NaN. An empty vector is a no-op.

```cpp
#include "bucket_sort.cpp"

std::vector<double> arr = {0.897, 0.565, 0.656, 0.1234, 0.665, 0.3434};
bucketSort(arr);
```

## C++-Specific Notes

- It is a plain function over `std::vector<double>`, not a template.
- Buckets are a `std::vector<std::vector<double>>` sorted with `std::sort`, which is not stable and keeps the worst case at O(n log n) per crowded bucket.
- The index is `min(int(n * x), n - 1)`, so `1.0` lands in the last bucket and never indexes past the end.
- Range checks are written `!(x >= 0.0 && x <= 1.0)` so that NaN is rejected too.
- There is no integer variant; use Counting Sort for integers.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD bucket_sort_test.cpp -o bucket_sort_test
./bucket_sort_test
```

## Key Takeaways

- Clamp the `1.0` index; validate the input range.
- Linear time needs an even spread of values.
- The library sort inside buckets is unstable.
