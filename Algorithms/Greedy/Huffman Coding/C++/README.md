# Huffman Coding (C++)

C++ scaffold for Huffman Coding, a greedy algorithm that builds an optimal prefix-free binary code for lossless data compression based on character frequencies. The full implementation is in the Python directory.

## Files

| File | Description |
|------|-------------|
| `huffman_coding.cpp` | Placeholder with `huffmanEncode` signature (see Python for full implementation) |
| `huffman_coding_test.cpp` | Basic encode test |

## How to Run

```bash
g++ -std=c++17 -DTESTING -o test huffman_coding_test.cpp
./test
```

## Key Functions

| Function | Description | Time Complexity |
|----------|-------------|-----------------|
| `huffmanEncode(text)` | Returns a map of characters to their Huffman codes (placeholder) | O(n log n) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(n log n) for building the Huffman tree via a priority queue |
| Space | O(n) for the tree and code table |

## Notes

- Huffman coding assigns shorter codes to more frequent characters and longer codes to rarer ones.
- The algorithm greedily merges the two lowest-frequency nodes until a single tree remains.
- The resulting codes are prefix-free, meaning no code is a prefix of another.
- The Python implementation contains the complete tree builder, encoder, decoder, and compression ratio calculator.
- See `../Python/huffman_coding.py` for the full working implementation.

---

_Last Updated: April 2026_
