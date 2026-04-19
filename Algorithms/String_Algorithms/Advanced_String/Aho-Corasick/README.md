# Aho-Corasick Algorithm

> Given a text `T` of length `n` and a set of `k` patterns with total length `m`, find **all occurrences of all patterns** in `T` in **O(n + m + z)** time, where `z` is the total number of matches.

---

## 🎯 Intuition

You're building a profanity filter. You have 10,000 forbidden words and a stream of user messages. For each message, you need to find every match of every word.

- **Naive**: for each message, for each word, run `str.find`. That's `O(n·m·k)` — 10,000× too slow for real traffic.
- **KMP**: runs one pattern against one text in `O(n + m)`. Repeated for `k` patterns, still `O(k(n + m))`.
- **Aho-Corasick**: preprocess _all_ patterns into one structure, then scan the text **once** to find every match of every pattern.

It's KMP's failure-function idea, generalized from a single pattern to an entire set of patterns via a **trie**.

---

## 📊 Visual: The Trie with Failure Links

Given patterns `{"he", "she", "his", "hers"}`:

```
         (root)
        /  |  
       h   s
       |   |
       e   h
      /|   |
     r e   e ← match: "she"
     |     
     s ← match: "hers"    (also: 'e' node matches "he")

    his branches from root → h → i → s ← match: "his"
```

**Goto edges** (solid) follow the trie: from node `N` on character `c`, `goto[N][c]` is the child.

**Failure links** (dashed) answer: "I matched this far; if the next char doesn't extend me, where's the longest prefix I could still be matching?"

- `fail[h] = root`
- `fail[he] = root`  (no shorter proper-suffix-that-is-also-a-prefix-of-any-pattern)
- `fail[she] = he` (after "she", longest matching prefix is "he" — and "he" happens to be a pattern too!)
- `fail[hers] = s` (longest proper suffix of "hers" that is a prefix in the trie is "s")

---

## 🧮 Algorithm in Three Phases

### Phase 1: Build the Trie (O(m))
Insert each pattern as a chain of nodes from the root. Mark the terminal node with the pattern ID.

### Phase 2: Build Failure Links via BFS (O(m·σ))
Process nodes level by level from the root.
- For root's children, set `fail = root`.
- For any other node `u` reached by character `c` from parent `p`:
  - `fail[u] = goto[fail[p]][c]` if that edge exists, else walk up `fail[p]`'s chain until either a match or we hit the root.
- If `fail[u]` is a terminal node for some pattern, inherit that pattern via an "output link".

### Phase 3: Scan the Text (O(n + z))
Maintain a "current node" starting at root. For each character `c` in `T`:
1. While `current` has no `goto` for `c` and `current ≠ root`, follow `fail[current]`.
2. If `goto[current][c]` exists, move to it.
3. Record all matches ending at this position by walking output links.

---

## 🚶 Step-by-Step Walkthrough

Patterns `{"he", "she", "his", "hers"}`; text = `"ushers"`.

```
pos char  current node      matches found
 0    u    root (no u)       -
 1    s    s                 -
 2    h    sh                -
 3    e    she               "she", "he" (via output link)
 4    r    sh-root-h...-s    -  (walk fail)
                                  Actually: fail[e]=root, follow root → e → no r
                                  Try fail chain; we land at 'h' via fail
                                  Then 'r' → 'he' → 'her'
 5    s    hers              "hers"
```

End: matches found = {("she", 0), ("he", 1), ("hers", 2)} (positions as end-index style).

---

## ⏱️ Complexity — and Why

| Phase | Time | Space |
|-------|------|-------|
| Build trie | O(m) | O(m·σ) for goto table or O(m) for hash-map children |
| Build failure links | O(m·σ) or O(m) depending on traversal | O(m) |
| Scan text | O(n + z) | O(1) beyond input |
| **Total** | **O(n + m + z)** | O(m·σ) |

The `σ` factor (alphabet size) is often 26 for lowercase English or 256 for bytes. For wide alphabets, use hash maps instead of arrays to keep space linear.

**Why it's faster than `k·KMP`**: a single scan shares work across all patterns. When text `"she"` matches, the structure simultaneously knows about the `"he"` match — no redo.

---

## 🎯 When to Use

✅ **Perfect fit:**
- Spam / profanity / malware signature filters
- Plagiarism detection (match text against a library of fingerprints)
- DNA motif search (find all occurrences of a motif set in a genome)
- `grep -F` when you have thousands of fixed strings
- Keyword spotting in search engines

❌ **Overkill when:**
- You have 1 or 2 patterns → KMP / Boyer-Moore is simpler
- Patterns are regexes (not fixed strings) → use an NFA-based regex engine
- Patterns change constantly — rebuilding the automaton is O(m)

---

## ⚔️ Aho-Corasick vs. Alternatives

| Technique | Preprocessing | Match | Good for |
|-----------|---------------|-------|----------|
| **Aho-Corasick** | O(m) | O(n + z) | **Multi-pattern**, fixed strings |
| k × KMP | O(m) | O(k · n) | Few patterns (k small) |
| Rabin-Karp (multi) | O(m) | O(n + z) expected | Hashable patterns, can handle fingerprints |
| Suffix Automaton | O(n + m) | Query each pattern O(\|P\|) | Many queries against one text |
| Commentz-Walter | O(m) | O(n / m_avg) best | Long patterns, rare matches |

Aho-Corasick's killer property: **linear in text length regardless of pattern count**.

---

## ⚠️ Common Pitfalls

1. **Failure link into the root is the root.** When in doubt about a failure link's target, defaulting to root is always correct (possibly suboptimal, but correct).
2. **Forgetting output links.** When pattern `P1` is a suffix of pattern `P2`, matching `P2` should also report `P1`. Output links chain these suffix-matches.
3. **Build the failure links in BFS order.** DFS breaks the invariant that `fail[p]` is already finalized when you compute `fail[child]`.
4. **Goto-vs-fail confusion.** `goto[u][c]` is "extend by `c`"; `fail[u]` is "where to fall back if extension fails". Keep them separate in your head.
5. **Character-set blow-up.** For Unicode inputs, using a 1M-entry goto array per node is insane. Use `unordered_map<int, Node*>` or switch to byte-level matching.

---

## 🔧 Implementations

| Language | Folder | Notes |
|----------|--------|-------|
| Python | [Python/](Python/) | Dict-based children for clarity; BFS failure-link construction |
| C++ | [C++/](C++/) | Array-of-26 children (lowercase ASCII demo); extensible to any σ |
| Go | [Go/](Go/) | Map-based children for arbitrary byte alphabets |

---

## 📝 Practice Problems

- [LeetCode 1032. Stream of Characters](https://leetcode.com/problems/stream-of-characters/) — online Aho-Corasick variant
- [HDU 2222. Keywords Search](https://acm.hdu.edu.cn/showproblem.php?pid=2222) — canonical textbook problem
- [Codeforces 163E. e-Government](https://codeforces.com/problemset/problem/163/E) — AC + Euler tour
- [SPOJ SUB_PROB. Substring Problem](https://www.spoj.com/problems/SUB_PROB/)

---

## 🔗 Related

- [Trie](../../../Data%20Structures/Non_Linear/Trees/Trie/README.md) — the underlying structure
- [KMP Algorithm](../../../Data%20Structures/Linear/String/Pattern%20Matching/README.md) — single-pattern ancestor
- [Z-Algorithm](../Z-Algorithm/README.md) — same "prefix matches" idea in a different guise

---

_Part of [Advanced String Algorithms](../README.md)._
