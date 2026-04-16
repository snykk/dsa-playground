# Segment Tree with Lazy Propagation (Go)

Go implementation of a segment tree supporting efficient range updates and range queries.

## Files

| File | Description |
|------|-------------|
| `main.go` | Main implementation |
| `main_test.go` | Test cases |

## How to Run

```bash
go run main.go      # Run demo
go test ./...        # Run tests
```

## Key Methods

| Method | Description | Time |
|--------|-------------|------|
| `NewLazySegmentTree(arr)` | Build segment tree from slice | O(n) |
| `Query(left, right)` | Range sum query with lazy propagation | O(log n) |
| `UpdateRange(left, right, val)` | Add val to all elements in [left, right] | O(log n) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Build | O(n) |
| Range Query | O(log n) |
| Range Update | O(log n) |
| Space | O(n) |

---

_Last Updated: April 2026_
