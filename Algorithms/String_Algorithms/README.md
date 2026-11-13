# String Algorithms

A comprehensive collection of **String Algorithms** implementations, including pattern matching and advanced string processing algorithms.

---

## Overview

This folder contains implementations of fundamental string algorithms in Python, C++, and Go. Each algorithm includes:
- Complete implementation
- Comprehensive test suites
- Detailed documentation
- Complexity analysis

---

## Categories

### 🔹 Pattern Matching Algorithms

- **[Naive Pattern Search](Pattern_Matching/Naive_Pattern_Search/)**
  - Simplest string matching algorithm
  - Time: O(n × m), Space: O(1)
  - No preprocessing required

- **[KMP Algorithm](Pattern_Matching/KMP_Algorithm/)**
  - Efficient pattern matching with preprocessing
  - Time: O(n + m), Space: O(m)
  - Uses LPS array to avoid rechecking

- **[Rabin-Karp Algorithm](Pattern_Matching/Rabin_Karp_Algorithm/)**
  - Hash-based pattern matching
  - Time: O(n + m) average, O(n × m) worst
  - Uses rolling hash function

- **[Boyer-Moore Algorithm](Pattern_Matching/Boyer_Moore_Algorithm/)**
  - Efficient for long patterns
  - Time: O(n/m) best case, O(n × m) worst
  - Uses bad character and good suffix heuristics

---

### 🔹 Advanced String Algorithms

- **[Z-Algorithm](Advanced_String/Z_Algorithm/)**
  - Constructs Z-array for pattern matching
  - Time: O(n + m), Space: O(n + m)
  - Useful for string processing

- **[Suffix Array](Advanced_String/Suffix_Array/)**
  - Sorted array of all suffixes
  - Time: O(n log n) construction, O(m log n) search
  - Powerful for string processing

- **[Longest Common Substring](Advanced_String/Longest_Common_Substring/)**
  - Finds longest common substring between two strings
  - Time: O(m × n), Space: O(m × n)
  - Uses dynamic programming

- **[Longest Palindromic Substring (Manacher's)](Advanced_String/Longest_Palindromic_Substring_Manachers/)**
  - Finds longest palindromic substring in linear time
  - Time: O(n), Space: O(n)
  - Optimal algorithm for palindrome detection

---

## Comparison

| Algorithm | Time Complexity | Space Complexity | Best For |
|-----------|----------------|-------------------|----------|
| **Naive** | O(n × m) | O(1) | Small texts, simplicity |
| **KMP** | O(n + m) | O(m) | General purpose, guaranteed linear |
| **Rabin-Karp** | O(n + m) avg | O(1) | Multiple patterns, average case |
| **Boyer-Moore** | O(n/m) best | O(m) | Long patterns |
| **Z-Algorithm** | O(n + m) | O(n + m) | String processing |
| **Suffix Array** | O(n log n) | O(n) | Multiple queries |
| **Manacher's** | O(n) | O(n) | Palindrome detection |

---

## When to Use

- **Naive**: Educational purposes, small texts
- **KMP**: When guaranteed linear time is needed
- **Rabin-Karp**: Multiple pattern searches, average case performance
- **Boyer-Moore**: Long patterns, best case performance
- **Z-Algorithm**: String processing, pattern matching
- **Suffix Array**: Multiple pattern queries, string analysis
- **Manacher's**: Palindrome-related problems

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 32)
- "Algorithm Design Manual" by Steven Skiena
- Knuth, D. E., Morris, J. H., & Pratt, V. R. (1977). "Fast pattern matching in strings"
- Manacher, G. (1975). "A new linear-time algorithm for finding the maximum palindrome"

---

_Last Updated: December 2025_

