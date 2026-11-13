# Array -- C++ Implementation

The C++ files are three small demonstration programs. C++ already ships a dynamic array (`std::vector`), so there is no reusable array class in this folder.

## Files

| File | Contents |
| --- | --- |
| `static_array.cpp` | a C array `int arr[5]`: traverse, read, update |
| `dynamic_array.cpp` | `std::vector<int>`: `push_back`, `insert`, `erase`, `size`, `capacity` |
| `multi_dimensional_array.cpp` | `int matrix[3][3]` and a row-major flatten with `flat[i * 3 + j]` |
| `static_array_test.cpp`, `dinamic_array_test.cpp`, `multi_dimensional_array_test.cpp` | assert-based checks of the same built-in behaviour (they do not include the demos) |

## API

There is no public API: each demo is a `main()` that prints its results. The dynamic array demo calls `std::vector::push_back(x)` (amortized O(1)), `insert(pos, x)` (O(n)), `erase(pos)` (O(n)) and reads `size()` and `capacity()`.

## C++-Specific Notes

- `std::vector` stores its elements contiguously. Growth is implementation-defined: libstdc++ and libc++ double the capacity, MSVC grows by 1.5x. Call `reserve(n)` when the final size is known.
- A reallocation invalidates all pointers, references and iterators into the vector.
- `std::array<T, N>` is the fixed-size standard container; the demo here uses a plain C array, which decays to a pointer when passed to a function and does not know its size.
- A `T matrix[R][C]` is one contiguous row-major block; `vector<vector<T>>` keeps each row in a separate allocation. A flat `vector<T>` with `i * cols + j` is the fastest layout for numeric code.

## How to Run

```bash
cd "Data_Structures/Linear/Array/C++"
g++ -std=c++17 -O2 -Wall dynamic_array.cpp -o /tmp/dynamic_array && /tmp/dynamic_array
g++ -std=c++17 -O2 -Wall dinamic_array_test.cpp -o /tmp/dyn_test && /tmp/dyn_test
g++ -std=c++17 -O2 -Wall static_array_test.cpp -o /tmp/static_test && /tmp/static_test
g++ -std=c++17 -O2 -Wall multi_dimensional_array_test.cpp -o /tmp/multi_test && /tmp/multi_test
```

## Key Takeaways

- Prefer `std::vector` for a resizable array and `reserve` when you know the size.
- Never hold iterators or pointers across an operation that can reallocate.
- Contiguous row-major layout is what makes grid traversal cache-friendly.
