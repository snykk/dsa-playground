# Square Root Decomposition - Go

This folder contains a Go implementation of **Square Root Decomposition** for efficient range queries.

---

## Concept

Square Root Decomposition divides an array into blocks of size √N to enable efficient range queries and updates. Each query/update takes O(√N) time.

**Key Features:**
- Array decomposition into blocks
- Efficient range queries
- Point updates
- O(√N) per operation

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `SqrtDecomposition.Update(index, value)` | Update value at index | O(1) |
| `SqrtDecomposition.Query(left, right)` | Query sum in range | O(√N) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Query | O(√N) | O(1) |
| Update | O(1) | O(1) |
| Construction | O(N) | O(√N) |

---

## Usage

```go
arr := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
sd := NewSqrtDecomposition(arr)

result := sd.Query(2, 7)  // Sum of range [2, 7]
sd.Update(5, 20)  // Update index 5 to 20
```

---

## Running Tests

```bash
go test
```

---

_Last Updated: December 2025_

