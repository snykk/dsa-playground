# Huffman Coding -- Go Implementation

This folder is a placeholder. The only function, `HuffmanEncode`, returns an empty map; the full algorithm exists in Python only (see `../Python/huffman_coding.py`).

## Files

| File | Contents |
|------|----------|
| `main.go` | the placeholder `HuffmanEncode` (`package main`, no `main` function) |
| `main_test.go` | one test that only checks that the placeholder returns a non-nil map |
| `go.mod` | module definition (`huffmancoding`) |

## API

| Name | Description |
|------|-------------|
| `HuffmanEncode(text string) map[rune]string` | placeholder: always returns an empty, non-nil map |

There is no tree type, no heap, no decoder and no compression-ratio helper in Go. Writing them is future work.

## Go-Specific Notes

- A real port would use `container/heap` for the min-heap and `rune` keys, which the signature already uses, so that Unicode text works.
- Equal frequencies leave the exact code table dependent on the heap order, as in Python.
- The package has no `func main`, so `go run .` does not work; use the tests.

## How to Run

```bash
cd "Algorithms/Greedy/Huffman_Coding/Go"
go test ./...
```

## Key Takeaways

- Nothing is implemented here yet; use the Python version.
- A passing test does not mean the algorithm works in Go.
