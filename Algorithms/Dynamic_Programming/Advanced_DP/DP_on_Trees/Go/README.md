# DP on Trees -- Go Implementation

Two tree DPs over a rooted tree, maximum-weight independent set and maximum path sum, ported from the Python version.

## Files

| File | Description |
|------|-------------|
| `main.go` | `TreeNode`, `EmptyTreePathSum`, `TreeDPMaxIndependentSet`, `TreeDPMaxPathSum` (`package main`, no `main` function) |
| `main_test.go` | 3 tests: a table of the Python cases and of values printed by the Python code (both functions on every tree), a 64-node chain that only finishes if each node is expanded once, and 300 random trees checked against a brute force over all node subsets and all paths |
| `go.mod` | Module `treedp` (Go 1.21) |

## API

| Name | Description |
|------|-------------|
| `type TreeNode struct { Val int; Children []*TreeNode }` | a node with any number of children |
| `const EmptyTreePathSum = math.MinInt` | the path sum of an empty tree (Python returns `float('-inf')`) |
| `TreeDPMaxIndependentSet(root *TreeNode) int` | maximum sum of node values with no parent and child both chosen; `0` for `nil`, and `0` for an all-negative tree (the empty selection is allowed) |
| `TreeDPMaxPathSum(root *TreeNode) int` | maximum sum over paths with at least one node, any start and end, each node used once; `EmptyTreePathSum` for `nil` |

```go
root := &TreeNode{Val: 10, Children: []*TreeNode{{Val: 20}, {Val: 30, Children: []*TreeNode{{Val: 40}}}}}
TreeDPMaxIndependentSet(root) // 60  (20 + 40)
TreeDPMaxPathSum(root)        // 100 (20, 10, 30, 40)
```

## Go-Specific Notes

- Values are `int` (64 bits on the usual platforms). The sentinel `math.MinInt` is never added to, so it cannot overflow.
- A `nil` child is treated like Python's `None`: it contributes nothing.
- Both functions are recursive closures. Go stacks grow on demand, so deep trees do not hit a recursion limit as they do in Python.
- The package has no `func main`, so `go run .` does not work; use the tests.

## How to Run

```bash
cd "Algorithms/Dynamic_Programming/Advanced_DP/DP_on_Trees/Go"
go test ./...
```

## Key Takeaways

- Visit each child once and reuse the result; a second call per child is exponential.
- A path through a node uses at most two child chains; the parent can extend only one.
- Independent set needs two values per node because the parent's choice constrains the child.
