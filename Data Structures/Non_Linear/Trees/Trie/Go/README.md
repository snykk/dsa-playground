# Trie (Prefix Tree) - Go

This folder contains a Go implementation of a **Trie** (Prefix Tree).

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `Insert(word)`           | Insert a word into the trie          | O(m)            |
| `Search(word)`           | Search for a complete word           | O(m)            |
| `StartsWith(prefix)`     | Check if prefix exists               | O(m)            |
| `Delete(word)`           | Delete a word from the trie          | O(m)            |
| `GetAllWords()`          | Get all words in the trie            | O(n)            |
| `CountWords()`           | Count total number of words           | O(n)            |
| `IsEmpty()`              | Check if trie is empty               | O(1)            |

---

## Usage

```go
trie := NewTrie()
trie.Insert("apple")
trie.Insert("app")
fmt.Println(trie.Search("apple"))    // true
fmt.Println(trie.StartsWith("app")) // true
```

---

## Notes

- Uses `map[rune]*TrieNode` for character storage
- O(m) time complexity for all operations

