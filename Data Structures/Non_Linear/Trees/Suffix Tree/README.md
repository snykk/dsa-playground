# Suffix Tree

A suffix tree is a compressed trie of every suffix of a string. After one build, all occurrences of a pattern of length m are found in O(m + occ) time, independent of the text length. This repository builds the tree suffix by suffix in O(n^2) time and O(n) space.

## Intuition

Every substring of a text is a prefix of some suffix. Put all suffixes in a trie and every substring becomes a path from the root. Compress each chain of single-child nodes into one edge and the trie shrinks to at most 2(n + 1) nodes.

The invariant: sibling edges start with different characters, and the labels along a root-to-leaf path spell exactly one suffix. A unique terminator (here the NUL character, drawn as `$`) is appended to the text so that no suffix is a prefix of another and every suffix ends at its own leaf. Edges store `[start, end]` indices into the text rather than copies of the label.

## Visual

Suffix tree of `banana$`. Leaves show the start index of their suffix.

```text
root
 |-- "$" ---------------- (6)
 |-- "a"
 |     |-- "$" ---------- (5)
 |     |-- "na"
 |           |-- "$" ---- (3)
 |           |-- "na$" -- (1)
 |-- "banana$" ---------- (0)
 |-- "na"
       |-- "$" ---------- (4)
       |-- "na$" -------- (2)
```

## Operations

| Operation | What it does | Time |
| --- | --- | --- |
| constructor | append the terminator, insert every suffix, splitting edges at mismatches | O(n^2) |
| `search(pattern)` | walk down matching the edge labels, then collect every leaf below; sorted start indices | O(m + occ) |
| `get_all_suffixes()` | every non-empty suffix of the text, sorted | O(n^2) |

An empty pattern returns no matches. The NUL character is reserved: the constructor raises `ValueError` (Python), throws `std::invalid_argument` (C++) or panics (Go) when the text contains it, and a pattern containing it matches nothing. A `$` in the text is an ordinary character. Python indexes code points; C++ and Go index bytes.

Inserting suffix `i` walks down from the root:

1. No edge starts with the next character: add a leaf with the rest of the suffix.
2. An edge starts with it: compare along the label. If the whole label matches, go to the child and continue.
3. On a mismatch inside a label, split the edge. A new internal node keeps the common part, the old child keeps the rest, and a new leaf takes the remainder of the suffix.

## Step-by-Step Trace

Building `banana$`:

| Insert | Suffix | What happens |
| --- | --- | --- |
| 0 | `banana$` | new leaf `banana$` |
| 1 | `anana$` | new leaf `anana$` |
| 2 | `nana$` | new leaf `nana$` |
| 3 | `ana$` | shares `ana` with `anana$`: split, children `na$` (suffix 1) and `$` (suffix 3) |
| 4 | `na$` | shares `na` with `nana$`: split, children `na$` (suffix 2) and `$` (suffix 4) |
| 5 | `a$` | shares `a` with `ana`: split into `a` and `na`, new leaf `$` (suffix 5) |
| 6 | `$` | new leaf `$` |

Searching `ana`: edge `a` matches, then edge `na` matches and the pattern ends exactly at the bottom of that edge. The leaves below are suffixes 1 and 3, so the result is `[1, 3]`. Searching `an` ends inside the edge `na` and gives the same `[1, 3]`.

## Complexity

| Quantity | Cost | Why |
| --- | --- | --- |
| Build (this repo) | O(n^2) | each suffix is compared along its length |
| Build (Ukkonen) | O(n) | not implemented here |
| Search | O(m + occ) | m characters to walk, one visit per leaf collected |
| Space | O(n) | at most 2(n + 1) nodes, edges store index pairs |

A text such as `aaaa...a` makes the tree a chain of depth n. Searches and leaf collection use an explicit stack in all three languages, so depth does not overflow the call stack.

## When to Use

- Use it when one fixed text is queried many times for substrings, occurrence lists, repeats or common substrings.
- Avoid it for a single search (KMP is cheaper than building) or for very large texts with this quadratic build (use Ukkonen or a suffix array).

## Suffix Tree vs. Alternatives

| | Suffix tree | Suffix array | KMP / naive scan |
| --- | --- | --- | --- |
| Preprocess | O(n^2) here, O(n) Ukkonen | O(n^2 log n) here | none, or O(m) |
| Find pattern | O(m + occ) | O(m log n) | O(n + m) per query |
| Space | O(n), large constant | O(n), small | O(m) |

## Common Pitfalls

- Reusing the terminator character inside the text: suffixes then end mid-edge and lose their leaf.
- Not splitting an edge on a mismatch, which drops the suffix.
- Returning only one leaf instead of every leaf below the match.
- Storing edge labels as substrings instead of index pairs.
- Assuming O(n) construction; this version is O(n^2).
- Recursing along a degenerate tree instead of using a stack.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [Python](Python) | `suffix_tree.py` | dict children, indices are code points |
| C++ | [C++](C++) | `suffix_tree.cpp` | nodes freed in the destructor, not copyable, byte indices |
| Go | [Go](Go) | `main.go` | children keyed by byte, panics on NUL, byte indices |

## Practice Problems

- LeetCode 28: Find the Index of the First Occurrence in a String
- LeetCode 1044: Longest Duplicate Substring
- CSES: String Matching
- CSES: Distinct Substrings
- CSES: Repeating Substring

## Related

- [Trie](../Trie)
- [Suffix Array](../Suffix%20Array)
- [KMP Algorithm](../../../../Algorithms/String_Algorithms/Pattern_Matching/KMP%20Algorithm)
- [Longest Common Substring](../../../../Algorithms/String_Algorithms/Advanced_String/Longest%20Common%20Substring)
