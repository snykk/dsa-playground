# Aho-Corasick Algorithm

Aho-Corasick finds every occurrence of every pattern from a set of `k` patterns (total length `m`) in a text of length `n`, in one pass: O(n + m + z) time, where `z` is the number of reported matches. It merges the patterns into a trie and adds KMP-style failure links.

## Intuition

A profanity filter has thousands of banned words and must scan each message. Running KMP once per word scans the message thousands of times. Aho-Corasick builds one machine for the whole dictionary and reads the message once.

It is KMP's idea applied to a trie. After reading `T[0..i]`, the machine sits at the longest suffix of the text read so far that is a prefix of some pattern. When the next character does not extend that prefix, a failure link jumps to the next-longest such suffix, exactly like `lps` in KMP. Every pattern that ends at position `i` is a suffix of that node's string, so it is found at the node or along its output links.

## Visual

Trie for the patterns `he`, `she`, `his`, `hers`. Nodes marked `*` end a pattern.

```text
root
 +-- h
 |    +-- e*            (he)
 |    |    +-- r
 |    |         +-- s*  (hers)
 |    +-- i
 |         +-- s*       (his)
 +-- s
      +-- h
           +-- e*       (she)

failure links:  sh -> h     she -> he    his -> s    hers -> s
                every other node -> root
output links:   she -> he   (he is a suffix of she and ends a pattern)
```

## How It Works

1. **Build the trie.** Insert each non-empty pattern; store the pattern (or its id) at the last node. Duplicates are stored twice.
2. **Failure links, by BFS.** Depth-1 nodes fail to the root. For a child `v` of `u` via character `c`: start at `fail[u]`, follow failure links until a node has a `c` edge; `fail[v]` is that child, or the root. BFS guarantees `fail[u]` is final before its children are processed.
3. **Output links.** `output[v]` is the nearest node on the failure chain that ends a pattern.
4. **Scan.** Keep a current node (start: the root). For each character `c`: while the node is not the root and has no `c` edge, go to its failure link; then follow the `c` edge if there is one. Report the patterns at the node and then along the output links, with the current index as the end index.

## Step-by-Step Trace

Patterns `he`, `she`, `his`, `hers`; text `ushers`.

| i | char | current node | reported (end index, pattern) |
|---|------|--------------|-------------------------------|
| 0 | `u` | root (no `u` edge) | none |
| 1 | `s` | `s` | none |
| 2 | `h` | `sh` | none |
| 3 | `e` | `she` | `(3, she)`, then `(3, he)` via the output link |
| 4 | `r` | `she` has no `r` edge: fail to `he`, then `her` | none |
| 5 | `s` | `hers` | `(5, hers)` |

The result is `[(3, 'she'), (3, 'he'), (5, 'hers')]`: end indices 3, 3, 5, so the matches start at 1, 2 and 2.

## Complexity

| Phase | Time | Space |
|-------|------|-------|
| Build trie | O(m) | O(m) with hash-map children |
| Failure and output links | O(m) amortized | O(m) |
| Scan | O(n + z) | O(1) beyond the output |
| Total | O(n + m + z) | O(m) |

The scan is linear because the depth of the current node grows by at most one per character and each failure step lowers it, so there are at most `n` failure steps. `z` can exceed `n` when patterns overlap (patterns `a`, `aa`, `aaa` on `aaaa`). A transition table with `sigma` entries per node would remove the failure loop at a cost of O(m * sigma) memory; these implementations use hash maps and keep O(m).

## When to Use

- Many fixed patterns searched in the same text or stream: keyword filters, signature scanners, `grep -F` style searches, motif search.
- Not for one or two patterns (KMP or Boyer-Moore is simpler), not for regular expressions, and not when the pattern set changes constantly (the links must be rebuilt).

## Aho-Corasick vs. Alternatives

| Technique | Preprocessing | Matching | Good for |
|-----------|---------------|----------|----------|
| Aho-Corasick | O(m) | O(n + z) | many fixed patterns |
| KMP once per pattern | O(m) | O(k * n) | few patterns |
| Rabin-Karp with a set of hashes | O(m) | O(n) expected, equal lengths | patterns of one length |
| Suffix array or tree | O(n) to O(n log n) on the text | per query | one fixed text, many queries |

## Common Pitfalls

- Forgetting output links: if `he` is a suffix of `she`, finding `she` must also report `he`.
- Computing failure links depth-first instead of breadth-first.
- Walking the failure chain past the root; stop at the root.
- Empty patterns are skipped and never match.
- Index conventions differ: Python reports `(end_index, pattern)` with code-point indices; C++ and Go report `(end_index, pattern_id)` with byte indices.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `aho_corasick.py` | `dict` children; returns `(end_index, pattern)`; 11 tests |
| C++ | [C++/](C++/) | `aho_corasick.h` | Header-only; `std::unordered_map<char, int>` children; returns `(end_index, pattern_id)` |
| Go | [Go/](Go/) | `main.go` | `map[byte]int` children; returns `Match{EndIndex, PatternID}` |

## Practice Problems

- [LeetCode 1032: Stream of Characters](https://leetcode.com/problems/stream-of-characters/)
- [CSES: String Matching](https://cses.fi/problemset/task/1753) (single pattern warm-up)
- [HDU 2222: Keywords Search](https://acm.hdu.edu.cn/showproblem.php?pid=2222)
- [SPOJ SUB_PROB: Substring Problem](https://www.spoj.com/problems/SUB_PROB/)

## Related

- [Trie](../../../../Data_Structures/Non_Linear/Trees/Trie/)
- [KMP Algorithm](../../Pattern_Matching/KMP_Algorithm/)
- [Rabin-Karp Algorithm](../../Pattern_Matching/Rabin_Karp_Algorithm/)
- [Z-Algorithm](../Z_Algorithm/)
