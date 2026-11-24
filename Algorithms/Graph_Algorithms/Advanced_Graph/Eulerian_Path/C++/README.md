# Eulerian Path and Circuit -- C++ Implementation

The existence test for a walk that uses every edge once, and Hierholzer's algorithm, for undirected and directed graphs. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `eulerian_path.cpp` | `eulerianKind`, `eulerianPath` and a demo `main` (compiled out when `IS_TEST_BUILD` is defined) |
| `eulerian_path_test.cpp` | 7 assert-based tests: the worked examples and Konigsberg, the tie rule, edge cases, invalid input, walks of 10^6 edges, 1500 random graphs against brute force, and 40 graphs pinned to the Python outputs; it `#include`s `eulerian_path.cpp` |

## API

- `enum class EulerKind { None, Path, Circuit }`.
- `struct EulerWalk { std::vector<int> vertices; std::vector<int> edgeIds; }`: E + 1 vertices, and `edgeIds[i]` is the input index of the edge between `vertices[i]` and `vertices[i + 1]`.
- `EulerKind eulerianKind(int n, const std::vector<Edge>& edges, bool directed = false)`: `Circuit` also when there is no edge. `Edge` is `std::pair<int, int>`.
- `std::optional<EulerWalk> eulerianPath(int n, const std::vector<Edge>& edges, bool directed = false)`: a walk that uses every edge exactly once, a circuit whenever one exists; an `EulerWalk` with two empty vectors when there is no edge; `std::nullopt` when no walk exists.

Both throw `std::invalid_argument` for `n < 0` or an edge end out of range.

## C++-Specific Notes

- **No recursion.** The walk keeps its vertices in a `std::vector`. A recursive version built with `-O2` crashed on a cycle of 10^5 edges with an 8 MB stack; the tests walk a cycle and a path of 10^6 edges.
- **No walk is `std::nullopt`.** It is distinct from the empty walk of a graph with no edges, which has a value.
- **Helpers.** The adjacency builder, the degree test, the walk and `solve` live in `namespace euler_detail`.
- **Same walk as Python.** `adj[v]` keeps the edges in input order and the start follows the same rule; the agreement test checks the kind and the walk on 40 graphs computed by the Python code.
- **Test build.** The test `#include`s the `.cpp`, so build only the test file, and define `IS_TEST_BUILD` to drop the demo `main`. CI also runs it under AddressSanitizer and UndefinedBehaviorSanitizer.

## How to Run

```bash
# tests
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD eulerian_path_test.cpp -o eulerian_path_test
./eulerian_path_test

# demo
g++ -std=c++17 -O2 -Wall eulerian_path.cpp -o eulerian_path_demo
./eulerian_path_demo
```

## Key Takeaways

1. `std::optional` separates "no walk" from "nothing to walk".
2. Each adjacency entry carries the edge index, so `used` is one flag per edge however many lists the edge sits in.
3. Build the test file alone: it already `#include`s the implementation.
