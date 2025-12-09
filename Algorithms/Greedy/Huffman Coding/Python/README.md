# Huffman Coding (Python)

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

### Classes

1. **`HuffmanNode`**
   - Represents node in Huffman tree
   - Stores character, frequency, left/right children
   - Implements `__lt__` for heap comparison

### Functions

1. **`build_huffman_tree(text)`**
   - Builds Huffman tree from text
   - Returns root node
   - Time: O(n log n), Space: O(n)

2. **`build_codes(root, code="", codes=None)`**
   - Builds encoding table from tree
   - Returns dictionary mapping characters to codes
   - Time: O(n), Space: O(n)

3. **`huffman_encode(text)`**
   - Encodes text using Huffman coding
   - Returns (encoded_string, codes_dict, tree_root)
   - Time: O(n log n), Space: O(n)

4. **`huffman_decode(encoded, tree)`**
   - Decodes Huffman-encoded string
   - Returns decoded string
   - Time: O(n), Space: O(1)

5. **`calculate_compression_ratio(original, encoded, codes)`**
   - Calculates compression ratio and savings
   - Returns (ratio, savings_percentage)

---

## Greedy Choice

**Always merge two nodes with lowest frequency** - this greedy choice leads to optimal prefix code.

**Why it works**:
- Characters with higher frequency should have shorter codes
- By merging least frequent nodes first, we ensure they end up deeper in tree (longer codes)
- Frequent characters naturally end up higher (shorter codes)

---

## Usage

```python
from huffman_coding import (
    huffman_encode,
    huffman_decode,
    calculate_compression_ratio
)

# Encode text
text = "hello world"
encoded, codes, tree = huffman_encode(text)
print(f"Encoded: {encoded}")
print(f"Codes: {codes}")

# Decode
decoded = huffman_decode(encoded, tree)
print(f"Decoded: {decoded}")  # "hello world"

# Calculate compression
ratio, savings = calculate_compression_ratio(text, encoded, codes)
print(f"Compression ratio: {ratio:.2%}")
print(f"Space savings: {savings:.2%}")
```

---

## Important Notes

1. **Prefix-free**: No code is prefix of another (enables unique decoding)
2. **Optimal**: Huffman coding gives optimal prefix-free code
3. **Tree structure**: Binary tree where left=0, right=1
4. **Single character**: Special handling when text has only one unique character
5. **Tree needed for decoding**: Must store/transmit tree or frequency table

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

---

## When to Use

- ✅ Text with skewed character distribution
- ✅ When compression ratio matters
- ✅ Lossless compression required
- ❌ Uniform character distribution (little benefit)
- ❌ Very short texts (overhead not worth it)

---

## Applications

1. **File Compression**: ZIP, GZIP use Huffman coding
2. **Image Compression**: JPEG uses Huffman coding
3. **Network Protocols**: HTTP/2 header compression
4. **Database Systems**: Column compression

---

## Testing

```bash
python huffman_coding_test.py
```

---

## Related Algorithms

- **LZW Compression**: Dictionary-based, better for repetitive patterns
- **Arithmetic Coding**: Better compression ratio, more complex
- **Run-Length Encoding**: Simple compression for runs
- **Burrows-Wheeler Transform**: Used with Huffman in bzip2

---

## References

- Huffman, D. A. (1952). "A Method for the Construction of Minimum-Redundancy Codes"
- "Introduction to Algorithms" by CLRS (Chapter 16)
- "Data Compression: The Complete Reference" by David Salomon

---

_Last Updated: December 2025_

