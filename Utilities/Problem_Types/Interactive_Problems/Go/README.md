# Interactive Problems (Go)

Go implementation for interactive competitive programming problems.

## Key Points

- Always flush output after queries
- Use `writer.Flush()` after each query
- Handle responses carefully

## Functions

- `Query(x)` - Send query and get response
- `Answer(x)` - Submit final answer
- `GuessNumber(n)` - Binary search to guess number
- `BinarySearchAnswer(n, predicate)` - Generic binary search

## Usage

```go
defer writer.Flush()
response := Query(42)
Answer(result)
```

