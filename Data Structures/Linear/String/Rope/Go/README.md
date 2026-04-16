# Go Implementation

This folder contains a **Rope data structure** implemented in Go.

#### Types

- `RopeNode` - Binary tree node (leaf stores string fragment, internal stores weight)
- `Rope` - Wrapper struct with exported methods

#### Operations

- `NewRope(text)` - Build a rope from a string
- `Index(i)` - Get byte at position i
- `Concat(other)` - Concatenate two ropes
- `Split(i)` - Split rope at position i
- `Insert(i, text)` - Insert string at position i
- `Delete(i, length)` - Delete substring
- `ToString()` - Collect all leaves into a string
- `Len()` - Get total length

#### Run Tests

```bash
go test ./...
```

#### Run Demo

```bash
go run main.go
```

#### Notes

- Uses `package main` with a demo `main()` function
- All methods are exported (PascalCase) for testing
