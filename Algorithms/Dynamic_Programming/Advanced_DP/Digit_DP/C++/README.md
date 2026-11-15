# Digit DP -- C++ Implementation

Counts the numbers in `0..n` whose decimal digit sum equals a target, with a memoized recursion over `(position, tight, sum)`, ported from the Python version in C++17.

## Files

| File | Description |
|------|-------------|
| `digit_dp.cpp` | `countNumbersWithDigitSum` |
| `digit_dp_test.cpp` | 7 assert-based tests: the Python cases (including the brute-force grid), values printed by the Python code up to `LLONG_MAX`, and 400 random bounds up to 5000 checked against counting one by one |

## API

| Name | Description |
|------|-------------|
| `long long countNumbersWithDigitSum(long long n, int targetSum)` | the count of `x` with `0 <= x <= n` and digit sum `targetSum`; `0` when `n < 0` (so `count(R) - count(L - 1)` works for `L = 0`) and when `targetSum < 0`, as in Python |

```cpp
countNumbersWithDigitSum(100, 5);                                 // 6: 5, 14, 23, 32, 41, 50
countNumbersWithDigitSum(100, 5) - countNumbersWithDigitSum(9, 5);  // 5
```

## C++-Specific Notes

- `n` is a `long long`, so bounds up to `LLONG_MAX` (about 9.2 * 10^18) work; Python has no upper limit. Counts are `long long` and cannot overflow because a count is at most `n + 1`.
- The memo is a `std::vector` indexed by `[pos][tight][sum]` with `-1` for "not computed", created inside each call. Its sum dimension is `min(targetSum, 9 * digits) + 1`, the sums that can be stored, so a huge target does not allocate a huge table.
- The digits come from `std::to_string(n)`; the recursion depth is the number of digits (at most 19).

## How to Run

```bash
cd "Algorithms/Dynamic_Programming/Advanced_DP/Digit_DP/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD digit_dp_test.cpp -o digit_dp_test
./digit_dp_test
```

## Key Takeaways

- The tight flag is part of the memo key because a tight state and a free state differ.
- Prune on `sum + d <= target` to keep the state space small.
- Subtracting `count(L - 1)` gives range counts, and `count(-1)` is 0.
