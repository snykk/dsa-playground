# Huffman Coding -- Go Implementation

The full algorithm ported from the Python version: frequency count, heap-based tree construction, code table, encoding, decoding and a compression-ratio helper.

## Files

| File | Contents |
|------|----------|
| `main.go` | `HuffmanNode`, a copy of Python's `heapq`, and the functions below (`package main`, no `main` function) |
| `main_test.go` | 9 tests: the Python cases (round trips, empty text, ratio, known code table, single symbol, prefix-free and optimal, empty decode inputs), code tables, encodings and ratios printed by the Python code for 12 texts (tied frequencies and non-ASCII text included), and 300 random texts whose encoded length is checked against a brute-force optimum |
| `go.mod` | module definition (`huffmancoding`) |

## API

| Name | Description |
|------|-------------|
| `type HuffmanNode struct { Char rune; Freq int; Left, Right *HuffmanNode }` | tree node; a leaf has no children |
| `BuildHuffmanTree(text string) *HuffmanNode` | root node, or `nil` for empty text |
| `BuildCodes(root *HuffmanNode) map[rune]string` | symbol to code string; a single-symbol tree gets `"0"` |
| `HuffmanEncode(text string) (string, map[rune]string, *HuffmanNode)` | encoded text, codes and tree; `"", empty map, nil` for empty text |
| `HuffmanDecode(encoded string, tree *HuffmanNode) string` | the original text; `""` for no tree or no bits |
| `CalculateCompressionRatio(original, encoded string, codes map[rune]string) (ratio, savings float64)` | ratio against 8 bits per character and savings in percent; ratio `0` for an empty original; `codes` is unused, as in Python |

```go
encoded, codes, tree := HuffmanEncode("abracadabra")
// encoded has 23 bits; codes == map[a:0 b:111 c:100 d:101 r:110], as in Python
HuffmanDecode(encoded, tree) // "abracadabra"
```

## Go-Specific Notes

- **Same code table as Python.** `HuffmanNode.__lt__` compares frequencies only, so Python breaks ties by the positions of nodes in the `heapq` list. `main.go` copies `heapq`'s push and pop exactly (a pop moves the last item to the root, sinks it to a leaf choosing the right child on a tie, then sifts it back up) and pushes leaves in order of first occurrence, as `Counter` does. `container/heap` stops sinking early and prefers the left child, so it would give different, equally optimal, tables.
- **Symbols are runes**, as Python's are code points, so non-ASCII text gets the same table as in Python (a test checks one). Text is read as UTF-8: an invalid byte becomes U+FFFD and does not round-trip. The ratio helper counts runes, like Python's `len`.
- The encoded text is a `string` of `'0'` and `'1'`, one character per bit; it is not packed into bytes.
- The package has no `func main`, so `go run .` does not work; use the tests.

## How to Run

```bash
cd "Algorithms/Greedy/Huffman_Coding/Go"
go test ./...
```

## Key Takeaways

- Merge the two lightest nodes k - 1 times with a min-heap.
- Tied frequencies make the table depend on the heap; copy the heap's exact rules to reproduce another implementation's table.
- Decoding needs the tree, not just the code table.
