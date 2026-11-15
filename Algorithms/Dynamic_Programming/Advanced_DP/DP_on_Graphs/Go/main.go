package main

import "errors"

// ErrCycle is returned by DAGLongestPath when a cycle is reachable from start.
var ErrCycle = errors.New("graph has a cycle: longest path is undefined")

// DAGLongestPath returns the length (in edges) of the longest path starting at
// start. graph maps a node to its successors; a node without an entry has
// none. It returns ErrCycle if a cycle (including a self-loop) is reachable
// from start.
// Time Complexity: O(V + E)
// Space Complexity: O(V)
func DAGLongestPath(graph map[int][]int, start int) (int, error) {
	onStack := map[int]bool{} // nodes whose DFS call is still running
	dp := map[int]int{}       // finished nodes: number of nodes on the longest path starting there

	var dfs func(node int) (int, error)
	dfs = func(node int) (int, error) {
		if nodes, ok := dp[node]; ok {
			return nodes, nil
		}
		if onStack[node] {
			return 0, ErrCycle
		}

		onStack[node] = true
		maxPath := 0
		for _, neighbor := range graph[node] {
			nodes, err := dfs(neighbor)
			if err != nil {
				return 0, err
			}
			maxPath = max(maxPath, nodes)
		}

		delete(onStack, node)
		dp[node] = maxPath + 1
		return dp[node], nil
	}

	nodes, err := dfs(start)
	if err != nil {
		return 0, err
	}
	return nodes - 1, nil
}
