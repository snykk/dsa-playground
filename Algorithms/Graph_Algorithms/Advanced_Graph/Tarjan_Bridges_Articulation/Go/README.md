# Tarjan's Bridges & Articulation Points — Go Implementation

Single-pass O(V + E) DFS for bridges and articulation points in an undirected graph.

For the conceptual overview, visuals, and walkthrough, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | `FindBridgesAndArticulations(n, edges) Result` function |
| `main_test.go` | Table-driven tests covering standard topologies and edge cases |
| `go.mod` | Module definition |

---

## Go-Specific Notes

- **Closure-based recursive DFS**: the inner `dfs` is defined as a `func` variable so it can be self-referential and close over local state (`disc`, `low`, `bridges` map, etc.). Clean and avoids passing everything through parameters.
- **`map[Edge]struct{}` as a set**: Go has no built-in set; `map[T]struct{}{}` is the zero-byte-value idiom. Works directly with our `Edge` struct because it's `comparable`.
- **Edge IDs via adjacency struct** (`adjEntry{to, edgeID}`): correct handling of parallel edges — track which edge we came in on, not which vertex.
- **Sorted output for deterministic tests**: Go's map iteration is randomized, so we sort at the end. Without sorting, tests using `reflect.DeepEqual` would be flaky.
- **No recursion-depth bump**: Go's goroutine stacks grow dynamically (starting at 2KB, up to 1GB). Pathological inputs need iterative DFS, but typical graphs (millions of vertices) are fine.

---

## How to Run

```bash
go test -v ./...
```

---

## Key Takeaways for Learners

1. **`map[K]struct{}` is the Go set idiom.** Zero-byte value, direct key access. Use it whenever you'd reach for Python's `set`.
2. **Closures beat explicit state.** The inner `dfs` closure captures `disc`, `low`, and the accumulating sets — cleaner than passing five pointers through a recursive call.
3. **Go's goroutine stacks are flexible** but not infinite. For very deep graphs (million-node chains), convert the recursive DFS to an explicit stack — the algorithm translates directly but adds a few lines.
