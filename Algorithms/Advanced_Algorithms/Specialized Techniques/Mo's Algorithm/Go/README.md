# Mo's Algorithm - Go

This folder contains a Go implementation of **Mo's Algorithm** for efficient offline range queries.

---

## Concept

Mo's Algorithm is a square root decomposition technique that efficiently answers multiple range queries offline. It sorts queries by block and processes them in an optimized order.

**Key Features:**
- Square root decomposition
- Offline query processing
- Efficient for multiple range queries
- O((N + Q) × √N) complexity

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `countDistinctInRanges(arr, queries)` | Count distinct elements in ranges | O((N+Q)√N) |
| `MoSAlgorithm.processQueries(queries)` | Process queries using Mo's algorithm | O((N+Q)√N) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Process Queries | O((N+Q)√N) | O(N) |
| Query Answer | O(1) amortized | O(1) |

---

## Usage

```go
arr := []int{1, 1, 2, 1, 3, 4, 3, 3, 4}
queries := [][]int{{0, 4}, {1, 3}, {2, 6}, {0, 8}}

results := countDistinctInRanges(arr, queries)
for i, q := range queries {
    fmt.Printf("Range [%d, %d]: %d distinct\n", q[0], q[1], results[i])
}
```

---

## Running Tests

```bash
go test
```

---

_Last Updated: December 2025_

