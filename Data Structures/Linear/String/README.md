# 📚 String Data Structures

Strings are one of the most fundamental linear data structures in computer science. They are **sequences of characters** and form the basis for text processing, pattern matching, bioinformatics, compilers, and nearly every user-facing application.

This folder covers three progressively deeper topics:

1. **[Introduction](String_Basics/)** — How strings are represented, indexed, and copied. The quiet performance cliffs.
2. **[String Manipulation](String%20Manipulation/)** — Common operations: reverse, palindrome, case, split, join.
3. **[Pattern Matching](Pattern%20Matching/)** — Finding a pattern `P` in a text `T`: Naive, KMP, Rabin-Karp, Boyer-Moore.

---

## 🎯 Why Strings Deserve Special Attention

Strings look like arrays of characters, but they carry four invisible complexities that every developer must internalize:

1. **Immutability model** — Python / Java strings are immutable; C++ `std::string` is mutable; Go strings are immutable but _slicable_ in O(1).
2. **Encoding** — ASCII? UTF-8? UTF-16? `"é"` is 1 byte in Latin-1 and 2 bytes in UTF-8; `len()` can mean bytes _or_ code points.
3. **Copy semantics** — Slicing can be O(k) (copy) or O(1) (view) depending on language.
4. **Concatenation performance** — The `+=` in a loop trap: O(n²) if you're not careful. Universal across languages.

---

## 🔑 Topics at a Glance

### 1. Introduction
Representations, indexing, length, iteration, immutability vs. mutability. The goal is to understand what happens _in memory_ for each operation.

### 2. String Manipulation
Reversing, case conversion, substring extraction, split/join, palindrome check. Practical operations plus common pitfalls (repeated concatenation, UTF-8 miscount, slice-vs-copy confusion).

### 3. Pattern Matching
Finding occurrences of `P` inside `T`:

- **Naive** — brute force, `O(n·m)`
- **KMP** — preprocess pattern's failure table, `O(n + m)` guaranteed
- **Rabin-Karp** — rolling hash, `O(n + m)` average, excellent for multi-pattern search
- **Boyer-Moore** — bad-character + good-suffix heuristics, sublinear on random text for long patterns

---

## ⚔️ Pattern Matching — When to Pick Which

| Algorithm | Preprocessing | Match | Alphabet sensitivity | Good when... |
|-----------|---------------|-------|----------------------|--------------|
| **Naive** | O(1) | O(n·m) | None | Pattern is tiny, matches appear early, or you're prototyping |
| **KMP** | O(m) | O(n + m) | None | You need **guaranteed linear** time; interviews love this |
| **Rabin-Karp** | O(m) | O(n + m) avg, O(n·m) worst | None | **Multi-pattern search** (hash a dictionary of patterns, scan text once) |
| **Boyer-Moore** | O(m + σ) | O(n/m) best, O(n·m) worst | Yes (large σ helps) | Long patterns over large alphabets (text editors, search tools) |

> `n` = text length, `m` = pattern length, `σ` = alphabet size

Practical rule: **`str.find` / `std::string::find` / `strings.Index` are already very well optimized** — roll your own KMP only for learning or when you need the failure table itself.

---

## 📊 Complexity Overview

| Operation   | Python | C++ (`std::string`) | Go       |
| ----------- | ------ | ------------------- | -------- |
| Access char | O(1)   | O(1)                | O(1) byte, O(n) rune |
| Length      | O(1)   | O(1)                | O(1) byte count |
| Search (builtin) | O(n) avg | O(n) avg       | O(n) avg |
| Concatenate | O(n+m) | O(n+m)              | O(n+m)   |
| Substring   | O(k) copy | O(k) copy; O(1) via `string_view` | **O(1)** (aliases) |

> `n` = length of string, `k` = length of substring, `m` = second string length

---

## ⚠️ Common Pitfalls (Universal Across Languages)

1. **The `+=` in a loop trap**: concatenation in a loop is O(n²). Use `"".join(list)` (Python), `strings.Builder` (Go), or pre-reserved `std::string` with `+=` (C++ — mutable strings save you here).
2. **Byte count vs. character count**: Python `len()` counts code points; Go `len()` counts bytes; C++ `.size()` counts bytes. Mixing them up is the #1 UTF-8 bug.
3. **Slice aliasing**: Go slices share memory; Python slicing copies; C++ `string_view` aliases, `substr()` copies. Know which.
4. **Null-termination assumption**: C strings need `\0`, modern strings don't. Don't mix them carelessly.
5. **Case folding is locale-dependent**: `"İ".lower()` gives `"i̇"` in Turkish. Most DSA problems pretend ASCII — be explicit when it matters.

---

## 🎓 Learning Roadmap

1. **Start with [Introduction](String_Basics/)** — build an accurate mental model of how strings behave in your language.
2. **Move to [String Manipulation](String%20Manipulation/)** — master the "classic interview" operations (reverse, palindrome, etc.) both with stdlib and from scratch.
3. **Finish with [Pattern Matching](Pattern%20Matching/)** — learn KMP first (most teachable), then Rabin-Karp (for rolling-hash intuition), then Boyer-Moore (for the "skip ahead" insight).
4. **Then branch into [Advanced String Algorithms](../../../Algorithms/String_Algorithms/)** — Z-algorithm, suffix array, Manacher's, and eventually Aho-Corasick for multi-pattern.

---

## 💻 Implementation Languages

- 🐍 **Python** — beginner-friendly and readable; built-in `str` methods are industrial-strength
- ⚡ **C++** — high-performance; `std::string`, `std::string_view`, `std::boyer_moore_searcher` in C++17
- 🚀 **Go** — immutable UTF-8 strings with O(1) slicing; `strings` package covers most needs

---

## 📚 Additional Resources

- [GeeksforGeeks — String Algorithms](https://www.geeksforgeeks.org/string-data-structure/)
- [Visualgo — String Visualizations](https://visualgo.net/en/string)
- [CP-Algorithms — String Processing](https://cp-algorithms.com/string/prefix-function.html)
- CLRS — Chapter 32 (String Matching)
- _"Flexible Pattern Matching in Strings"_ by Navarro & Raffinot — comprehensive reference

---

**Happy Coding! 🚀**

> "Strings are everywhere. Mastering them is the first step to mastering algorithms."
