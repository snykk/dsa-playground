# Digit DP (C++)

C++ scaffold for Digit Dynamic Programming, a technique for counting numbers in a range that satisfy digit-level constraints. The full implementation is in the Python directory.

## Files

| File | Description |
|------|-------------|
| `digit_dp.cpp` | Placeholder structure (see Python for full implementation) |
| `digit_dp_test.cpp` | Basic structure test |

## How to Run

```bash
g++ -std=c++17 -DTESTING -o test digit_dp_test.cpp
./test
```

## Key Concepts

| Concept | Description | Typical Complexity |
|---------|-------------|-------------------|
| Count by digit sum | Count numbers from 0 to n whose digits sum to a target | O(log n * target_sum) |
| Tight constraint | Track whether the current prefix equals the upper bound's prefix | -- |
| State: `dp(pos, tight, sum)` | Position in digit string, whether still bounded, and running digit sum | -- |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(log n * target_sum) with memoization |
| Space | O(log n * target_sum) for the memo table |

## Notes

- Digit DP processes numbers digit by digit from most significant to least significant.
- The "tight" flag tracks whether the digits chosen so far match the upper bound exactly.
- Common applications: counting numbers with specific digit sums, digit patterns, or divisibility rules.
- See `../Python/digit_dp.py` for the full working implementation.

---

_Last Updated: April 2026_
