# Bitmask DP -- Python Implementation

A Traveling Salesman Problem solver over subsets of cities encoded as bitmasks.

## Files

| File | Description |
|------|-------------|
| `bitmask_dp.py` | `traveling_salesman_dp` |
| `bitmask_dp_test.py` | `unittest` tests (4) |

## API

- `traveling_salesman_dp(distances)`: `distances` is an n x n matrix (list of lists). Returns the minimum cost of a tour that starts at city 0, visits every city once and returns to city 0. Returns `0` for an empty matrix and for a single city with a zero self-distance, and `float('inf')` when no tour exists.

The table is `dp[mask][last]`, a list of `1 << n` rows of n floats. Masks without bit 0 are skipped.

## Python-Specific Notes

- Missing edges are represented by `float('inf')`. The result is `inf` when every tour needs a missing edge; it is never 0 in that case.
- The table has n * 2^n entries. For n = 20 that is about 21 million Python floats (hundreds of megabytes), so keep n around 15 or less in Python.
- `distances` can contain ints or floats; the result is an int when all used values are ints and the tour exists.
- No path reconstruction: only the cost is returned.

## How to Run

From this folder:

```bash
python3 -m unittest bitmask_dp_test
```

## Key Takeaways

- A set of cities is an integer, so `dp[mask][last]` is a plain 2D list.
- Increasing mask order is a valid evaluation order because transitions only add bits.
- Infinity must survive to the end so an impossible tour is not reported as free.
