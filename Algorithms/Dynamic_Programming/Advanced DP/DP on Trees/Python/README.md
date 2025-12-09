# DP on Trees (Python)

**DP on Trees** is a technique for solving optimization problems on tree structures using Dynamic Programming, where the state is defined on tree nodes and computed through tree traversal.

---

## Overview

Tree DP problems involve making decisions at each node based on decisions made at child nodes. The key insight is that trees have no cycles, making them ideal for DP: each subtree can be solved independently.

Common patterns:
- **Bottom-up**: Process children first, then parent
- **Top-down**: Process parent first, then children
- **Include/Exclude**: Decide whether to include current node

---

## Algorithm

1. **Traverse tree**: Usually post-order (process children before parent)
2. **DP State**: Store results for each node (often include/exclude)
3. **Combine**: Merge results from children to compute parent state
4. **Base Case**: Leaf nodes have simple base cases

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **All Cases** | O(n) | O(n) |

Where n is the number of nodes in the tree.

**Note**: Each node is visited once, and state computation is typically O(1) per node.

---

## Implementation Details

### Functions

1. **`tree_dp_max_independent_set(root)`**
   - Maximum Independent Set on Tree
   - Find maximum sum of nodes such that no two selected nodes are adjacent
   - Returns (include, exclude) for each node
   - Time: O(n), Space: O(n)

2. **`tree_dp_max_path_sum(root)`**
   - Maximum path sum in tree
   - Can start and end anywhere in tree
   - Returns maximum sum path
   - Time: O(n), Space: O(n)

---

## Usage

```python
from tree_dp import TreeNode, tree_dp_max_independent_set, tree_dp_max_path_sum

# Create tree
#       10
#      /  \
#    20   30
#          \
#          40
root = TreeNode(10, [
    TreeNode(20),
    TreeNode(30, [TreeNode(40)])
])

# Maximum Independent Set
# Select nodes with maximum sum, no two adjacent
max_sum = tree_dp_max_independent_set(root)
print(max_sum)  # Output: 70 (select 20, 30, 40)

# Maximum Path Sum
# Find path with maximum sum (can start/end anywhere)
max_path = tree_dp_max_path_sum(root)
print(max_path)  # Output: 100 (path: 20 -> 10 -> 30 -> 40)

# Binary tree example
#        1
#       / \
#      2   3
#     / \
#    4   5
root2 = TreeNode(1, [
    TreeNode(2, [TreeNode(4), TreeNode(5)]),
    TreeNode(3)
])
max_independent = tree_dp_max_independent_set(root2)
print(max_independent)  # Output: 11 (select 1, 4, 5)
```

---

## Common Problem Types

### 1. Maximum Independent Set
- Select nodes with maximum sum
- No two selected nodes are adjacent
- Classic tree DP problem

### 2. Maximum Path Sum
- Find path with maximum sum
- Path can start and end anywhere
- Similar to Kadane's on trees

### 3. Tree Diameter
- Longest path between any two nodes
- Can use DP or two DFS passes

### 4. Tree Coloring
- Color nodes with constraints
- Minimize colors or maximize value

### 5. Tree Matching
- Maximum matching in tree
- Pair nodes with edges

---

## Key Concepts

### Include/Exclude Pattern

For each node, compute:
- **Include**: Best solution including this node
- **Exclude**: Best solution excluding this node

Then combine from children:
- If include parent: must exclude all children
- If exclude parent: can include or exclude children

### Bottom-Up Processing

Process children before parent:
1. Recursively solve all subtrees
2. Combine results at current node
3. Return state to parent

---

## Important Notes

1. **Tree Structure**: Assumes tree (no cycles), not general graph
2. **Traversal Order**: Usually post-order (children before parent)
3. **State Design**: Choose minimal state representation
4. **Base Cases**: Leaf nodes have simple base cases

---

## Advantages

1. ✅ **Efficient**: O(n) for tree with n nodes
2. ✅ **Natural**: Tree structure fits DP naturally
3. ✅ **Flexible**: Can handle various tree problems

---

## Disadvantages

1. ❌ **Tree Only**: Doesn't work on graphs with cycles
2. ❌ **State Design**: Can be complex for some problems
3. ❌ **Memory**: May need O(n) space per state dimension

---

## When to Use

- ✅ Optimization problems on trees
- ✅ Problems with optimal substructure on trees
- ✅ When decisions at nodes depend on children
- ❌ General graphs (use graph DP instead)
- ❌ When greedy works (simpler)

---

## Testing

Run the test suite:

```bash
python tree_dp_test.py
```

---

## Comparison: Tree DP vs Graph DP

| Aspect | Tree DP | Graph DP |
|--------|---------|----------|
| **Structure** | Tree (no cycles) | DAG or general graph |
| **Traversal** | DFS (post-order) | Topological sort (DAG) |
| **Complexity** | O(n) | O(V + E) |
| **State Design** | Simpler | More complex |
| **Applications** | Tree optimization | Graph optimization |

---

## Applications

1. **Tree Optimization**: Maximize/minimize values on trees
2. **Game Theory**: Optimal play on tree games
3. **Network Design**: Optimize tree network structures
4. **Hierarchical Problems**: Problems with tree-like hierarchy

---

## Related Algorithms

- **Graph DP**: Similar techniques for DAGs
- **Tree Traversal**: DFS/BFS for tree processing
- **Tree Algorithms**: Tree diameter, centroid, etc.
- **Tree Coloring**: Graph coloring on trees

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 22)
- Competitive Programming resources
- Tree DP tutorials on online judges
- LeetCode problems on tree DP

---

_Last Updated: December 2025_

