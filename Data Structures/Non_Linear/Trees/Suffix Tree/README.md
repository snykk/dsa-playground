# Suffix Tree

A **Suffix Tree** is a compressed trie containing all suffixes of a given string. It allows O(m) pattern search where m is pattern length, making it faster than Suffix Array for pattern matching.

---

## Overview

Suffix Tree is the optimal data structure for:
- **Fast Pattern Matching**: O(m) search time
- **String Algorithms**: Longest common substring, repeated substrings
- **Bioinformatics**: DNA sequence analysis
- **Text Processing**: Advanced string operations

---

## Key Characteristics

1. **Compressed Trie**: All suffixes stored in tree structure
2. **O(m) Pattern Search**: Linear time pattern matching
3. **Space Efficient**: Compressed representation
4. **Complex Construction**: O(n) with Ukkonen's algorithm

---

## Operations

| Operation      | Description                    | Time Complexity |
| -------------- | ------------------------------ | --------------- |
| `search(pattern)` | Search for pattern        | O(m)            |
| `get_all_suffixes()` | Get all suffixes        | O(n)            |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Build     | O(n) with Ukkonen's | O(n)      |
| Search    | **O(m)**        | O(1)             |
| Space     | O(n)            | O(n)             |

---

## Structure Example

For text **"banana$"** (with terminator $), Suffix Tree structure:

```
                    root
                   / | | \
                  b  a n  $
                 /   | \
                a    n  $
               /     |
              n      a
             /|      |
            a $     n
           /        |
          $         a
                    |
                    $
```

**Stored Suffixes:**
- banana$ (index 0)
- anana$ (index 1)
- nana$ (index 2)
- ana$ (index 3)
- na$ (index 4)
- a$ (index 5)
- $ (index 6)

---

## Detailed Pattern Search Example

**Search for pattern "ana":**

```
Step 1: Start at root
        root
         |
         a  ← Follow 'a' edge
        
Step 2: Match along edge
        [a] → n → a
        Match: 'a' ✓
        
Step 3: Continue matching
        a → [n] → a
        Match: 'n' ✓
        
Step 4: Final match
        a → n → [a]
        Match: 'a' ✓
        
Step 5: Pattern found!
        Collect all leaf indices in subtree:
        - Found at index 1: "anana$"
        - Found at index 3: "ana$"
        Result: [1, 3] ✓
```

**Key Points:**
- Each edge represents a substring (can be multiple characters)
- Pattern matching follows edges character by character
- When pattern matches, collect all leaf nodes in that subtree
- O(m) time because we traverse at most m edges

---

## Compressed vs Uncompressed Trie

**Uncompressed Trie (Trie biasa):**
```
        root
       /    \
      a      b
     /        \
    n          a
   /            \
  a              n
 /                \
$                  a
                    \
                     n
                      \
                       a
                        \
                         $
```
*Setiap karakter = 1 node (banyak node)*

**Compressed Suffix Tree:**
```
        root
       /    \
      a      banana$
     / \
    na$  na$
```
*Edge bisa berisi multiple karakter (lebih compact)*

**Advantage**: Suffix Tree compresses common prefixes, reducing space from O(n²) to O(n).

---

## Comparison with Suffix Array

| Feature         | Suffix Tree | Suffix Array |
| --------------- | ----------- | ------------ |
| Construction    | O(n)        | O(n log n)   |
| Pattern Search  | **O(m)** ⚡ | O(m log n)   |
| Space           | O(n)        | O(n)         |
| Implementation  | Complex     | Simpler      |
| Use Case        | Fast search | Simpler code |

**Key Difference**: Suffix Tree provides **O(m) pattern search** vs O(m log n) for Suffix Array.

**When to use Suffix Tree:**
- Need fast pattern matching (O(m))
- Multiple pattern searches
- Advanced string algorithms

**When to use Suffix Array:**
- Simpler implementation needed
- O(m log n) search is acceptable
- Less code complexity

---

## Applications

1. **Pattern Matching**: Fast substring search
2. **Longest Common Substring**: Between multiple strings
3. **String Compression**: LZ77, Burrows-Wheeler Transform
4. **Bioinformatics**: DNA sequence analysis, genome alignment
5. **Text Processing**: Advanced string operations

---

## Implementations

This folder contains implementations in three languages:
- **Python** (`Python/`) - Simplified construction for clarity
- **C++** (`C++/`) - Basic implementation
- **Go** (`Go/`) - Basic implementation

**Note**: For production use, implement Ukkonen's algorithm for O(n) construction. The provided implementations use simplified O(n²) construction for educational purposes.

---

## Further Reading

- [Suffix Tree on Wikipedia](https://en.wikipedia.org/wiki/Suffix_tree)
- [Ukkonen's Algorithm](https://en.wikipedia.org/wiki/Ukkonen%27s_algorithm)
- [Suffix Tree vs Suffix Array](https://www.geeksforgeeks.org/suffix-tree-application-1-substring-check/)

