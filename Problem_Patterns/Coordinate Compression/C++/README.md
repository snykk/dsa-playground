# Coordinate Compression (C++)

Map large or sparse coordinate values to a compact range of consecutive integers, preserving relative order.

## Files

| File | Description |
|------|-------------|
| `coordinate_compression.cpp` | Main implementation with 1D and 2D compression |
| `coordinate_compression_test.cpp` | Test cases for compress and decompress |

## How to Run

```bash
# Run the demo
g++ -std=c++17 -o coord coordinate_compression.cpp
./coord

# Run tests
g++ -std=c++17 -DTESTING -o test coordinate_compression_test.cpp
./test
```

## Key Functions

| Function | Description | Time Complexity |
|----------|-------------|-----------------|
| `compressCoordinates` | Maps a vector of ints to consecutive indices (0-based) | O(n log n) |
| `decompressCoordinates` | Recovers original values from a compressed mapping | O(n log n) |
| `compress2DCoordinates` | Independently compresses x and y coordinates of 2D points | O(n log n) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(n log n) for sorting/deduplication |
| Space | O(n) for the mapping structures |

## Notes

- Duplicate values are collapsed into a single index.
- The mapping preserves relative order: smaller values get smaller indices.
- 2D compression delegates to `compressCoordinates` on each axis independently.

---

_Last Updated: April 2026_
