# Trie

A trie (prefix tree) stores strings one character per edge, so words with a common prefix share a path. Insert, search, prefix search and delete cost O(L) for a word of length L, independent of how many words are stored.

## Intuition

Think of a dictionary tab index: you open the section for the first letter, then the second letter, and so on. Every word that starts the same way follows the same tabs, so a prefix question is answered by walking until the tabs run out.

The invariant: the node reached by following a string from the root represents that prefix, and its flag `is_end_of_word` is set exactly when that prefix is a stored word. The flag matters: `app` is a prefix of `apple`, and only the flag tells `search('app')` from `search('ap')`.

## Visual

The trie holding `app`, `apple`, `apt`, `bat` and `bath`. `[*]` marks the end of a word.

```text
root
 |-- a
 |    `-- p
 |         |-- p [*] -- l -- e [*]
 |         `-- t [*]
 `-- b
      `-- a
           `-- t [*] -- h [*]
```

## Operations

| Operation | What it does | Time |
| --- | --- | --- |
| `insert(word)` | walk down, creating missing nodes, flag the last node | O(L) |
| `search(word)` | walk down; true only if the path exists and the last node is flagged | O(L) |
| `starts_with(prefix)` | walk down; true if the path exists | O(L) |
| `delete(word)` | clear the flag, then prune nodes with no children that are not words; returns whether the word was stored | O(L) |
| `get_all_words()` | depth-first traversal collecting flagged paths | O(total characters) |
| `count_words()` | count flagged nodes | O(nodes) |
| `is_empty()` | no word stored | O(1) |

C++ names are `startsWith`, `deleteWord`, `getAllWords`, `countWords` and `isEmpty`; Go names are `Insert`, `Search`, `StartsWith`, `Delete`, `GetAllWords`, `CountWords` and `IsEmpty`. The empty string is a valid word: after `insert("")` the trie is not empty and the count is 1.

`delete` records the path on the way down, clears the flag, then walks back up removing each node that has no children and is not a word, and stops at the first node that is a word or has another child.

## Step-by-Step Trace

Start with the five words above (11 nodes including the root).

| Step | Result |
| --- | --- |
| `search('app')` | path exists, flag set: true |
| `search('ap')` | path exists, no flag: false |
| `starts_with('ap')` | true |
| `starts_with('bax')` | no child `x` under `ba`: false |
| words under `ap` | `app`, `apple`, `apt` |
| `delete('apple')` | clear `e`, prune `e` and `l`, stop at `app` (a word); 9 nodes |
| `delete('bath')` | clear `h`, prune `h`, stop at `bat` (a word); 8 nodes |
| `delete('app')` | clear the second `p`, prune it, stop at `ap` (still has child `t`); 7 nodes |

## Complexity

| Quantity | Cost | Why |
| --- | --- | --- |
| Insert, search, starts with, delete | O(L) | one hash-map step per character |
| List all words | O(total characters) | every node is visited once |
| Space | O(total characters) | at most one node per inserted character, fewer with shared prefixes |

Children are stored in hash maps keyed by character, so a node costs memory in proportion to the children it has. Array-based tries (26 slots per node) use O(26 x nodes) space.

## When to Use

- Use it for prefix queries, autocomplete, dictionary lookups, word games, longest-prefix matching and bitwise tries (maximum XOR).
- Avoid it when you only need exact membership of a modest set (a hash set is smaller), or for a few long, unrelated words (many nodes, little sharing).

## Trie vs. Alternatives

| | Trie | Hash set | Balanced BST of strings |
| --- | --- | --- | --- |
| Exact search | O(L) | O(L) average | O(L log n) |
| Prefix search | O(L) plus matches | not supported | O(L log n) |
| Sorted order | not by default | no | yes |
| Memory | many small nodes | compact | moderate |

## Common Pitfalls

- Confusing a prefix with a word: always check the end flag.
- Pruning too far on delete: stop at a node that is a word or has another child.
- Returning "may the parent remove this node" from delete instead of "was the word stored".
- Mixing bytes and characters between insert and delete (Python walks code points, Go runes, C++ bytes).
- Forgetting the empty word, which flags the root.
- Recursing per character on very long words.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [Python](Python) | `trie.py` | dict children, code points, insertion-ordered `get_all_words` |
| C++ | [C++](C++) | `trie.cpp` | bytes, destructor frees all nodes, not copyable |
| Go | [Go](Go) | `main.go` | runes, `GetAllWords` order unspecified |

## Practice Problems

- [Implement Trie (Prefix Tree) (LeetCode 208)](https://leetcode.com/problems/implement-trie-prefix-tree/)
- [Replace Words (LeetCode 648)](https://leetcode.com/problems/replace-words/)
- [Design Add and Search Words Data Structure (LeetCode 211)](https://leetcode.com/problems/design-add-and-search-words-data-structure/)
- [Maximum XOR of Two Numbers in an Array (LeetCode 421)](https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/)
- [Word Search II (LeetCode 212)](https://leetcode.com/problems/word-search-ii/)
- [Word Combinations (CSES 1731)](https://cses.fi/problemset/task/1731) (trie plus DP)

## Related

- [Suffix Tree](../Suffix_Tree)
- [Suffix Array](../../../../Algorithms/String_Algorithms/Advanced_String/Suffix_Array/)
- [Binary Search Tree](../Binary_Search_Tree)
- [Aho-Corasick](../../../../Algorithms/String_Algorithms/Advanced_String/Aho_Corasick)
