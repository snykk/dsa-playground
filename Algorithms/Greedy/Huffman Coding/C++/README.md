# Huffman Coding -- C++ Implementation

This folder is a placeholder. The only function, `huffmanEncode`, returns an empty map; the full algorithm exists in Python only (see `../Python/huffman_coding.py`).

## Files

| File | Contents |
|------|----------|
| `huffman_coding.cpp` | the placeholder `huffmanEncode`, plus the includes a real implementation would use (`<queue>`, `<unordered_map>`) |
| `huffman_coding_test.cpp` | one test that only checks that the placeholder runs; it asserts nothing about the result |

## API

| Name | Description |
|------|-------------|
| `std::unordered_map<char, std::string> huffmanEncode(const std::string& text)` | placeholder: always returns an empty map |

There is no tree type, no heap, no decoder and no compression-ratio helper in C++. Writing them is future work.

## C++-Specific Notes

- A real port would use `std::priority_queue` with a comparator on frequency (a min-heap), a node type owning its children (for example `std::unique_ptr`), and `char` or `unsigned char` keys.
- Equal frequencies leave the exact code table dependent on the heap order, as in Python.

## How to Run

```bash
cd "Algorithms/Greedy/Huffman Coding/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD huffman_coding_test.cpp -o huffman_test
./huffman_test
```

## Key Takeaways

- Nothing is implemented here yet; use the Python version.
- A passing test does not mean the algorithm works in C++.
