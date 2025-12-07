# Interval Tree (Go)

An **Interval Tree** is a data structure for storing intervals and efficiently querying intervals that overlap with a given interval or point.

---

## Operations

### 1. Insert

```go
tree := NewIntervalTree()
tree.Insert(NewInterval(10, 20))
tree.Insert(NewInterval(15, 25))
```

**Time Complexity**: O(log n)

### 2. Search Overlapping

```go
result := tree.SearchOverlapping(NewInterval(14, 16))
```

**Time Complexity**: O(log n + k)

### 3. Search Point

```go
result := tree.SearchContainingPoint(15)
```

**Time Complexity**: O(log n + k)

---

## Testing

Run the test suite:

```bash
go test
```

---

## Related Data Structures

- **Segment Tree**: For range queries on arrays
- **Range Tree**: For multi-dimensional range queries

