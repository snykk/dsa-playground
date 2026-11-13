# Closest Pair of Points

Given n points in the plane, find the two that are closest together. Checking all pairs takes O(n^2). Divide and conquer does it in O(n log n): split the points at a vertical line, solve each half, then check only a narrow strip around the line, where each point needs just a handful of comparisons.

## Intuition

Sort the points by x and cut them in two equal halves. The closest pair is either inside the left half, inside the right half, or has one point on each side. The first two cases are the same problem on half the points. For the third, let `delta` be the smaller of the two best distances. A crossing pair can only beat `delta` if both points are within `delta` of the dividing line, and, scanning that strip from bottom to top, a point only has to be compared with the few points that are less than `delta` above it.

Invariant: at each recursion level `points_y` holds exactly the points of `points_x` for that level, sorted by y. The split of `points_y` must follow the split of `points_x` (membership), not the test `x <= mid_x`.

## Visual

```text
8                |         G
7                |
6     B          |E
5              D |
4                |
3                |            H
2        C       |
1                |      F
0  A             |
   0  1  2  3  4  5  6  7  8  9  

left half: A B C D   right half: E F G H   (the split line is at x = 5, drawn between D and E)
delta = 2.83; strip |x - 5| < delta holds D (4,5), E (5,6), F (7,1); scanned by y: F, D, E
best crossing pair: D-E, distance 1.41
```

## How It Works

1. Sort the points into `points_x` (by x, then y) and `points_y` (by y). This is done once.
2. If there are at most 3 points, compare all pairs and return.
3. Split `points_x` at `mid = n / 2`. Split `points_y` into the same two halves by membership, keeping the y order.
4. Recurse into both halves; `delta` is the smaller best distance.
5. Build the strip: the points of `points_y` with `|x - mid_x| < delta`.
6. For each strip point, compare it with the following points while their y is less than `delta` above it. At most 7 comparisons are ever needed, by a packing argument.

## Step-by-Step Trace

Points `A (0,0)`, `B (1,6)`, `C (2,2)`, `D (4,5)`, `E (5,6)`, `F (7,1)`, `G (8,8)`, `H (9,3)`:

| Step | What happens | Result |
|------|--------------|--------|
| Left half | best pair A-C: (0,0) and (2,2) | 2.828 |
| Right half | best pair F-H: (7,1) and (9,3) | 2.828 |
| delta | the smaller of the two | 2.828 |
| Strip | `abs(x - 5) < 2.828`: D, E, F, sorted by y: F, D, E | three points |
| Scan F | next point D is 4 above F, not less than delta: stop | no distance computed |
| Scan D | next point E is 1 above D: distance of (4,5) and (5,6) | 1.414, new best |
| Answer | closest pair D-E | 1.414 |

The whole run computes 9 distances, against 28 pairs for brute force.

## Complexity

| Approach | Time | Space |
|----------|------|-------|
| Divide and conquer (this folder) | O(n log n) | O(n) |
| Brute force | O(n^2) | O(1) |

The recurrence is T(n) = 2 T(n/2) + O(n): splitting the y-list, building the strip and scanning it are all linear. The two initial sorts cost O(n log n), the same order. Space is O(n) for the y-lists of one level and the strip. In one run on 2,000 random points (coordinates up to 10^6), the Python version computed 2,287 distances against 1,999,000 pairs.

## When to Use

- Closest or nearest-neighbor pair among a few hundred points or more.
- As a model of a divide and conquer whose combine step needs care.
- Use plain brute force for small n; use a sweep line or a hash grid if you need other trade-offs (not implemented here).

## Closest Pair vs. Alternatives

| Approach | Time | In this folder |
|----------|------|----------------|
| Brute force | O(n^2) | base case only |
| Divide and conquer with presorted y | O(n log n) | yes |
| Divide and conquer re-sorting the strip | O(n log^2 n) | no |
| Sweep line with a balanced tree | O(n log n) | no |
| Randomized grid | expected O(n) | no |

## Common Pitfalls

- Splitting the y-list by `x <= mid_x` breaks the invariant when several points share the dividing x. Results stay correct because parent strips re-check those points, but the proof needs the invariant. Split by membership or rank.
- Not stopping the strip scan once the y-gap reaches `delta`.
- Forgetting the strip: the best pair may straddle the dividing line.
- Duplicate points are valid input and give distance 0.
- Fewer than two points: Python raises `ValueError`, C++ throws `std::invalid_argument`, Go panics.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `closest_pair.py` | `closest_pair` and `closest_pair_optimized` (strip capped at 6 following points) |
| C++ | [C++](C++/) | `closest_pair.cpp` | `closestPair(std::vector<Point>&)` returns a `Result` |
| Go | [Go](Go/) | `main.go` | `ClosestPair([]Point)` returns a `Result` |

## Practice Problems

- [Minimum Euclidean Distance (CSES)](https://cses.fi/problemset/task/2194)

## Related

- [Computational Geometry](../../README.md)
- [Convex Hull](../Convex_Hull/README.md)
- [Merge Sort](../../../Sorting/Merge_Sort/README.md)
