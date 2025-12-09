# Huffman Coding (Go)

**Huffman Coding** is a lossless data compression algorithm that assigns variable-length codes to characters based on their frequencies, creating an optimal prefix-free code.

---

## Overview

Huffman coding creates an optimal prefix-free (no code is prefix of another) encoding where:
- **Frequent characters** get shorter codes
- **Rare characters** get longer codes
- **Total encoded length** is minimized

This is achieved through a greedy algorithm that builds a binary tree by repeatedly merging the two least frequent nodes.

**Example**:
- Text: "hello"
- Frequencies: h=1, e=1, l=2, o=1
- Codes: l=0, h=10, e=110, o=111
- Encoded: "010110110111"

---

## Algorithm

1. **Count frequencies**: Count occurrence of each character
2. **Build min-heap**: Create priority queue with character nodes
3. **Build tree** (greedy):
   - Extract two nodes with lowest frequency
   - Merge into new node with combined frequency
   - Insert merged node back into heap
   - Repeat until one node remains (root)
4. **Build codes**: Traverse tree to assign codes (left=0, right=1)
5. **Encode**: Replace each character with its code
6. **Decode**: Traverse tree using encoded bits

---

## Complexity Analysis

| Operation | Time | Space |
|-----------|------|-------|
| **Building Tree** | O(n log n) | O(n) |
| **Encoding** | O(n) | O(n) |
| **Decoding** | O(n) | O(1) |

Where n is the length of input text.

**Note**: Building tree is O(n log n) due to heap operations. Encoding/decoding is O(n) where n is text length.

---

## Implementation Details

### Functions

1. **`HuffmanEncode(text)`**
   - Encodes text using Huffman coding
   - Returns map of rune to code string
   - Time: O(n log n), Space: O(n)

**Note**: Full implementation with tree building and decoding is complex in Go. See Python implementation for complete version.

---

## Usage

```go
package main

import "fmt"

func main() {
    text := "hello world"
    
    codes := HuffmanEncode(text)
    
    // Print character codes
    for char, code := range codes {
        fmt.Printf("%c: %s\n", char, code)
    }
}
```

---

## Important Notes

1. **Prefix-free**: No code is prefix of another (enables unique decoding)
2. **Optimal**: Huffman coding gives optimal prefix-free code
3. **Tree structure**: Binary tree where left=0, right=1
4. **Single character**: Special handling when text has only one unique character
5. **Tree needed for decoding**: Must store/transmit tree or frequency table
6. **Go runes**: Use rune for Unicode character support

---

## Advantages

1. ✅ **Optimal**: Produces optimal prefix-free code
2. ✅ **Lossless**: Perfect reconstruction of original text
3. ✅ **Adaptive**: Can adapt to any character distribution
4. ✅ **Efficient**: O(n log n) construction, O(n) encoding/decoding

---

## Disadvantages

1. ❌ **Two-pass**: Need to count frequencies first
2. ❌ **Tree overhead**: Must store tree or frequency table
3. ❌ **Not always better**: For uniform distributions, fixed-length may be better
4. ❌ **Sequential decoding**: Cannot decode from middle
5. ❌ **Go complexity**: More complex to implement than Python

---

## When to Use

- ✅ Text with skewed character distribution
- ✅ When compression ratio matters
- ✅ Lossless compression required
- ❌ Uniform character distribution (little benefit)
- ❌ Very short texts (overhead not worth it)

---

## Testing

Run the test suite:

```bash
go test -v
```

---

## Related Algorithms

- **LZW Compression**: Dictionary-based, better for repetitive patterns
- **Arithmetic Coding**: Better compression ratio, more complex
- **Run-Length Encoding**: Simple compression for runs
- **Burrows-Wheeler Transform**: Used with Huffman in bzip2

---

## Applications

1. **File Compression**: ZIP, GZIP use Huffman coding
2. **Image Compression**: JPEG uses Huffman coding
3. **Network Protocols**: HTTP/2 header compression
4. **Database Systems**: Column compression

---

## References

- Huffman, D. A. (1952). "A Method for the Construction of Minimum-Redundancy Codes"
- "Introduction to Algorithms" by CLRS (Chapter 16)
- "Data Compression: The Complete Reference" by David Salomon

---

_Last Updated: December 2025_
