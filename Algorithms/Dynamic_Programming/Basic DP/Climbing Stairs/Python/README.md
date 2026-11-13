# Climbing Stairs (Python)

**Climbing Stairs** is a classic Dynamic Programming problem that asks: "In how many distinct ways can you climb to the top of a staircase with n steps, if you can take either 1 or 2 steps at a time?"

---

## Overview

This problem is essentially the Fibonacci sequence! The number of ways to reach step n equals the sum of ways to reach step (n-1) and step (n-2), because you can arrive at step n from either step (n-1) with a 1-step, or from step (n-2) with a 2-step.

**Example**: For n=5 steps:
- Ways(5) = Ways(4) + Ways(3) = 5 + 3 = 8 ways
- Sequence: 1, 2, 3, 5, 8, 13, 21, ... (Fibonacci!)

---

## Algorithm

1. **Base Cases**: 
   - Ways(0) = 1 (one way: the empty climb, take no step)
   - Ways(1) = 1 (only one way: take 1 step)
   - Ways(2) = 2 (two ways: 1+1 or 2)
2. **Recurrence Relation**: 
   - Ways(n) = Ways(n-1) + Ways(n-2) for n > 2
3. **DP Approach**: 
   - Build solution bottom-up using tabulation
   - Or use memoization for top-down approach
   - Optimize space to O(1) by storing only last two values

---

## Complexity Analysis

| Approach | Time | Space |
|----------|------|-------|
| **Naive Recursive** | O(2^n) | O(n) |
| **Memoization** | O(n) | O(n) |
| **Tabulation** | O(n) | O(n) |
| **Space-Optimized** | O(n) | O(1) |

**Note**: Naive recursive has exponential time due to recalculating same subproblems. DP reduces this to linear time.

---

## Implementation Details

### Functions

1. **`climbing_stairs_naive(n)`**
   - Naive recursive implementation
   - O(2^n) time complexity
   - Demonstrates why DP is needed
   - Not recommended for production

2. **`climbing_stairs_memoization(n, memo=None)`**
   - Top-down Dynamic Programming
   - Uses dictionary to cache results
   - O(n) time and space
   - More intuitive (recursive style)

3. **`climbing_stairs_tabulation(n)`**
   - Bottom-up Dynamic Programming
   - Fills array iteratively
   - O(n) time and space
   - Standard DP approach

4. **`climbing_stairs_optimized(n)`**
   - Space-optimized version
   - Only stores last two values
   - O(n) time, O(1) space
   - Best for most practical cases

5. **`climbing_stairs_variable_steps(n, steps)`**
   - Generalization: can take steps from list
   - Steps can be [1, 2, 3, ...] or any combination
   - Uses DP with different recurrence
   - Time: O(n × k) where k is number of step sizes

---

## Usage

```python
from climbing_stairs import (
    climbing_stairs_naive,
    climbing_stairs_memoization,
    climbing_stairs_tabulation,
    climbing_stairs_optimized,
    climbing_stairs_variable_steps
)

# Standard tabulation (recommended)
ways = climbing_stairs_tabulation(5)
print(ways)  # Output: 8

# Space-optimized (best for large n)
ways = climbing_stairs_optimized(10)
print(ways)  # Output: 89

# Memoization (top-down)
ways = climbing_stairs_memoization(7)
print(ways)  # Output: 21

# Variable steps (can take 1, 2, or 3 steps)
ways = climbing_stairs_variable_steps(5, [1, 2, 3])
print(ways)  # Output: 13 (more ways than 1 or 2 steps only)

# Naive (for comparison - very slow for large n)
ways = climbing_stairs_naive(10)  # Slow!
print(ways)  # Output: 89
```

---

## Important Notes

1. **Fibonacci Connection**: Ways(n) = F(n+1), the Fibonacci numbers shifted by one: Ways(0..5) = 1, 1, 2, 3, 5, 8 = F(1..6)
2. **Integer Overflow**: For very large n, use big integers or modulo arithmetic
3. **Space Optimization**: Use optimized version when space is constrained
4. **Base Cases**: Always handle n=0 (1 way), n=1 and n=2 correctly; every function raises `ValueError` for n < 0
5. **Variable Steps**: Generalization allows any step sizes, not just 1 and 2

---

## Advantages

1. ✅ **Multiple Approaches**: Choose based on constraints
2. ✅ **Educational Value**: Perfect DP learning example
3. ✅ **Space Optimization**: Can achieve O(1) space
4. ✅ **Generalizable**: Can extend to variable step sizes

---

## Disadvantages

1. ❌ **Naive Recursive**: Exponential time, not practical
2. ❌ **Large Numbers**: Fibonacci grows exponentially, need big integers
3. ❌ **Overhead**: DP has constant factor overhead vs direct formula

---

## When to Use

- ✅ **Tabulation/Optimized**: General purpose, n < 10^6
- ✅ **Memoization**: When recursive structure is more intuitive
- ✅ **Variable Steps**: When step sizes are not fixed
- ❌ **Naive Recursive**: Never in production, only for learning

---

## Practical Considerations

- **Modulo Arithmetic**: Often needed in competitive programming (e.g., ways mod 10^9+7)
- **Precomputation**: For multiple queries, precompute and store
- **Cache Performance**: Tabulation has better cache locality than memoization
- **Recursion Depth**: Memoization may hit recursion limits for large n

---

## Testing

Run the test suite:

```bash
python climbing_stairs_test.py
```

The test suite includes:
- Base case verification
- Small value tests
- Comparison between all approaches
- Variable steps tests

---

## Related Algorithms

- **Fibonacci Numbers**: Same recurrence relation, different problem
- **Coin Change**: Similar DP pattern with different constraints
- **Unique Paths**: Grid-based version of similar problem

---

## Applications

1. **Algorithm Analysis**: Used in algorithm complexity analysis
2. **Combinatorics**: Counting paths and sequences
3. **Dynamic Programming**: Foundation for learning DP
4. **Interview Questions**: Common coding interview problem

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 15)
- "Algorithm Design Manual" by Steven Skiena
- LeetCode Problem 70: Climbing Stairs

---

_Last Updated: December 2025_

