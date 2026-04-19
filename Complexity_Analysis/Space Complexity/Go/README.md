# Space Complexity — Go Implementation

**Space Complexity** measures the extra memory an algorithm needs beyond its input — both heap allocations and call-stack depth. An algorithm that's O(n) in time can still be O(n) or O(1) in space, and that choice often matters more than the time bound.

For the conceptual overview (auxiliary vs total space, trade-offs), see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.go` | Space-complexity demonstrations with measurable examples |
| `main_test.go` | Tests checking space behavior assertions |
| `go.mod` | Module definition |

---

## Go-Specific Notes

- **Escape analysis**: the Go compiler decides whether a variable goes on the stack or heap based on whether it escapes the function scope. Run `go build -gcflags="-m"` to see the decisions for each allocation.
- **`runtime.ReadMemStats`** gives concrete numbers — use it to verify your O(1) algorithm isn't secretly allocating in a loop.
- **Slice capacity matters**: `make([]int, 0, n)` allocates once; naive `append` growth doubles behind your back. For tight O(n) space bounds, always pre-size.
- **Goroutine stacks grow**: they start at 8 KB and can grow up to 1 GB. Deep recursion doesn't fail immediately like in C++/Python — but each goroutine's growth is amortized, not free.
- **`sync.Pool`** lets you recycle short-lived allocations — reduces allocation pressure in hot paths without changing the algorithm's asymptotic space.

---

## How to Run

```bash
go test -v ./...
go run main.go
```

---

## Key Takeaways for Learners

1. **Auxiliary space ≠ output space.** A sort is "in place" at O(1) auxiliary even though the output is O(n). Always specify which you mean.
2. **Go's GC changes the cost model.** Allocating a temporary slice and letting the GC reclaim it is different from freeing C++'s `new` — your "O(n)" space might hang around briefly past the function return.
3. **`go build -gcflags="-m"`** is your X-ray vision for allocations. Use it to spot surprises (accidental boxing, escaping closures) that blow your space budget.
