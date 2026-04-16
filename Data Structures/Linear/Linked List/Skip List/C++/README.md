# Skip List - C++

This folder contains a C++ implementation of **Skip List** with test file.

**Files:**

- `skip_list.cpp` - Core implementation
- `skip_list_test.cpp` - Test examples using `assert` and `main`

**How to compile and run:**

```bash
g++ -std=c++17 -o test skip_list_test.cpp
./test
```

**Key Operations**

- Insert element (maintains sorted order)
- Search for element
- Delete element by key
- Display all elements in sorted order

**Implementation Details**

- `Node` struct with `key` and `forward` vector of pointers
- `SkipList` class with configurable `max_level` and probability `p`
- Random level generation using coin-flip probability (default p=0.5)
- Proper memory cleanup in destructor
