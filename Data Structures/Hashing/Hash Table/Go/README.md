# Hash Table (Go)

A **Hash Table** is a data structure that implements an associative array, mapping keys to values using a hash function.

---

## Operations

### 1. Put

```go
table := NewHashTable(16)
table.Put("apple", 5)
table.Put("banana", 10)
```

**Time Complexity**: O(1) average

### 2. Get

```go
value, found := table.Get("apple")
if found {
    fmt.Println(value)
}
```

**Time Complexity**: O(1) average

### 3. Remove

```go
removed := table.Remove("apple")
```

**Time Complexity**: O(1) average

---

## Testing

Run the test suite:

```bash
go test
```

---

## Related Data Structures

- **Hash Map**: Similar structure with additional features
- **Hash Set**: Stores only keys

