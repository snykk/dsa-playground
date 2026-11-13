# Aho-Corasick -- Go Implementation

A multi-pattern matcher: trie, failure links and output links.

## Files

| File | Contents |
|------|----------|
| `main.go` | package `main`: `AhoCorasick`, `New`, `Search`, `Pattern`, `Match`, and a demo `main` |
| `main_test.go` | 9 tests: single pattern, no match, empty text, empty patterns, `ushers`, overlaps, prefix patterns, single characters, a long pattern |
| `go.mod` | module `aho_corasick` |

## API

- `New(patterns []string) *AhoCorasick`: builds the automaton; empty patterns are skipped.
- `(*AhoCorasick).Search(text string) []Match`: every match as `Match{EndIndex, PatternID}`.
- `(*AhoCorasick).Pattern(id int) string`: the pattern text for an id.

## Go-Specific Notes

- Nodes are a `[]node` and link by index, so `append` reallocation is harmless.
- Children are `map[byte]int`: byte-level matching, so indices are byte offsets and multi-byte UTF-8 text matches as bytes.
- The failure BFS uses a slice as a queue (`queue[0]`, `queue[1:]`).
- After `New` returns, the automaton is only read by `Search`, so concurrent searches on one automaton do not race.
- `Match` returns the pattern id rather than a string, which avoids allocation.

## How to Run

```bash
go test -v ./...
```

## Key Takeaways

1. Index-based nodes survive slice growth.
2. The built automaton is read-only, so it can be shared between goroutines.
3. Byte-level matching works for UTF-8 because a valid encoding cannot start in the middle of another.
