# Convex Hull Trick -- C++ Implementation

Header-only `MonotonicCHT` and `LiChaoTree` for minimum queries, with 64-bit integer coefficients.

## Files

| File | Description |
|------|-------------|
| `cht.h` | `MonotonicCHT` and `LiChaoTree` |
| `cht_test.cpp` | Assertion-based tests (5): classic examples, equal slopes, random stress against a brute-force minimum |

## API

- `MonotonicCHT`: `addLine(long long m, long long b)` (slopes non-increasing; equal slopes keep the lower intercept) and `long long query(long long x)` (x non-decreasing). Querying an empty structure is undefined behaviour.
- `LiChaoTree(long long lo, long long hi)`: `addLine(m, b)` in any order and `long long query(x)`. An empty tree returns `LLONG_MAX`; `x` outside `[lo, hi]` is not checked.

## C++-Specific Notes

- The redundancy test widens the operands to `__int128` before subtracting and multiplying, so it cannot overflow for 64-bit inputs. `__int128` is a GCC and Clang extension. The line value `m * x + b` is still computed in 64 bits and must fit.
- `std::deque<Line>` gives O(1) `pop_front` for the monotonic CHT.
- The Li Chao tree owns its nodes through raw pointers, frees them in the destructor, and has its copy constructor and copy assignment deleted so a copy cannot double-free.
- The recursion depth of the Li Chao tree is about log2 of the range size.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD cht_test.cpp -o cht_test
./cht_test
```

## Key Takeaways

- Widen before subtracting when comparing line intersections.
- A class that owns raw pointers needs a destructor and no copying.
- Both CHT variants are minimum-only; for the maximum, flip the comparisons.
