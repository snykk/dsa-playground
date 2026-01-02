# Union-Find in Go

Implementation of Union-Find (DSU) in Go.

## Features

1.  **UnionFind**: Struct implementing DSU with:
    - Path Compression
    - Union by Rank

## Usage

```go
uf := NewUnionFind(10)

// Union elements
uf.Union(0, 1)
uf.Union(1, 2)

// Check connectivity
if uf.Connected(0, 2) {
    fmt.Println("0 and 2 are connected")
}

// Get number of disjoint sets
count := uf.GetCount()
```

## Testing

Run the tests:

```bash
go test -v
```
