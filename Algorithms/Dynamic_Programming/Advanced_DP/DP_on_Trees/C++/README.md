# DP on Trees -- C++ Implementation

Two tree DPs over a rooted tree, maximum-weight independent set and maximum path sum, ported from the Python version in C++17.

## Files

| File | Description |
|------|-------------|
| `tree_dp.cpp` | `TreeNode`, `kEmptyTreePathSum`, `treeDpMaxIndependentSet`, `treeDpMaxPathSum` |
| `tree_dp_test.cpp` | 11 assert-based tests: the 9 Python cases (a 64-node chain stands in for the Python count of expanded nodes), values printed by the Python code, and 300 random trees checked against a brute force over all node subsets and all paths |

## API

| Name | Description |
|------|-------------|
| `struct TreeNode { long long val; std::vector<TreeNode> children; }` | a node with any number of children, owned by value |
| `constexpr long long kEmptyTreePathSum` | `std::numeric_limits<long long>::min()`: the path sum of an empty tree (Python returns `float('-inf')`) |
| `long long treeDpMaxIndependentSet(const TreeNode* root)` | maximum sum of node values with no parent and child both chosen; `0` for `nullptr`, and `0` for an all-negative tree (the empty selection is allowed) |
| `long long treeDpMaxPathSum(const TreeNode* root)` | maximum sum over paths with at least one node, any start and end, each node used once; `kEmptyTreePathSum` for `nullptr` |

```cpp
TreeNode root{10, {TreeNode{20, {}}, TreeNode{30, {TreeNode{40, {}}}}}};
treeDpMaxIndependentSet(&root);  // 60  (20 + 40)
treeDpMaxPathSum(&root);         // 100 (20, 10, 30, 40)
```

## C++-Specific Notes

- Children are stored by value in a `std::vector<TreeNode>`, so a tree is one value that frees itself; there are no raw owning pointers. A pointer to the root (or `nullptr`) stands for Python's `root` (or `None`).
- Values and sums are `long long`. The empty-tree sentinel is never added to, so it cannot overflow.
- Both functions recurse once per tree level. The default 8 MB stack holds chains of many thousands of nodes; for deeper trees use an iterative post-order.
- Each child is visited once and its result reused; a second call per child would be exponential (the 64-node chain test would never finish).

## How to Run

```bash
cd "Algorithms/Dynamic_Programming/Advanced_DP/DP_on_Trees/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD tree_dp_test.cpp -o tree_dp_test
./tree_dp_test
```

## Key Takeaways

- Independent set needs two values per node, `(include, exclude)`, because the parent's choice constrains the child.
- A path through a node uses at most two child chains; the parent can extend only one.
- The empty tree has no path, so the path sum needs a sentinel below every real sum.
