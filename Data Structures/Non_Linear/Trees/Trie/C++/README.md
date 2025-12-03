# Trie (Prefix Tree) - C++

This folder contains a C++ implementation of a **Trie** (Prefix Tree).

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `insert(word)`           | Insert a word into the trie          | O(m)            |
| `search(word)`           | Search for a complete word           | O(m)            |
| `startsWith(prefix)`     | Check if prefix exists               | O(m)            |
| `deleteWord(word)`       | Delete a word from the trie          | O(m)            |
| `getAllWords()`          | Get all words in the trie            | O(n)            |
| `isEmpty()`              | Check if trie is empty               | O(1)            |

---

## Usage

```cpp
#include "trie.cpp"

Trie trie;
trie.insert("apple");
trie.insert("app");
cout << trie.search("apple") << endl;  // 1 (true)
cout << trie.startsWith("app") << endl; // 1 (true)
```

---

## Notes

- Uses `unordered_map` for efficient character lookups
- O(m) time complexity for all operations where m is word length

