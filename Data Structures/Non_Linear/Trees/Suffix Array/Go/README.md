# Suffix Array - Go

This folder contains a Go implementation of a **Suffix Array**.

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `Search(pattern)`        | Search for pattern in text           | O(m log n)      |

---

## Usage

```go
sa := NewSuffixArray("banana")
result := sa.Search("ana")
fmt.Println(result)  // [1, 3]
```

