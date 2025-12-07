# Radix Sort (Go)

**Radix Sort** sorts numbers by processing individual digits.

---

## Usage

```go
arr := []int{170, 45, 75, 90, 802, 24, 2, 66}
RadixSort(arr)
```

---

## Testing

```bash
go test
```

---

## Complexity

- **Time**: O(d × (n + k)) where d is number of digits
- **Space**: O(n + k)

