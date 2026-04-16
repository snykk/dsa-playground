# C++ Implementation

This folder contains a **Rope data structure** implemented in C++ using `shared_ptr` for memory safety.

#### Classes

- `RopeNode` - Binary tree node managed via `shared_ptr`
- `Rope` - Main class wrapping the tree with value semantics

#### Operations

- `Rope(text)` - Build a rope from a string
- `index(i)` - Get character at position i
- `concat(other)` - Concatenate two ropes
- `split(i)` - Split rope at position i
- `insert(i, text)` - Insert string at position i
- `deleteStr(i, length)` - Delete substring
- `toString()` - Collect all leaves into a string
- `length()` - Get total length

#### Compile and Run Tests

```bash
g++ -std=c++17 -o test rope_test.cpp && ./test
```

#### Notes

- Uses `shared_ptr<RopeNode>` for automatic memory management
- No raw `new`/`delete` calls needed
- Structured bindings (C++17) used in split operations
