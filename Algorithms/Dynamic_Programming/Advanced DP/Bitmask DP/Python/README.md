# Bitmask DP (Python)

**Bitmask DP** is a technique that uses bitmasks (integers where each bit represents a state) to compress state space in Dynamic Programming, making it possible to solve problems with exponential state spaces efficiently.

---

## Overview

Bitmask DP is particularly useful for problems involving:
- **Subsets**: Each bit represents whether an element is in the subset
- **Visited States**: Track which nodes/elements have been visited
- **State Compression**: Reduce multi-dimensional state to single integer

The key insight is that an integer can represent a set of boolean states, allowing us to use DP on problems that would otherwise require exponential space.

---

## Algorithm

1. **Represent state as bitmask**: Each bit represents a boolean state
2. **DP State**: `dp[mask][additional_state]` where mask is the bitmask
3. **Transitions**: Flip bits to represent state changes
4. **Base Case**: Empty set (mask = 0) or full set (mask = (1<<n)-1)

---

## Complexity Analysis

| Problem Type | Time | Space | Notes |
|--------------|------|-------|-------|
| **TSP** | O(n² × 2^n) | O(n × 2^n) | n cities, 2^n subsets |
| **Subset DP** | O(n × 2^n) | O(2^n) | n elements |
| **General** | O(states × transitions) | O(states) | Problem-dependent |

**Note**: Practical limit is typically n ≤ 20-25 due to exponential growth.

---

## Implementation Details

### Functions

1. **`traveling_salesman_dp(distances)`**
   - Traveling Salesman Problem using bitmask DP
   - `dp[mask][last]` = minimum cost to visit cities in mask ending at last
   - Returns minimum cost to visit all cities and return to start
   - Time: O(n² × 2^n), Space: O(n × 2^n)

### Bitmask Operations

Common operations used in bitmask DP:
- **Set bit i**: `mask | (1 << i)`
- **Unset bit i**: `mask & ~(1 << i)`
- **Check bit i**: `mask & (1 << i)`
- **Toggle bit i**: `mask ^ (1 << i)`
- **Count set bits**: `bin(mask).count('1')` or `__builtin_popcount`

---

## Usage

```python
from bitmask_dp import traveling_salesman_dp

# Distance matrix between 4 cities
#     A    B    C    D
# A [ 0,  10,  15,  20]
# B [10,   0,  35,  25]
# C [15,  35,   0,  30]
# D [20,  25,  30,   0]
distances = [
    [0, 10, 15, 20],
    [10, 0, 35, 25],
    [15, 35, 0, 30],
    [20, 25, 30, 0]
]

# Find minimum cost TSP tour
# Visit all cities exactly once and return to start
min_cost = traveling_salesman_dp(distances)
print(min_cost)  # Output: 80 (example: A -> B -> D -> C -> A)

# Bitmask operations example
mask = 0b101  # Binary: 101 = cities 0 and 2 visited
print(bin(mask))  # Output: '0b101'

# Add city 1: mask | (1 << 1)
new_mask = mask | (1 << 1)
print(bin(new_mask))  # Output: '0b111' (cities 0, 1, 2 visited)

# Check if city 0 visited: mask & (1 << 0)
if mask & (1 << 0):
    print("City 0 visited")  # Output: City 0 visited
```

---

## Common Problem Types

### 1. Traveling Salesman Problem (TSP)
- Visit all cities exactly once
- Return to starting city
- Minimize total distance
- Classic bitmask DP problem

### 2. Subset Sum
- Find subset with target sum
- Each bit = element included/excluded

### 3. Assignment Problems
- Assign tasks to workers
- Each bit = task assigned/not assigned

### 4. Hamiltonian Path
- Visit all nodes exactly once
- Similar to TSP

### 5. State Compression
- Compress multi-dimensional state
- Reduce memory usage

---

## Key Concepts

### Bitmask Representation

For n elements, use n-bit integer:
- Bit i = 1: element i is included
- Bit i = 0: element i is excluded
- Example: mask = 5 (binary 101) = elements 0 and 2 included

### State Transitions

Common transitions:
- **Add element i**: `new_mask = mask | (1 << i)`
- **Remove element i**: `new_mask = mask & ~(1 << i)`
- **Check if element i in set**: `if mask & (1 << i)`

---

## Important Notes

1. **Size Limit**: Practical for n ≤ 20-25
2. **Memory**: 2^n states can be large
3. **Bit Operations**: Must be comfortable with bit manipulation
4. **State Design**: Choose efficient state representation

---

## Advantages

1. ✅ **State Compression**: Reduce multi-dimensional state
2. ✅ **Efficient**: O(2^n) instead of O(n!) for permutations
3. ✅ **Flexible**: Can handle various subset problems

---

## Disadvantages

1. ❌ **Exponential**: Still exponential in problem size
2. ❌ **Memory**: 2^n states require significant memory
3. ❌ **Complexity**: Bit operations can be error-prone

---

## When to Use

- ✅ Subset problems (n ≤ 20)
- ✅ TSP and similar problems
- ✅ State compression needed
- ❌ Large n (> 25): Use approximation algorithms
- ❌ When greedy/other approaches work

---

## Practical Considerations

- **Memory Optimization**: Use 1D array if possible
- **Iteration Order**: Iterate over masks in increasing order
- **Base Cases**: Handle empty set (mask = 0) carefully
- **Bit Counting**: Use efficient popcount for large masks

---

## Testing

Run the test suite:

```bash
python bitmask_dp_test.py
```

---

## Practical Limitations

For bitmask DP with n elements:
- **n ≤ 15**: Very fast, can use 2^15 = 32,768 states
- **n ≤ 20**: Fast, 2^20 = 1,048,576 states (~1MB memory)
- **n ≤ 25**: Acceptable, 2^25 = 33,554,432 states (~33MB memory)
- **n > 25**: May be too slow/memory intensive, consider alternatives

---

## Applications

1. **Traveling Salesman**: Classic TSP problem
2. **Task Assignment**: Assign tasks to workers optimally
3. **Subset Problems**: Count/optimize over subsets
4. **State Compression**: Compress multi-dimensional states

---

## Related Algorithms

- **Meet in the Middle**: Split problem into two halves (2^(n/2))
- **Branch and Bound**: For TSP with pruning
- **Approximation Algorithms**: For large TSP instances
- **Greedy Algorithms**: When optimality not required

---

## References

- "Introduction to Algorithms" by CLRS
- Competitive Programming resources
- Bitmask DP tutorials
- LeetCode problems on bitmask DP

---

_Last Updated: December 2025_

