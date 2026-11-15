package main

import "math"

// TreeNode is a rooted tree node with any number of children.
type TreeNode struct {
	Val      int
	Children []*TreeNode
}

// EmptyTreePathSum is what TreeDPMaxPathSum returns for an empty tree
// (Python returns float('-inf')).
const EmptyTreePathSum = math.MinInt

// TreeDPMaxIndependentSet returns the maximum sum of node values such that no
// two chosen nodes are adjacent. The empty selection is allowed, so an empty
// (nil) or all-negative tree gives 0.
// Time Complexity: O(n)
// Space Complexity: O(n)
func TreeDPMaxIndependentSet(root *TreeNode) int {
	var dfs func(node *TreeNode) (include, exclude int)
	dfs = func(node *TreeNode) (int, int) {
		if node == nil {
			return 0, 0
		}

		include, exclude := node.Val, 0
		for _, child := range node.Children {
			childInclude, childExclude := dfs(child)
			include += childExclude
			exclude += max(childInclude, childExclude)
		}
		return include, exclude
	}

	include, exclude := dfs(root)
	return max(include, exclude)
}

// TreeDPMaxPathSum returns the maximum path sum (a path has at least one node,
// may start and end anywhere and uses each node at most once). It returns
// EmptyTreePathSum for a nil tree.
// Time Complexity: O(n)
// Space Complexity: O(n)
func TreeDPMaxPathSum(root *TreeNode) int {
	maxSum := EmptyTreePathSum

	// dfs returns the best sum of a downward chain that starts at node.
	var dfs func(node *TreeNode) int
	dfs = func(node *TreeNode) int {
		if node == nil {
			return 0
		}

		// A path through node can use at most two child chains: keep the two
		// largest positive ones (negative chains are never worth taking).
		best1, best2 := 0, 0
		for _, child := range node.Children {
			gain := dfs(child)
			if gain > best1 {
				best1, best2 = gain, best1
			} else if gain > best2 {
				best2 = gain
			}
		}

		maxSum = max(maxSum, node.Val+best1+best2)
		return node.Val + best1
	}

	dfs(root)
	return maxSum
}
