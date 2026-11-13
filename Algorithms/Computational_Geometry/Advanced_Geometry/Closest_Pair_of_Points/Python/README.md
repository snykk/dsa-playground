# Closest Pair of Points -- Python Implementation

## Files

- `closest_pair.py`: `distance`, `brute_force_closest_pair`, `split_by_membership`, `closest_pair_recursive`, `closest_pair`, `closest_pair_optimized`, `closest_pair_recursive_optimized`.
- `closest_pair_test.py`: unit tests (two points, square, lines, closest pair across the divide, duplicates, negative and shared x, too few points, the y-list invariant, and random sets against brute force).

## API

- `closest_pair(points)`: `points` is a list of `(x, y)` tuples; returns `(distance, point1, point2)`. Raises `ValueError` for fewer than two points.
- `closest_pair_optimized(points)`: the same result; ties in the sorts are broken by the other coordinate and the strip scan looks at most 6 following points.
- `brute_force_closest_pair(points)`: O(n^2), used for sets of at most 3 points.
- `split_by_membership(points_y, left_x)`: splits the y-sorted list like the x-sorted one was split.

```python
from closest_pair import closest_pair

print(closest_pair([(0, 0), (1, 6), (2, 2), (4, 5), (5, 6), (7, 1), (8, 8), (9, 3)]))
# (1.4142135623730951, (4, 5), (5, 6))
```

## Python-Specific Notes

- Points can be any sequence with `p[0]` and `p[1]`; duplicates are allowed and give distance 0.
- The recursion is about log2(n) deep, so there is no recursion limit problem.
- Python 3.9 and later.

## How to Run

```bash
python3 -m unittest closest_pair_test
```

## Key Takeaways

- Sort by x and y once; split the y-list consistently with the x-list.
- Only the strip around the dividing line needs checking, with a constant number of neighbors per point.
- O(n log n) time, O(n) space, and exact for duplicates and equal x values.
