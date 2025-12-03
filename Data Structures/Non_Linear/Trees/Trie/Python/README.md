# Trie (Prefix Tree) - Python

This folder contains a Python implementation of a **Trie** (also known as Prefix Tree).

A **Trie** is a tree-like data structure used to store strings efficiently. It allows fast prefix matching and word search operations, making it ideal for autocomplete, spell checkers, and IP routing.

---

## Concept

- **Prefix Tree**: Each node represents a character
- **Path from root to node**: Represents a prefix or complete word
- **Efficient Search**: O(m) where m is length of word
- **Prefix Matching**: Fast prefix search operations
- **Space Efficient**: Shares common prefixes among words

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `insert(word)`           | Insert a word into the trie          | O(m)            |
| `search(word)`           | Search for a complete word           | O(m)            |
| `starts_with(prefix)`    | Check if prefix exists               | O(m)            |
| `delete(word)`           | Delete a word from the trie          | O(m)            |
| `get_all_words()`        | Get all words in the trie            | O(n)            |
| `count_words()`          | Count total number of words           | O(n)            |
| `is_empty()`             | Check if trie is empty               | O(1)            |

Where `m` = length of word/prefix, `n` = total number of nodes.

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| insert    | O(m)            | O(m)             |
| search    | O(m)            | O(1)             |
| starts_with | O(m)          | O(1)             |
| delete    | O(m)            | O(m)             |
| Space     | O(ALPHABET_SIZE × N × M) | O(ALPHABET_SIZE × N × M) |

Where:
- `m` = average word length
- `n` = number of words
- `ALPHABET_SIZE` = size of alphabet (26 for English)

---

## Usage

```python
from trie import Trie

# Create a trie
trie = Trie()

# Insert words
trie.insert("apple")
trie.insert("app")
trie.insert("application")
trie.insert("banana")

# Search for complete words
print(trie.search("apple"))    # True
print(trie.search("app"))      # True
print(trie.search("appl"))     # False (not a complete word)

# Check prefix
print(trie.starts_with("app")) # True
print(trie.starts_with("ban")) # True
print(trie.starts_with("cat")) # False

# Get all words
print(trie.get_all_words())    # ['app', 'apple', 'application', 'banana']

# Delete word
trie.delete("apple")
print(trie.search("apple"))    # False
print(trie.search("app"))      # True (still exists)
```

---

## Applications

- **Autocomplete**: Text editors, search engines
- **Spell Checkers**: Dictionary lookups
- **IP Routing**: Longest prefix matching
- **Phone Directory**: Contact search
- **Word Games**: Scrabble, Boggle

---

## Run Test

```bash
python -m unittest trie_test.py
```

---

## Notes

- Trie is efficient for prefix-based operations
- Space complexity can be high for large alphabets
- Better than hash table for prefix matching
- Can be optimized with compressed trie (Radix Tree) for space efficiency

