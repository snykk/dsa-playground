# Climbing Stairs -- C++ Implementation

The two-variable loop for steps 1 and 2.

## Files

| File | Contents |
|------|----------|
| `climbing_stairs.cpp` | `climbingStairs` |
| `climbing_stairs_test.cpp` | `assert`-based tests; it `#include`s `climbing_stairs.cpp` |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `long long climbingStairs(int n)` | number of ways to climb `n` stairs with steps 1 and 2; `climbingStairs(0)` is 1 | O(n) | O(1) |

It throws `std::invalid_argument` for a negative `n`. There is no memoized or variable-step version here; the Python folder has them.

## C++-Specific Notes

- The result is `long long` and exact up to `n = 91`. For larger `n` the signed addition overflows, which is undefined behaviour.
- The test file includes the `.cpp`, so compile only the test file.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD climbing_stairs_test.cpp -o climbing_stairs_test
./climbing_stairs_test
```

## Key Takeaways

- `ways(n) = F(n + 1)`, so the values grow fast.
- Keep `n <= 91` with a 64-bit result.
- The loop needs only two variables.
