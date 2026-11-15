# Bitmask DP -- C++ Implementation

A Traveling Salesman Problem solver over subsets of cities encoded as bitmasks, ported from the Python version in C++17.

## Files

| File | Description |
|------|-------------|
| `bitmask_dp.cpp` | `kInfinity` and `travelingSalesmanDp` |
| `bitmask_dp_test.cpp` | 6 assert-based tests: the Python cases (4-city tour, no tour, trivial sizes, triangle), values printed by the Python code, and 300 random matrices checked against a brute force over all city orders |

## API

| Name | Description |
|------|-------------|
| `constexpr double kInfinity` | `std::numeric_limits<double>::infinity()`: marks a missing edge, and is the result when no tour exists (Python's `float('inf')`) |
| `double travelingSalesmanDp(const std::vector<std::vector<double>>& distances)` | minimum cost of a tour that starts at city 0, visits every city once and returns to city 0; `0` for an empty matrix, `kInfinity` when no tour exists |

```cpp
std::vector<std::vector<double>> d = {{0, 10, 15, 20}, {10, 0, 35, 25}, {15, 35, 0, 30}, {20, 25, 30, 0}};
double cost = travelingSalesmanDp(d);  // 80
```

## C++-Specific Notes

- Distances and the result are `double`, as in Python, so `kInfinity` survives additions (`inf + 5` is still infinity) and an impossible tour is never reported as free. Integer distances below 2^53 are added exactly.
- The table is a `std::vector<std::vector<double>>` of `(1 << n)` rows of n cells: n = 20 needs about 21 million doubles (168 MB), so keep n to about 20.
- Masks are `std::size_t`, so `std::size_t{1} << j` does not overflow 32 bits.
- The loops, the order of evaluation and the ties in `std::min` are the same as in Python, so the result is the same value bit for bit.
- The matrix must be n x n; the function does not check it. Only the cost is returned, not the tour.

## How to Run

```bash
cd "Algorithms/Dynamic_Programming/Advanced_DP/Bitmask_DP/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD bitmask_dp_test.cpp -o bitmask_dp_test
./bitmask_dp_test
```

## Key Takeaways

- `dp[mask][last]` is a plain 2D vector indexed by the set of visited cities.
- Increasing mask order is a valid evaluation order because transitions only add bits.
- Use a real infinity (or a sentinel that cannot overflow) for missing edges.
