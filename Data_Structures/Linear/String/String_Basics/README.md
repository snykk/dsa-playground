# Introduction to Strings

A string is a sequence of characters stored like an array with a length: reading a character or the length is O(1), traversal is O(n), and concatenation or substring copy their characters. This topic implements the five basic operations in Python, C++ and Go and shows where the languages differ.

## Intuition

Think of a string as a row of numbered boxes, one character each. You can jump to any box by number, and the string remembers how many boxes it has. Two things make strings trickier than arrays of numbers. First, most languages make strings immutable (Python, Go), so "changing" a string builds a new one. Second, "character" is ambiguous: one visible letter can take several bytes (UTF-8) or one code point, and each language picks its own unit for `len` and `s[i]`.

## Visual

```text
s = "hello"      index:   0   1   2   3   4
                        [h] [e] [l] [l] [o]      len(s) = 5

s = "h" + e-acute + "llo"   (UTF-8 bytes in hex)

 bytes:        68   C3   A9   6C   6C   6F        6 bytes (C++, Go: len = 6)
                    \___/
 code points:  h    e-acute  l    l    o         5 code points (Python: len = 5)
```

## Operations

| Operation | What it does | Time |
| --- | --- | --- |
| `access_char(s, i)` | the character at index `i` | O(1) |
| `string_length(s)` | the stored length | O(1) |
| `traverse_string(s)` | every character in order | O(n) |
| `concatenate(a, b)` | a new string `a` then `b` | O(n + m) |
| `substring(s, start, end)` | characters from `start` up to, not including, `end` | O(k) copy; O(1) for a Go slice |

Go uses capitalised names (`AccessChar`, `StringLength`, `TraverseString`, `Concatenate`, `Substring`).

### What each language counts

| Language | `len` | `s[i]` | `substring` unit | Out of range |
| --- | --- | --- | --- | --- |
| Python | code points | one-character string | code points | `access_char` raises `IndexError`; `substring` clamps and accepts negative indexes |
| C++ (`std::string`) | bytes | `char` (a byte) | bytes | `access_char` is undefined behaviour; `substring` clamps |
| Go (`string`) | bytes | `byte` | bytes | `AccessChar` panics; `Substring` clamps; `TraverseString` returns runes |

### Substring edge cases (all three languages)

- `end <= start` gives an empty string (`substring("abcdef", 3, 1)` is `""`).
- `end` past the length is clamped (`substring("abc", 0, 9)` is `"abc"`).
- `start` past the end gives `""`.
- A negative start counts from the end in Python (`substring("abcdef", -3, 6)` is `"def"`) and is clamped to 0 in C++ and Go.

## Step-by-Step Trace

Appending one character `n` times to an immutable string copies 1 + 2 + ... + n characters:

| Append | Length after | Characters copied | Total copied |
| --- | --- | --- | --- |
| 1 | 1 | 1 | 1 |
| 2 | 2 | 2 | 3 |
| 3 | 3 | 3 | 6 |
| 4 | 4 | 4 | 10 |
| 5 | 5 | 5 | 15 |

The total is n(n + 1) / 2, which is O(n^2). Collecting the pieces and joining once is O(n).

## Complexity

| Operation | Time | Why |
| --- | --- | --- |
| access, length | O(1) | address arithmetic, stored length |
| traverse | O(n) | one step per character |
| concatenate | O(n + m) | new storage, both parts copied |
| substring | O(k) | k characters copied (O(1) for a Go slice, which shares the bytes) |

Space is O(n). Indexing by character is O(1) only for fixed-width storage. Python keeps a fixed width per character (1, 2 or 4 bytes, chosen from the widest character in the string), so it stays O(1). In UTF-8, the i-th character needs a scan, which is why C++ and Go index bytes.

## When to Use

Use a string for text. For heavy editing of a long text, a list of pieces, a builder or a rope (see the Rope topic) avoids repeated copying. For fixed-size binary data use a byte array.

## Strings vs. Arrays

| Property | String | Array of characters |
| --- | --- | --- |
| mutable | no in Python and Go; yes for C++ `std::string` | yes |
| element type | characters | anything |
| usable as a hash key | yes when immutable | usually no |
| built-in search, split, join | yes | no |

## Common Pitfalls

- Assuming one unit: `len` counts code points in Python and bytes in C++ and Go.
- Slicing bytes in the middle of a character produces invalid UTF-8.
- Off-by-one on `end`: it is exclusive, so `substring(s, 0, len)` is the whole string.
- `s[i]` out of range raises (Python), panics (Go) or is undefined behaviour (C++).
- `+=` in a loop on immutable strings is O(n^2).
- Go `Substring` counts bytes while `TraverseString` returns runes: do not mix their indexes for non-ASCII text.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [`Python/`](Python) | `main.py` | code points; returns lists |
| C++ | [`C++/`](C++) | `main.cpp` | bytes; no `main()`, the test includes it |
| Go | [`Go/`](Go) | `main.go` | package `intro`; bytes, except `TraverseString` |

## Practice Problems

- [Longest Common Prefix](https://leetcode.com/problems/longest-common-prefix/)
- [Length of Last Word](https://leetcode.com/problems/length-of-last-word/)
- [Merge Strings Alternately](https://leetcode.com/problems/merge-strings-alternately/)

## Related

- [String Manipulation](../String_Manipulation)
- [Pattern Matching](../../../../Algorithms/String_Algorithms/Pattern_Matching/)
- [Rope](../Rope)
- [Array](../../Array)
