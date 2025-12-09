# Digit DP (Python)

**Digit DP (Digit Dynamic Programming)** is a technique for solving problems involving digits and numbers with constraints, typically using dynamic programming over digit positions.

---

## Overview

Digit DP is used to count numbers in a range [0, n] that satisfy certain properties related to their digits. It's particularly useful for problems involving:
- Digit sums
- Digit patterns
- Divisibility by digits
- Palindromic numbers
- Numbers with specific digit constraints

The key insight is to process digits from left to right (most significant to least significant) and use DP to track the state.

---

## Algorithm

1. **Convert number to digit array**: Represent n as array of digits
2. **DP State**: `dp[pos][tight][state]` where:
   - `pos`: Current digit position
   - `tight`: Whether we're still matching the upper bound
   - `state`: Problem-specific state (e.g., digit sum, pattern)
3. **Recurrence**: For each digit position, try all valid digits
4. **Base Case**: When all digits processed, check if state satisfies constraint

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **All Cases** | O(log n × constraints × base) | O(log n × constraints) |

Where:
- `log n` = number of digits
- `constraints` = number of possible states
- `base` = base of number system (usually 10)

---

## Implementation Details

### Functions

1. **`count_numbers_with_digit_sum(n, target_sum)`**
   - Counts numbers from 0 to n with digit sum equal to target_sum
   - Uses memoization to avoid recomputation
   - Handles tight constraint (matching upper bound)

---

## Usage

```python
from digit_dp import count_numbers_with_digit_sum

# Count numbers from 0 to 100 with digit sum = 5
count = count_numbers_with_digit_sum(100, 5)
print(count)  # Output: 6
# Numbers: 5, 14, 23, 32, 41, 50

# Count numbers from 0 to 1000 with digit sum = 10
count = count_numbers_with_digit_sum(1000, 10)
print(count)  # Output: 63
# Examples: 19, 28, 37, 46, 55, 64, 73, 82, 91, 109, 118, ...

# Count in range [L, R]
def count_in_range(L, R, target_sum):
    return (count_numbers_with_digit_sum(R, target_sum) - 
            count_numbers_with_digit_sum(L-1, target_sum))

count = count_in_range(10, 100, 5)
print(count)  # Numbers from 10 to 100 with digit sum = 5
```

---

## Example: Understanding Tight Constraint

For n = 123, counting numbers ≤ 123:

- **Position 0 (hundreds), digit 1**: Tight = True
  - Can only use digits 0-1
  - If use 0: Tight becomes False (can use 0-9 for rest)
  - If use 1: Tight stays True (must match 2 in tens)
  
- **Position 1 (tens), digit 2**: 
  - If tight: Can only use 0-2
  - If not tight: Can use 0-9

This tight constraint ensures we don't count numbers > n.

---

## Key Concepts

### Tight Constraint

- **Tight = True**: We're still matching the upper bound digit-by-digit
  - Can only use digits ≤ current digit of n
- **Tight = False**: We've already used a smaller digit
  - Can use any digit 0-9

### State Tracking

The state depends on the problem:
- **Digit Sum**: Track current sum
- **Divisibility**: Track remainder
- **Pattern Matching**: Track pattern state

---

## Important Notes

1. **Memoization**: Essential for efficiency, cache (pos, tight, state)
2. **Tight Handling**: Critical for correctness
3. **Base Cases**: Handle edge cases (n=0, empty digits)
4. **State Design**: Choose minimal state representation

---

## Advantages

1. ✅ **Efficient**: O(log n) instead of O(n) brute force
2. ✅ **Flexible**: Can handle various digit constraints
3. ✅ **Range Queries**: Can count in ranges [L, R]

---

## Disadvantages

1. ❌ **Complex**: State design can be tricky
2. ❌ **Memory**: May need large memoization table
3. ❌ **Implementation**: Easy to make mistakes

---

## When to Use

- ✅ Counting numbers with digit properties
- ✅ Range queries on digit constraints
- ✅ Problems involving digit patterns
- ❌ When brute force is sufficient (small n)
- ❌ When constraints are too complex

---

## Common Problem Types

1. **Digit Sum Problems**: Count numbers with specific digit sum
2. **Divisibility**: Count numbers divisible by sum of digits
3. **Palindromic Numbers**: Count palindromes in range
4. **Digit Patterns**: Count numbers matching patterns
5. **Non-decreasing Digits**: Count numbers with non-decreasing digits

---

## Testing

Run the test suite:

```bash
python digit_dp_test.py
```

---

## Comparison: Digit DP vs Brute Force

| Aspect | Digit DP | Brute Force |
|--------|----------|-------------|
| **Time** | O(log n × constraints) | O(n) |
| **Space** | O(log n × constraints) | O(1) |
| **Range** | Works for n up to 10^18 | Limited to n < 10^9 |
| **Efficiency** | Very efficient | Slow for large n |

**Example**: Count numbers ≤ 10^18 with digit sum = 100
- Digit DP: ~18 digits × 100 states × 10 = 18,000 operations
- Brute Force: 10^18 operations (impossible!)

---

## Applications

1. **Number Counting**: Count numbers with specific properties
2. **Range Queries**: Count in ranges [L, R]
3. **Digit Patterns**: Find numbers matching patterns
4. **Competitive Programming**: Common in programming contests

---

## Related Algorithms

- **Range DP**: Similar state compression techniques
- **Bitmask DP**: Similar state representation
- **Number Theory**: Often combined with number theory
- **Combinatorics**: Counting problems

---

## References

- Competitive Programming resources
- Digit DP tutorials on online judges
- Codeforces, AtCoder problems on digit DP

---

_Last Updated: December 2025_

