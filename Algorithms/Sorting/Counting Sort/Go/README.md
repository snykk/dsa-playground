# Counting Sort (Go)

**Counting Sort** sorts elements by counting occurrences.

---

## Usage

```go
arr := []int{4, 2, 2, 8, 3, 3, 1}
maxVal := 8
sorted := CountingSort(arr, maxVal)
```

---

## Testing

```bash
go test
```

---

## Complexity

- **Time**: O(n + k) where k is the range
- **Space**: O(n + k)

