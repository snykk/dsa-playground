# Closest Pair of Points -- C++ Implementation

## Files

- `closest_pair.cpp`: `Point`, `Result`, `distance`, `bruteForceClosestPair`, `closestPairRecursive`, `closestPair`. It has no `main`.
- `closest_pair_test.cpp`: assert-based tests (two points, square, lines, closest pair across the divide, duplicates, negative and shared x, too few points, the y-list invariant, and random sets against brute force).

## API

- `closestPair(std::vector<Point>& points)`: returns `Result {dist, p1, p2}`. Throws `std::invalid_argument` for fewer than two points. The vector is not modified.
- `bruteForceClosestPair(points, start, end)`: O(n^2) on a range.

## C++-Specific Notes

- Every point is tagged with its rank in the x order, and the y-list is split by rank, so equal x values and duplicates are handled exactly.
- The test file includes the `.cpp` directly, so compile just the test file (compiling both files together gives duplicate symbols).
- Needs `<limits>` (included).

## How to Run

```bash
g++ -std=c++17 -O2 -Wall closest_pair_test.cpp -o closest_pair_test && ./closest_pair_test
```

## Key Takeaways

- Sort by x and y once; split the y-list consistently with the x-list.
- Only the strip around the dividing line needs checking, with a constant number of neighbors per point.
- O(n log n) time, O(n) space, and exact for duplicates and equal x values.
