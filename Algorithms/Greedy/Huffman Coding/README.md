# Huffman Coding

**Huffman Coding** is a lossless data compression algorithm that assigns variable-length codes to characters based on their frequencies.

---

## Overview

More frequent characters get shorter codes, creating an optimal prefix-free code that minimizes total encoded length.

---

## Algorithm

1. Count character frequencies
2. Build min-heap of nodes
3. Merge nodes with lowest frequency
4. Build encoding table
5. Encode/decode text

---

## Complexity

- **Time**: O(n log n) for building tree
- **Space**: O(n)

---

## Implementations

- **Python** (`Python/`) - Complete with tree building
- **C++** (`C++/`) - Basic structure
- **Go** (`Go/`) - Basic structure

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 16)

---

_Last Updated: December 2025_

