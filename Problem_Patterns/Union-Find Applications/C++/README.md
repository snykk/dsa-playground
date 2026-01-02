# Union-Find in C++

Implementation of Union-Find (DSU) in C++.

## Features

1.  **UnionFind**: Class implementing DSU with:
    - Path Compression
    - Union by Rank

## Usage

```cpp
UnionFind uf(10);

// Union elements
uf.unite(0, 1);
uf.unite(1, 2);

// Check connectivity
if (uf.connected(0, 2)) {
    std::cout << "0 and 2 are connected" << std::endl;
}

// Get number of disjoint sets
int count = uf.getCount();
```

## Compilation and Testing

Compile the test file:

```bash
g++ union_find_test.cpp -o test
./test
```
