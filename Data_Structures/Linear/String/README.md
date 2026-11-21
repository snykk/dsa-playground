# String Data Structures

A string is a sequence of characters, so it behaves like an array with a few traps. The three topics move from the basic operations to everyday manipulation to the rope, a tree of fragments that trades fast indexing for cheap edits of long text.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Introduction to Strings](String_Basics/) | Access, length, traversal, concatenation and substring, and the traps behind them: immutability, bytes versus characters. | Beginner |
| 2 | [String Manipulation](String_Manipulation/) | Reverse, palindrome check, counting, replacing, case, split and join. Each is one O(n) pass, often with two pointers. | Beginner |
| 3 | [Rope](Rope/) | A balanced tree of short fragments. Edits rebuild one path, so they cost O(log n) instead of copying the whole text. | Advanced |

Three things make strings differ from an array of numbers. Python and Go strings are immutable, so every edit builds a new string, while C++ `std::string` is mutable. Python counts code points, while C++ and Go count bytes. And editing the middle of a very long string copies everything after the edit.

## How They Compare

| Topic | Idea | Read a character | Edit or build | Space |
|-------|------|------------------|---------------|-------|
| String basics | a flat sequence of characters | O(1) | concatenate O(n + m), substring O(k) | O(n) |
| String manipulation | one pass over the characters, often from both ends | O(1) | every operation O(n) | O(n); palindrome O(1) in C++ |
| Rope | a balanced binary tree whose leaves hold short fragments | O(log n) | concat, split, insert, delete O(log n), plus the size of inserted text | O(n) |

A substring is O(k) in Python and C++, which copy it, and O(1) in Go, which slices. The palindrome check uses O(1) extra space in C++, while Python builds a reversed copy and Go a rune slice. Reading a whole rope back into a string is O(n).

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| Reading, comparing and small edits | Flat string | O(1) access and the best cache behavior |
| Reversing, counting, replacing, splitting | String manipulation | one clear O(n) pass for each |
| Many edits in the middle of a long text, such as an editor buffer | Rope | edits rebuild a path instead of copying the text |
| Building a string from many pieces in a loop | a builder or a list of parts joined once | in Python and Go, repeated concatenation copies the growing result each time |

## Common Pitfalls

- Python indexes code points; C++ and Go index bytes, so a cut can land inside a character.
- Concatenating in a loop in Python or Go costs O(n^2) in total. Collect the parts and join once.
- `is_palindrome("A man, a plan, a canal: Panama")` is `False`: it compares the string with its reverse exactly, without ignoring case or punctuation.
- A rope is not a faster string: indexing is O(log n) and reading it back is O(n). It wins only when edits dominate.
- A substring is not free: it copies in Python and C++, and only Go slices in O(1).

## Related

- [Array](../Array/): read first.
- [Pattern Matching Algorithms](../../../Algorithms/String_Algorithms/Pattern_Matching/): finding every place a pattern occurs in a text.
- [Advanced String Algorithms](../../../Algorithms/String_Algorithms/Advanced_String/): the Z-algorithm, Aho-Corasick, suffix arrays and more.
- [Two Pointers](../../../Problem_Patterns/Two_Pointers/): the idea behind reverse and palindrome.
- [AVL Tree](../../Non_Linear/Trees/AVL_Tree/): the balanced tree that the rope builds on.
