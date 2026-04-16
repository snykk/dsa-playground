# Huffman Coding (Go)

Go scaffold for Huffman Coding, a greedy algorithm that builds an optimal prefix-free binary code for lossless data compression based on character frequencies. The full implementation is in the Python directory.

## Files

| File | Description |
|------|-------------|
| `main.go` | Placeholder with `HuffmanEncode` signature (see Python for full implementation) |
| `main_test.go` | Basic encode test |
| `go.mod` | Go module definition (`huffmancoding`) |

## How to Run

```bash
go test ./...
```

## Key Functions

| Function | Description | Time Complexity |
|----------|-------------|-----------------|
| `HuffmanEncode(text string) map[rune]string` | Returns a map of runes to their Huffman codes (placeholder) | O(n log n) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(n log n) for building the Huffman tree via a priority queue |
| Space | O(n) for the tree and code table |

## Notes

- Huffman coding assigns shorter codes to more frequent characters and longer codes to rarer ones.
- The algorithm greedily merges the two lowest-frequency nodes until a single tree remains.
- The resulting codes are prefix-free, meaning no code is a prefix of another.
- Uses `rune` type for Unicode character support in Go.
- The Python implementation contains the complete tree builder, encoder, decoder, and compression ratio calculator.
- See `../Python/huffman_coding.py` for the full working implementation.

---

_Last Updated: April 2026_
