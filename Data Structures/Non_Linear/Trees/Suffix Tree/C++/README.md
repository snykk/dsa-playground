# Suffix Tree -- C++ Implementation

Compressed suffix tree built suffix by suffix. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `suffix_tree.cpp`: `SuffixTreeNode` and `SuffixTree`
- `suffix_tree_test.cpp`: exact-result tests, edge-split regressions and a randomized comparison with brute force

## API

- `explicit SuffixTree(const string& text)`: throws `std::invalid_argument` if the text contains a NUL character
- `vector<int> search(const string& pattern) const`: sorted start indices (byte offsets); empty for an empty or absent pattern
- `vector<string> get_all_suffixes() const`: sorted non-empty suffixes

## C++-Specific Notes

Edges store `start` and `end` as plain `int` indices. Every node is allocated once and kept in the tree's `all_nodes` list, and the destructor deletes them in a loop, so freeing a very deep tree does not recurse and nothing leaks. Copying is deleted because the nodes are owned by one tree. Leaf collection uses an explicit stack. The earlier version never split edges, kept only one leaf per search and crashed on an empty string; all three are fixed.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD suffix_tree_test.cpp -o suffix_tree_test
./suffix_tree_test
```

With AddressSanitizer: add `-g -fsanitize=address,undefined` to the compile line.

## Key Takeaways

- Splitting edges at mismatches is what makes the tree correct.
- Search collects every leaf below the match point.
- The class owns its nodes and cannot be copied.
