# Inclusion-Exclusion Principle Pattern

The **Inclusion-Exclusion Principle** is a counting technique used to find the size of the union of sets. It systematically includes and excludes intersections to avoid double-counting, providing an elegant solution to many combinatorial counting problems.

---

## Overview

The inclusion-exclusion principle states that for sets A₁, A₂, ..., Aₙ:

|A₁ ∪ A₂ ∪ ... ∪ Aₙ| = Σ|Aᵢ| - Σ|Aᵢ ∩ Aⱼ| + Σ|Aᵢ ∩ Aⱼ ∩ Aₖ| - ... + (-1)^(n+1)|A₁ ∩ A₂ ∩ ... ∩ Aₙ|

This formula alternates between inclusion and exclusion, ensuring each element is counted exactly once.

The principle is particularly useful for:
- Counting elements in union of sets
- Problems with "at least one" constraints
- Divisibility problems
- Combinatorial counting

---

## Key Characteristics

1. **Alternating Signs**: Alternates between addition and subtraction
2. **Systematic**: Covers all possible intersections
3. **Exact Counting**: Ensures each element counted exactly once
4. **Exponential**: Requires 2^n iterations for n sets

---

## Operations

| Operation | Description | Time Complexity | Space Complexity |
|-----------|-------------|----------------|------------------|
| `count_divisible(n, divisors)` | Count numbers divisible by any divisor | O(2^k × f(n)) | O(k) |
| `count_union_sets(sets)` | Count elements in union of sets | O(2^n × m) | O(m) |
| `gcd(a, b)` | Greatest common divisor (helper) | O(log(min(a,b))) | O(1) |

Where k is number of divisors, n is number of sets, m is average set size.

---

## Implementation Approaches

### 1. Bitmask Enumeration
- **Pros**: Systematic, covers all subsets
- **Cons**: Exponential time complexity
- **Use Case**: Small number of sets (n ≤ 20)

### 2. Recursive Inclusion-Exclusion
- **Pros**: More intuitive for some problems
- **Cons**: Similar complexity, more stack space
- **Use Case**: When recursion is natural

### 3. Iterative with LCM
- **Pros**: Efficient for divisibility problems
- **Cons**: Requires LCM calculation
- **Use Case**: Divisibility and number theory problems

---

## Applications

1. **Divisibility Problems**: Count numbers divisible by any of given divisors
2. **Set Union**: Count elements in union of multiple sets
3. **Combinatorial Counting**: Count objects satisfying "at least one" condition
4. **Number Theory**: Problems involving multiples and divisors
5. **Probability**: Calculating probabilities with multiple events

---

## Example Use Cases

### Count Divisible Numbers
```python
n = 100
divisors = [2, 3, 5]
result = count_divisible(n, divisors)
# Counts numbers from 1 to 100 divisible by 2, 3, or 5
```

### Count Union of Sets
```python
sets = [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
result = count_union_sets(sets)
# Counts unique elements in union: {1, 2, 3, 4, 5} = 5
```

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - List and set-based implementation
- **C++** (`C++/`) - Vector and set-based implementation
- **Go** (`Go/`) - Slice and map-based implementation

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Complexity Summary

| Problem Type | Time Complexity | Space Complexity |
|--------------|----------------|------------------|
| **Divisibility** | O(2^k × log(max)) | O(k) |
| **Set Union** | O(2^n × m) | O(m) |
| **General** | O(2^n × f(n)) | O(n) |

Where k is number of divisors, n is number of sets, m is average set size.

---

## When to Use

- **Set Union Problems**: When need to count union of multiple sets
- **Divisibility**: Problems involving "divisible by any of"
- **"At Least One"**: Problems with "at least one condition satisfied"
- **Small Number of Sets**: When n is small enough for 2^n to be feasible
- **Combinatorial Counting**: Counting problems with multiple constraints

---

## Related Patterns

- **Combinatorics**: Fundamental counting technique
- **Number Theory**: Often used with GCD/LCM
- **Set Theory**: Core set operation counting

---

## Further Reading

- "Concrete Mathematics" by Graham, Knuth, Patashnik
- "Competitive Programming" by Halim & Halim
- "Introduction to Algorithms" by CLRS
- LeetCode problems: Count Numbers With Unique Digits

---

**Note**: The inclusion-exclusion principle is most effective when the number of sets is relatively small (n ≤ 20) due to exponential complexity. For larger problems, consider alternative approaches or optimizations.

---

_Last Updated: December 2025_
