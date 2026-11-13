# Huffman Coding -- Python Implementation

The complete implementation: frequency count, heap-based tree construction, code table, encoding, decoding and a compression-ratio helper.

## Files

| File | Contents |
|------|----------|
| `huffman_coding.py` | `HuffmanNode` and the functions below |
| `huffman_coding_test.py` | 10 `unittest` tests (round trips, a known code table, single symbol, empty text, prefix-free and optimal length on several texts, compression ratio) |

## API

| Name | Description |
|------|-------------|
| `HuffmanNode(char, freq, left, right)` | tree node; ordered by `freq` only (`__lt__`) |
| `build_huffman_tree(text)` | root node, or `None` for empty text |
| `build_codes(root)` | dict from symbol to code string; a single-symbol tree gets `"0"` |
| `huffman_encode(text)` | `(encoded, codes, tree)`; `("", {}, None)` for empty text |
| `huffman_decode(encoded, tree)` | the original text; `""` for no tree or no bits |
| `calculate_compression_ratio(original, encoded, codes)` | `(ratio, savings_percent)` against 8 bits per character; `codes` is unused |

```python
from huffman_coding import huffman_encode, huffman_decode

encoded, codes, tree = huffman_encode("abracadabra")
# encoded is 23 characters of "0" and "1"; codes == {'a': '0', 'c': '100', 'd': '101', 'r': '110', 'b': '111'}
huffman_decode(encoded, tree)  # 'abracadabra'
```

## Python-Specific Notes

- Uses `heapq` with `HuffmanNode.__lt__` on frequency only. With tied frequencies the exact code table depends on the heap order (any such table is optimal).
- The encoded text is a `str` of `"0"` and `"1"`, one character per bit; it is not packed into bytes.
- Symbols are Python characters (code points), so non-ASCII text works; the ratio helper still assumes 8 bits per character.
- `build_codes` is recursive; its depth equals the longest code, which stays small for realistic frequency distributions.

## How to Run

```bash
cd "Algorithms/Greedy/Huffman_Coding/Python"
python3 -m unittest huffman_coding_test
```

## Key Takeaways

- Merge the two lightest nodes k - 1 times with a min-heap.
- Decoding needs the tree, not just the code table.
- The output is a string of bit characters, not real packed bits.
