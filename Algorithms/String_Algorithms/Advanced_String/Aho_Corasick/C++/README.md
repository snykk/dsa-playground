# Aho-Corasick -- C++ Implementation

A header-only multi-pattern matcher: trie, failure links and output links.

## Files

| File | Contents |
|------|----------|
| `aho_corasick.h` | the `AhoCorasick` class |
| `aho_corasick_test.cpp` | 9 `assert`-based tests: single pattern, no match, empty text, empty patterns, `ushers`, overlaps, prefix patterns, single characters, a long pattern |

## API

- `explicit AhoCorasick(const std::vector<std::string>& patterns)`: builds the automaton; empty patterns are skipped.
- `std::vector<std::pair<int, int>> search(const std::string& text) const`: every match as `(end_index, pattern_id)`; the id is the pattern's position in the input vector.
- `const std::string& pattern(int id) const`: the pattern text for an id.

## C++-Specific Notes

- Nodes live in a `std::vector<Node>` and refer to each other by index, so growing the vector never invalidates links.
- Children are `std::unordered_map<char, int>` (not an array of 26): any byte alphabet, O(m) space. An array per node would be faster for a fixed small alphabet.
- `search` is `const`, so a built automaton can be shared for read-only matching.
- Indices are byte offsets.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD aho_corasick_test.cpp -o aho_corasick_test
./aho_corasick_test
```

## Key Takeaways

1. Use indices rather than pointers for nodes stored in a growing vector.
2. Build links by BFS; the scan then needs only the current node.
3. A table instead of a hash map trades memory for constant-factor speed.
