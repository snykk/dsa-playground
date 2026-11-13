# Suffix Tree -- Go Implementation

Compressed suffix tree built suffix by suffix. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `main.go`: `SuffixTree`, `SuffixTreeNode` and a small `main` demo
- `main_test.go`: exact-result tests, edge-split regressions and a randomized comparison with brute force
- `go.mod`: module `suffix_tree`

## API

- `NewSuffixTree(text string) *SuffixTree`: panics if the text contains a NUL byte
- `Search(pattern string) []int`: sorted start indices (byte offsets); empty for an empty or absent pattern
- `GetAllSuffixes() []string`: sorted non-empty suffixes

## Go-Specific Notes

Children are keyed by `byte`, and all positions are byte offsets, so a multi-byte UTF-8 character counts as several positions. Edges store `start` and `end` indices. Leaf collection uses an explicit stack, so a chain-shaped tree does not grow the call stack. The garbage collector frees the nodes. The earlier version never split edges and returned at most one match; both are fixed.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- A mismatch inside an edge label splits the edge.
- Search collects every leaf below the match point.
- Offsets are bytes, not characters.
