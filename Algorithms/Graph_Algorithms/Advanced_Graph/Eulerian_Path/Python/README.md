# Eulerian Path and Circuit -- Python Implementation

The existence test for a walk that uses every edge once, and Hierholzer's algorithm, for undirected and directed graphs. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `eulerian_path.py` | `eulerian_kind`, `eulerian_path`, the `EulerWalk` result and a demo |
| `eulerian_path_test.py` | 33 unit tests: the worked examples and Konigsberg, the tie rule, edge cases (no edges, isolated vertices, self-loops, parallel edges, two components, a directed graph that is only weakly connected), invalid input, walks of 10^5 edges, counted reads of `adj`, and 1500 random graphs against brute force |

## API

- `eulerian_kind(n, edges, directed=False) -> str`: `"circuit"` when a closed walk uses every edge once (also when there is no edge), `"path"` when only an open one does, `"none"` otherwise.
- `eulerian_path(n, edges, directed=False) -> Optional[EulerWalk]`: a walk that uses every edge exactly once, a circuit whenever one exists; `EulerWalk([], [])` when there is no edge; `None` when no walk exists.
- `EulerWalk(vertices, edge_ids)`: a `NamedTuple`. `vertices` has E + 1 entries, and `edge_ids[i]` is the index, in `edges`, of the edge between `vertices[i]` and `vertices[i + 1]`.

`edges` is any iterable of pairs `(u, v)` with `0 <= u, v < n`; loops and repeated pairs are allowed. Both functions raise `ValueError` for `n < 0` or an edge end out of range.

## Python-Specific Notes

- **No recursion.** The walk keeps its vertices in a list, `stack`, and the edge that led to each in `via`. A recursive version raised `RecursionError` on a cycle of 997 edges under the default limit of 1000; the tests walk 10^5 edges.
- **The pointer.** `ptr[v]` only moves forward through `adj[v]`, so every entry is read once. The counting tests wrap `_adjacency` so that its lists count their reads, and check that a walk reads exactly E entries (directed) or 2E (undirected); a version that rescans `adj[v]` from the front fails them.
- **Tie-breaking.** `adj[v]` keeps the edges in input order, the start is fixed by the degrees (the smaller odd vertex, the vertex with out = in + 1, or the smallest vertex with an edge), and the result is the pop order reversed. The C++ and Go tests pin outputs computed by this code.
- **Inner helpers.** `_adjacency`, `_degree_check` and `_hierholzer` are module-level functions, so the tests can wrap them; the site's fixture generator reads what `_degree_check` and `_hierholzer` return.

## How to Run

```bash
python3 -m unittest eulerian_path_test
python3 eulerian_path.py   # demo: the undirected and the directed example
```

## Key Takeaways

1. The degrees decide circuit, path or nothing; the walk's length checks connectivity for free.
2. An undirected edge sits in two lists, so "used" belongs to the edge index, not to the list entry.
3. Popped vertices come out from the end of the walk: reverse them.
