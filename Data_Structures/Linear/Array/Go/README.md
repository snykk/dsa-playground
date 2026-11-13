# Array -- Go Implementation

The Go code shows arrays and slices. Slices are Go's built-in dynamic array, so there is no custom type to import.

## Files

Each subfolder is its own module with its own `go.mod`.

| Path | Contents |
| --- | --- |
| `static_array/main.go` | a fixed-size `[5]int`: print, read, update |
| `dynamic_array/main.go` | a slice: `append`, insert at index 1, remove at index 2, `len` and `cap` |
| `multi_dimensional_array/main.go` | a 2D slice and a row-major flatten |
| `*/main_test.go` | tests in `package main_test` that check slice and array behaviour (they do not import the demos) |

## API

There is no exported API: each `main.go` is a demo program. The idioms used are `append(s, x)`, `append(s[:i], s[i+1:]...)` for removal, and the pair `append(s[:i], append([]T{x}, s[i:]...)...)` for insertion.

## Go-Specific Notes

- An array `[N]T` is a value: assigning or passing it copies all elements. A slice is a small header (pointer, length, capacity) over an array.
- `append` reuses the backing array while capacity allows and otherwise allocates a larger one, so other slices of the old array stop seeing new writes. A sub-slice `b := a[:2]` shares storage with `a`, and `append(b, x)` can overwrite `a[2]`.
- Growth roughly doubles for small slices and grows more slowly for large ones; do not rely on exact capacities.
- `[][]T` is idiomatic for grids but each row is a separate allocation. Use one flat slice and `i*cols + j` for a contiguous layout.

## How to Run

There is no `go.mod` at `Go/`, so run the tests inside each subfolder:

```bash
cd "Data_Structures/Linear/Array/Go/dynamic_array" && go test ./... && go run .
cd "../static_array" && go test ./... && go run .
cd "../multi_dimensional_array" && go test ./... && go run .
```

## Key Takeaways

- Slices are the dynamic array; arrays are values with a size fixed in the type.
- Watch aliasing: slices can share a backing array.
- Flatten grids when cache behaviour matters.
