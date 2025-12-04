# Suffix Tree - Go

This folder contains a Go implementation of a **Suffix Tree**.

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `Search(pattern)`        | Search for pattern in text           | O(m)            |

---

## Usage

```go
st := NewSuffixTree("banana")
result := st.Search("ana")
fmt.Println(result)  // [1, 3]
```

---

## Notes

- O(m) pattern search complexity
- More complex than Suffix Array but faster


