# Competitive Programming Utilities

A comprehensive collection of templates, optimization techniques, and problem-solving patterns for competitive programming.

## Directory Structure

```
Utilities/
├── Templates/
│   ├── Cpp_Boilerplate/     # C++ template with macros and utilities
│   ├── Python_Boilerplate/  # Python template with fast I/O
│   └── Go_Boilerplate/      # Go template for competitive programming
├── Optimization_Techniques/
│   ├── Fast_IO/             # Fast input/output techniques
│   ├── Modular_Arithmetic/  # Modular arithmetic tricks
│   ├── Bitmasking/          # Bit manipulation techniques
│   └── Precomputation/      # Precomputation strategies
└── Problem_Types/
    ├── Interactive/         # Interactive problem techniques
    ├── Constructive/        # Constructive algorithm patterns
    └── Game_Theory/         # Game theory basics
```

## Templates

### C++ Boilerplate
- Type definitions (ll, vi, pii, etc.)
- Useful macros (pb, mp, all, rep)
- Math utilities (gcd, lcm, power, modInverse)
- Data structures (DSU, SegTree)
- Graph utilities (BFS, DFS)

### Python Boilerplate
- Fast I/O (sys.stdin.readline)
- Combinatorics class
- Union-Find, Segment Tree
- Binary search utilities

### Go Boilerplate
- Buffered I/O
- Math utilities
- Data structures

## Optimization Techniques

### Fast I/O
- Standard fast I/O setup
- getchar/putchar methods
- Buffered I/O classes
- Python-specific optimizations

### Modular Arithmetic
- Safe modulo operations
- Fast exponentiation
- Modular inverse (Fermat's, Extended GCD)
- Factorial precomputation
- Lucas' theorem

### Bitmasking
- Basic bit operations
- Subset enumeration
- Gosper's hack
- Bitmask DP (TSP, subset sum)
- SOS DP

### Precomputation
- Factorials and inverse factorials
- Prime sieve, SPF
- Prefix sums (1D, 2D)
- Sparse tables
- Binary lifting (LCA)

## Problem Types

### Interactive Problems
- Output flushing techniques
- Binary search strategies
- Graph exploration
- Query optimization

### Constructive Algorithms
- Permutation construction
- Array/string building
- Graph construction
- Greedy approaches

### Game Theory
- Nim and variants
- Sprague-Grundy theorem
- Wythoff's game
- DP-based analysis

## Usage

Each subdirectory contains:
- Implementation files (.cpp, .py)
- Test files (*_test.cpp, *_test.py)
- README.md with explanations

## Complexity Reference

| Technique | Build | Query | Space |
|-----------|-------|-------|-------|
| Factorial precomputation | O(n) | O(1) | O(n) |
| Prime sieve | O(n log log n) | O(1) | O(n) |
| Prefix sum | O(n) | O(1) | O(n) |
| Sparse table | O(n log n) | O(1) | O(n log n) |
| DSU | - | O(α(n)) | O(n) |
| Segment Tree | O(n) | O(log n) | O(n) |

