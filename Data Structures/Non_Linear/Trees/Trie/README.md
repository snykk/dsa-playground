# Trie (Prefix Tree)

A **Trie** (pronounced "try") is a tree-like data structure used to store strings efficiently. It allows fast prefix matching and word search operations, making it ideal for autocomplete, spell checkers, and IP routing.

---

## Overview

Trie is particularly useful for:
- **Prefix Matching**: Fast lookup of words with common prefixes
- **Autocomplete**: Suggesting words as user types
- **Dictionary Operations**: Efficient word storage and retrieval
- **IP Routing**: Longest prefix matching in network routing

---

## Key Characteristics

1. **Prefix Sharing**: Words with common prefixes share nodes
2. **Character-based**: Each node represents a character
3. **Path = Word**: Path from root to node represents a word or prefix
4. **Efficient Search**: O(m) where m is word length
5. **Space Efficient**: Shares common prefixes

---

## Operations

| Operation      | Description                    | Time Complexity |
| -------------- | ------------------------------ | --------------- |
| `insert(word)` | Insert a word                  | O(m)            |
| `search(word)` | Search for complete word        | O(m)            |
| `starts_with(prefix)` | Check if prefix exists    | O(m)            |
| `delete(word)` | Delete a word                  | O(m)            |
| `get_all_words()` | Get all words            | O(n)            |

Where `m` = word length, `n` = total nodes.

---

## Example Structure

For words: **"app"**, **"apple"**, **"banana"**

```
                    root
                   /    \
                  a      b
                 /        \
                p          a
               /            \
              p              n
             / \              \
            l   e              a
           /     |              \
          e   (end)              n
         /                        \
      (end)                        a
                                    \
                                   (end)
```

**Detailed Path Breakdown:**

1. **"app"** (3 characters):
   - root → **a** → **p** → **p** ✨ (end)
   - Path: `a-p-p`

2. **"apple"** (5 characters):
   - root → **a** → **p** → **p** → **l** → **e** ✨ (end)
   - Path: `a-p-p-l-e`
   - Note: Shares prefix "app" with the first word!

3. **"banana"** (6 characters):
   - root → **b** → **a** → **n** → **a** → **n** → **a** ✨ (end)
   - Path: `b-a-n-a-n-a`

**Key Points:**
- Each node represents one character
- Path from root to a node with `(end)` marker = complete word
- Words with common prefixes share nodes (e.g., "app" and "apple")
- "banana" requires 6 nodes: b → a → n → a → n → a

---

## Applications

1. **Autocomplete**: Text editors, search engines
2. **Spell Checkers**: Dictionary lookups
3. **IP Routing**: Longest prefix matching
4. **Phone Directory**: Contact search
5. **Word Games**: Scrabble, Boggle

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| insert    | O(m)            | O(m)             |
| search    | O(m)            | O(1)             |
| starts_with | O(m)          | O(1)             |
| delete    | O(m)            | O(m)             |
| Space     | O(ALPHABET_SIZE × N × M) | O(ALPHABET_SIZE × N × M) |

---

## Implementations

This folder contains implementations in three languages:
- **Python** (`Python/`) - Dictionary-based implementation
- **C++** (`C++/`) - Using `unordered_map`
- **Go** (`Go/`) - Using `map[rune]*TrieNode`

---

## Comparison with Hash Table

| Feature         | Hash Table | Trie      |
| --------------- | ---------- | --------- |
| Search          | O(1)       | O(m)      |
| Prefix Search   | O(n)       | O(m)      |
| Space           | O(n)       | O(ALPHABET × N × M) |
| Use Case        | Exact match | Prefix match |

