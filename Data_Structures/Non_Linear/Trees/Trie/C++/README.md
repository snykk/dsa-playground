# Trie -- C++ Implementation

Prefix tree with `unordered_map` children. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `trie.cpp`: `TrieNode` and `Trie`
- `trie_test.cpp`: assert-based tests (basic operations, delete, count, empty word, long word)

## API

- `insert(word)`
- `search(word)`, `startsWith(prefix)`
- `deleteWord(word)`: true if the word was stored and has been removed
- `getAllWords()`: unspecified order
- `countWords()`, `isEmpty()`

## C++-Specific Notes

Characters are bytes (`char`), so a multi-byte UTF-8 character is several nodes. Nodes are raw pointers, and the destructor frees every node with an explicit stack, so nothing leaks and a very long word cannot overflow the call stack. Copying a `Trie` is deleted because the copies would share nodes. `deleteWord`, `getAllWords` and `countWords` are iterative.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD trie_test.cpp -o trie_test
./trie_test
```

With AddressSanitizer: add `-g -fsanitize=address,undefined` to the compile line.

## Key Takeaways

- The destructor frees the whole tree.
- Delete returns whether the word was stored and prunes unused nodes.
- The class cannot be copied.
