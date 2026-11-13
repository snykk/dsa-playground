# Trie -- Go Implementation

Prefix tree with `map[rune]*TrieNode` children. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `main.go`: `TrieNode`, `Trie` and a small `main` demo
- `main_test.go`: tests (basic operations, delete return value and pruning, non-ASCII, empty word)
- `go.mod`: module `trie`

## API

- `NewTrie() *Trie`
- `Insert(word)`
- `Search(word) bool`, `StartsWith(prefix) bool`
- `Delete(word) bool`: true if the word was stored and has been removed
- `GetAllWords() []string`: unspecified order
- `CountWords() int`, `IsEmpty() bool`

## Go-Specific Notes

Words are walked as runes in `Insert`, `Search`, `StartsWith` and `Delete`, so non-ASCII words are consistent across operations. `Delete` is iterative. `GetAllWords` and `CountWords` recurse once per character, which Go's growable stacks handle for long words. Map iteration makes the order of `GetAllWords` unspecified, so sort before comparing. The garbage collector frees pruned nodes.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- Insert and delete walk the same runes.
- Delete returns whether the word was stored and prunes unused nodes.
- Result order from `GetAllWords` is not fixed.
