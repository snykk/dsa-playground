# Tarjan's Bridges and Articulation Points -- Python Implementation

One O(V + E) DFS that finds the bridges and the articulation points of an undirected graph. For the idea, the trace and the rules, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `tarjan_bridges.py` | `find_bridges_and_articulations(n, edges)` |
| `tarjan_bridges_test.py` | 13 unit tests: single edge, triangle, tail, chain, isolated vertices, components, star, LeetCode 1192 example, parallel edges, cycle with a bridge, a 100000-vertex path and cycle, self-loop |

## API

- `find_bridges_and_articulations(n, edges) -> (bridges, articulation_points)`: `n` is the number of vertices (labelled `0..n-1`) and `edges` is a list of `(u, v)` pairs. Bridges come back as sorted `(min, max)` pairs; articulation points as a sorted list. Self-loops and parallel edges are supported.

## Python-Specific Notes

- **Edge-indexed parent tracking.** The DFS skips the edge id it arrived by, not the parent vertex, so parallel edges are handled correctly.
- **Iterative DFS.** Each stack frame `[u, parent_edge, next_index, children]` stands for one recursive call. A recursive version fails at about 1000 vertices, and raising `sys.setrecursionlimit` makes the interpreter crash on a long path instead.
- **Labels.** `adj` is a dict keyed by `range(n)`, so a label at or above `n` raises `KeyError`.
- **Self-loops** are back edges to the same vertex; they change nothing.

## How to Run

```bash
python3 -m unittest tarjan_bridges_test
python3 tarjan_bridges.py      # demo: triangle with a tail
```

## Key Takeaways

1. `disc` and `low` give bridges and articulation points in the same pass.
2. Track the incoming edge id to support multigraphs.
3. The root is special: it needs at least two DFS children to be a cut vertex.
