# Coordinate Compression -- Python Implementation

Maps integer values to dense ranks `0..k-1` using a dictionary.

## Files

| File | Description |
|------|-------------|
| `coordinate_compression.py` | `compress_coordinates`, `decompress_coordinates`, `compress_2d_coordinates` and a demo `main` |
| `coordinate_compression_test.py` | `unittest` tests (6) |

## API

- `compress_coordinates(coords)`: returns a dict from each distinct value to its rank in sorted order. O(n log n).
- `decompress_coordinates(mapping)`: returns the values in rank order (index = rank). Expects ranks `0..k-1`, as produced by `compress_coordinates`.
- `compress_2d_coordinates(points)`: `points` is a list of `(x, y)` pairs; returns the x mapping and the y mapping, compressed independently.

```python
from coordinate_compression import compress_coordinates

mapping = compress_coordinates([1000, 5, 200, 1000, 5, 50])
# {5: 0, 50: 1, 200: 2, 1000: 3}
```

## Python-Specific Notes

- Duplicates share a rank, and an empty input gives an empty dict.
- Values only need to be sortable; integers (including negatives) are the tested case.
- To rank a value that is not in the data, keep the sorted list and use `bisect.bisect_left` instead of the dict.

## How to Run

From this folder:

```bash
python3 -m unittest coordinate_compression_test
python3 coordinate_compression.py
```

## Key Takeaways

- Sort the distinct values; the rank is the index.
- Compress data and query values together.
- Ranks keep order, not distances.
