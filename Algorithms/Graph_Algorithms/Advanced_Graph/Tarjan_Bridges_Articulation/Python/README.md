# Tarjan's Bridges & Articulation Points — Python Implementation

Single-pass O(V + E) DFS detecting both bridges (critical edges) and articulation points (cut vertices) in an undirected graph.

For the conceptual overview, visuals, and walkthrough, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `tarjan_bridges.py` | `find_bridges_and_articulations(n, edges)` function |
| `tarjan_bridges_test.py` | Unit tests covering standard topologies and edge cases |

---

## Python-Specific Notes

- **Edge-indexed parent tracking.** Parallel edges (two edges between `u` and `v`) break the "skip parent vertex" rule. We track the edge _index_ we came in on instead — robust against multi-edges.
- **Iterative DFS with an explicit stack.** Each stack frame `[u, parent_edge, next_index, children]` stands for one recursive call, so a 100,000-vertex path works. Python's default recursion limit (1000) is far too low for a recursive DFS, and raising `sys.setrecursionlimit` is not a fix: the deeper recursion overflows the C stack and the interpreter crashes.
- **Plain local `timer`**: the DFS loop lives in the function body, so no `nonlocal` or one-element-list trick is needed.
- **Adjacency list via `dict`** keyed by `0..n-1`: every vertex label must be in that range (`disc` and `low` are lists of length `n`).
- **Self-loops are fine** — they're back edges with `v == u`, which means `disc[v] == disc[u]`, and `low` updates are harmless.

---

## How to Run

```bash
python3 -m unittest tarjan_bridges_test.py
```

---

## Key Takeaways for Learners

1. **Two arrays, one DFS, two answers.** `disc[]` and `low[]` give you bridges and articulation points simultaneously — no second pass needed.
2. **Edge-indexed parent is the multi-edge fix.** If you ever work with multigraphs (parallel edges), the "skip parent vertex" idiom silently fails. Use edge IDs.
3. **Root is special.** Non-root articulation: `low[v] >= disc[u]`. Root articulation: at least 2 DFS children. Forgetting this gives wrong answers on tree-like root vertices.
