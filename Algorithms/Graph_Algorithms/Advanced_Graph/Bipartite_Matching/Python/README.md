# Bipartite Matching -- Python Implementation

Maximum matching in an unweighted bipartite graph with Kuhn's algorithm and Hopcroft-Karp, and a minimum vertex cover by Konig's theorem. For the idea, the traces and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `bipartite_matching.py` | `kuhn`, `hopcroft_karp`, `min_vertex_cover` and a demo |
| `bipartite_matching_test.py` | 24 unit tests: the worked example, edge cases, an augmenting path through 3000 left vertices, the phases of Hopcroft-Karp, counted reads of `adj` (at most E per Kuhn search, at most E in a phase's BFS and E in its DFSs), random graphs against brute force and against max flow on the reduction |

## API

- `kuhn(n_left, n_right, edges) -> (size, match_left)`: a maximum matching. `edges` is any iterable of pairs `(u, v)` with `0 <= u < n_left` and `0 <= v < n_right`; `match_left[u]` is `u`'s partner or -1.
- `hopcroft_karp(n_left, n_right, edges) -> (size, match_left)`: the same with Hopcroft-Karp. The size is the same; the matching may differ.
- `min_vertex_cover(n_left, n_right, edges) -> (left_cover, right_cover)`: Konig's cover from the Hopcroft-Karp matching, each list increasing.

All three raise `ValueError` for a negative side size or an edge endpoint out of range.

## Python-Specific Notes

- **No recursion.** Both searches keep the path in three lists, `stack` (left vertices), `next_edge` (where each one is in its adjacency list) and `through` (the right vertices between them), and run the same steps as the recursive DFS. A recursive version raises `RecursionError` once a path passes about 1000 left vertices; the test runs a path through 3000.
- **Seen marks without clearing.** `seen[v] == root` means "tried by the search from `root`", so Kuhn never clears an array between roots.
- **Tie-breaking.** `adj[u]` keeps the edges in input order and every search tries them in that order, so the matching depends on the order of `edges`. The C++ and Go tests pin outputs computed by this code.
- **Inner helpers.** `_adjacency`, `_bfs_layers`, `_hk_augment` and `_kuhn_augment` are module-level functions, so the tests can wrap them to watch every phase and every search and to count reads of `adj`. The site's fixture generator reads their lists when they return.

## How to Run

```bash
python3 -m unittest bipartite_matching_test
python3 bipartite_matching.py   # demo: Kuhn (3, [2, 1, 0, -1]), Hopcroft-Karp (3, [2, 0, -1, 1]), cover ([0], [0, 1])
```

## Key Takeaways

1. Both algorithms flip augmenting paths until none is left; they differ in how they look for them.
2. Hopcroft-Karp's layers make every path of a phase a shortest one, which is what bounds the number of phases.
3. The final matching gives a minimum vertex cover for free: the left vertices outside `Z` and the right vertices inside it.
