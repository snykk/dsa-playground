# Hash Map (Go)

A **Hash Map** extends Hash Table with additional convenience methods.

---

## Additional Features

### 1. Get or Default

```go
value := hm.GetOrDefault("key", 0)
```

### 2. Put If Absent

```go
if hm.PutIfAbsent("key", value) {
    // Value was inserted
}
```

---

## Testing

Run the test suite:

```bash
go test
```

