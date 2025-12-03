# Suffix Array

A **Suffix Array** is a sorted array of all suffixes of a string. It's a simpler alternative to Suffix Tree with similar functionality for pattern matching and string operations.

---

## Overview

Suffix Array is widely used in:
- **Pattern Matching**: Efficient substring search
- **String Compression**: LZ77, Burrows-Wheeler Transform
- **Bioinformatics**: DNA sequence analysis
- **Competitive Programming**: String problems

---

## Operations

| Operation      | Description                    | Time Complexity |
| -------------- | ------------------------------ | --------------- |
| `search(pattern)` | Search for pattern        | O(m log n)      |
| `get_suffixes()` | Get sorted suffixes        | O(n)            |
| `longest_common_prefix()` | LCP between suffixes | O(n)            |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Build     | O(n log n)      | O(n)             |
| Search    | O(m log n)      | O(1)             |
| Space     | O(n)            | O(n)             |

---

## Comparison with Suffix Tree

| Feature         | Suffix Tree | Suffix Array |
| --------------- | ----------- | ------------ |
| Construction    | O(n)        | O(n log n)   |
| Pattern Search  | **O(m)** ⚡ | O(m log n)   |
| Space           | O(n)        | O(n)         |
| Implementation  | Complex     | **Simpler** ✅ |

**Key Difference**: Suffix Tree provides faster O(m) pattern search, but Suffix Array is simpler to implement.

**When to use Suffix Array:**
- ✅ Simpler implementation needed
- ✅ O(m log n) search is acceptable
- ✅ Less code complexity
- ✅ Educational purposes

**When to use Suffix Tree:**
- ⚡ Need fastest pattern matching (O(m))
- ⚡ Multiple pattern searches
- ⚡ Advanced string algorithms

**Note**: See `../Suffix Tree/` for the tree-based implementation.

---

## Implementations

This folder contains implementations in three languages:
- **Python** (`Python/`)
- **C++** (`C++/`)
- **Go** (`Go/`)

