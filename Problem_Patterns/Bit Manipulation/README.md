# Bit Manipulation Patterns

**Bit Manipulation** is a technique that operates directly on the binary representation of integers. It is used for optimization, encoding, and solving problems that have natural binary structure.

---

## Overview

Many problems can be solved more efficiently by working with individual bits rather than higher-level arithmetic. Bit manipulation is especially useful in competitive programming, systems programming, and interview problems.

---

## Common Tricks

| Trick                        | Expression          | Description                            |
| ---------------------------- | ------------------- | -------------------------------------- |
| Check if power of 2          | `n & (n - 1) == 0`  | Only one bit is set                    |
| Get i-th bit                 | `(n >> i) & 1`       | Shift right, mask with 1              |
| Set i-th bit                 | `n \| (1 << i)`      | OR with bit mask                       |
| Clear i-th bit               | `n & ~(1 << i)`     | AND with inverted mask                 |
| Toggle i-th bit              | `n ^ (1 << i)`      | XOR with bit mask                      |
| Lowest set bit               | `n & (-n)`          | Isolate the rightmost 1-bit            |
| Turn off lowest set bit      | `n & (n - 1)`       | Brian Kernighan's trick                |
| Check even/odd               | `n & 1`             | Last bit determines parity             |

---

## XOR Properties

- `a ^ a = 0` (self-inverse)
- `a ^ 0 = a` (identity)
- `a ^ b = b ^ a` (commutative)
- `(a ^ b) ^ c = a ^ (b ^ c)` (associative)
- Used for: finding unique elements, swapping without temp, error detection

---

## Bit Counting Techniques

- **Brian Kernighan's Algorithm**: Count set bits by repeatedly clearing the lowest set bit. Runs in O(number of set bits).
- **Hamming Distance**: XOR two numbers, then count set bits in the result.
- **Lookup Table**: Precompute bit counts for small values (e.g., bytes) for O(1) per byte.

---

## When to Use Bit Manipulation

- Toggle/flag operations (permissions, feature flags)
- Subset enumeration using bitmasks
- Space-efficient representations (bit arrays, bloom filters)
- Problems involving XOR, AND, OR constraints
- Optimization where arithmetic is a bottleneck

---

## Complexity

Most individual bit operations run in O(1). Algorithms like Brian Kernighan's run in O(k) where k is the number of set bits.

---

## Implementations

This folder contains implementations in three languages:
- **Python** (`Python/`)
- **C++** (`C++/`)
- **Go** (`Go/`)
