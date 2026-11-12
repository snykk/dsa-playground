# Coordinate Compression -- C++ Implementation

Maps `int` values to dense ranks `0..k-1` with `std::set` and `std::map`.

## Files

| File | Description |
|------|-------------|
| `coordinate_compression.cpp` | `compressCoordinates`, `decompressCoordinates`, `compress2DCoordinates` and a demo `main` (disabled when `IS_TEST_BUILD` is defined) |
| `coordinate_compression_test.cpp` | Assertion-based tests (4); it includes the `.cpp` file |

## API

- `map<int, int> compressCoordinates(const vector<int>& coords)`: value to rank in sorted order.
- `vector<int> decompressCoordinates(const map<int, int>& mapping)`: the values in rank order.
- `pair<map<int, int>, map<int, int>> compress2DCoordinates(const vector<pair<int, int>>& points)`: independent x and y mappings.

## C++-Specific Notes

- `std::map` lookups are O(log k). For many lookups, sort and `unique` a `vector<int>` and use `std::lower_bound`, which also ranks values that are not in the data.
- Values are `int`; use `long long` for values beyond 32 bits.
- `decompressCoordinates` indexes by rank and expects ranks `0..k-1`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD coordinate_compression_test.cpp -o coordinate_compression_test
./coordinate_compression_test
```

## Key Takeaways

- `set` plus `map` is the simplest correct version; `sort` plus `unique` plus `lower_bound` is the usual contest form.
- Compress data and queries together.
