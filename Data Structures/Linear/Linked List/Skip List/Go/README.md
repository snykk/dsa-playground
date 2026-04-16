# Skip List - Go

This folder contains a Go implementation of **Skip List** with unit tests.

**Files:**

- `main.go` - Core implementation
- `main_test.go` - Unit tests using Go's `testing` package

**How to run:**

```bash
go run main.go
```

**How to test:**

```bash
go test
```

**Key Operations**

- Insert element (maintains sorted order)
- Search for element
- Delete element by key
- Display all elements in sorted order

**Implementation Details**

- `Node` struct with `key` and `forward` slice of pointers
- `SkipList` struct with configurable `maxLevel` and probability `p`
- `NewSkipList` constructor function for initialization
- Random level generation using coin-flip probability (default p=0.5)
