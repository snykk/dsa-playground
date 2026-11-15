# Huffman Coding -- C++ Implementation

The full algorithm ported from the Python version in C++17: frequency count, heap-based tree construction, code table, encoding, decoding and a compression-ratio helper.

## Files

| File | Contents |
|------|----------|
| `huffman_coding.cpp` | `HuffmanNode`, `HuffmanTree`, `HuffmanResult`, a copy of Python's `heapq`, and the functions below |
| `huffman_coding_test.cpp` | 12 assert-based tests: the 10 Python cases, code tables and encodings printed by the Python code for 11 texts (tied frequencies included), and 300 random texts whose encoded length is checked against a brute-force optimum |

## API

| Name | Description |
|------|-------------|
| `struct HuffmanNode` | `symbol` (a `char`), `freq`, and `std::unique_ptr` children `left` and `right`; `isLeaf()` |
| `using HuffmanTree = std::unique_ptr<HuffmanNode>` | an owned tree, or `nullptr` |
| `HuffmanTree buildHuffmanTree(const std::string& text)` | root node, or `nullptr` for empty text |
| `std::map<char, std::string> buildCodes(const HuffmanNode* root)` | symbol to code string; a single-symbol tree gets `"0"` |
| `HuffmanResult huffmanEncode(const std::string& text)` | `{encoded, codes, tree}`, Python's tuple; all empty for empty text |
| `std::string huffmanDecode(const std::string& encoded, const HuffmanNode* tree)` | the original text; `""` for no tree or no bits |
| `std::pair<double, double> calculateCompressionRatio(original, encoded, codes)` | `(ratio, savings_percent)` against 8 bits per character; ratio `0` for an empty original; `codes` is unused, as in Python |

```cpp
auto [encoded, codes, tree] = huffmanEncode("abracadabra");
// encoded has 23 bits; codes == {a: 0, b: 111, c: 100, d: 101, r: 110}, as in Python
huffmanDecode(encoded, tree.get());  // "abracadabra"
```

## C++-Specific Notes

- **Same code table as Python.** `HuffmanNode.__lt__` compares frequencies only, so Python breaks ties by the positions of nodes in the `heapq` list. The file copies `heapq`'s push and pop exactly (a pop moves the last item to the root, sinks it to a leaf choosing the right child on a tie, then sifts it back up) and pushes leaves in order of first occurrence, as `Counter` does. The tables for `aabbccdd`, `abracadabra` and others match Python's; `std::priority_queue` gives different, equally optimal, tables.
- **Symbols are bytes.** `std::string` holds bytes, so a UTF-8 character such as U+00E9 is two symbols. For ASCII text the table is identical to Python's; for other text it differs (Python counts code points), but encode and decode still round-trip. The ratio helper also counts bytes.
- The tree owns its nodes through `std::unique_ptr`, so nothing leaks; `huffmanDecode` and `buildCodes` take a non-owning `const HuffmanNode*`.
- The encoded text is a `std::string` of `'0'` and `'1'`, one character per bit; it is not packed into bytes.

## How to Run

```bash
cd "Algorithms/Greedy/Huffman_Coding/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD huffman_coding_test.cpp -o huffman_test
./huffman_test
```

## Key Takeaways

- Merge the two lightest nodes k - 1 times with a min-heap.
- Tied frequencies make the table depend on the heap; copy the heap's exact rules to reproduce another implementation's table.
- Decoding needs the tree, not just the code table.
