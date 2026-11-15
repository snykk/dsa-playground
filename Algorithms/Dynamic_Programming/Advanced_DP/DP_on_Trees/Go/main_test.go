package main

import (
	"math/rand"
	"testing"
)

// node builds a tree node; leaf builds one without children.
func node(val int, children ...*TreeNode) *TreeNode {
	return &TreeNode{Val: val, Children: children}
}

func leaf(val int) *TreeNode { return node(val) }

func TestTreeDP(t *testing.T) {
	tests := []struct {
		name           string
		root           *TreeNode
		independentSet int
		pathSum        int
	}{
		// 20 + 40 for the set (30 and 40 are adjacent); 20 - 10 - 30 - 40 for the path.
		{"spine", node(10, leaf(20), node(30, leaf(40))), 60, 100},
		{"binary tree", node(1, node(2, leaf(4), leaf(5)), leaf(3)), 12, 11},
		{"empty tree", nil, 0, EmptyTreePathSum},
		{"single node", leaf(7), 7, 7},
		{"negative pair", node(-3, leaf(-1)), 0, -1},
		{"root and two leaves", node(10, leaf(20), leaf(30)), 50, 60},
		// A star: the best path is 3 - 1 - 4, not all three leaves.
		{"star uses at most two children", node(1, leaf(2), leaf(3), leaf(4)), 9, 8},
		{"single negative node", leaf(-5), 0, -5},
		{"all negative", node(-3, leaf(-1), leaf(-2)), 0, -1},
		{"mixed star", node(1, leaf(-6), leaf(2), leaf(3)), 5, 6},
		// Expected values printed by the Python tree_dp on the same trees.
		{"python: big mixed", node(5,
			node(-2, leaf(8), node(-1, leaf(6), leaf(-9))),
			node(3, leaf(-4), node(7, leaf(2), node(1, leaf(-3), leaf(4)))),
			leaf(-5)), 30, 26},
		{"python: negative root", node(-10, node(4, leaf(3), leaf(5)), node(6, leaf(-1), node(2, leaf(9)))), 23, 17},
	}
	for _, tc := range tests {
		if got := TreeDPMaxIndependentSet(tc.root); got != tc.independentSet {
			t.Errorf("%s: independent set got %d, want %d", tc.name, got, tc.independentSet)
		}
		if got := TreeDPMaxPathSum(tc.root); got != tc.pathSum {
			t.Errorf("%s: path sum got %d, want %d", tc.name, got, tc.pathSum)
		}
	}
}

func TestTreeDPVisitsEachNodeOnce(t *testing.T) {
	// A chain of 64 nodes: visiting each child twice would take 2^64 steps,
	// so this only finishes if every node is expanded once.
	chain := leaf(1)
	for i := 1; i < 64; i++ {
		chain = node(1, chain)
	}
	if got := TreeDPMaxPathSum(chain); got != 64 {
		t.Errorf("path sum got %d, want 64", got)
	}
	if got := TreeDPMaxIndependentSet(chain); got != 32 {
		t.Errorf("independent set got %d, want 32", got)
	}
}

func TestTreeDPMatchesBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(20261115))
	for trial := 0; trial < 300; trial++ {
		n := 1 + rng.Intn(10)
		parent := make([]int, n)
		depth := make([]int, n)
		val := make([]int, n)
		nodes := make([]*TreeNode, n)
		for i := 0; i < n; i++ {
			val[i] = rng.Intn(21) - 10
			nodes[i] = leaf(val[i])
			parent[i] = -1
			if i > 0 {
				parent[i] = rng.Intn(i)
				depth[i] = depth[parent[i]] + 1
				nodes[parent[i]].Children = append(nodes[parent[i]].Children, nodes[i])
			}
		}

		// Independent set: every subset with no node chosen beside its parent.
		bestSet := 0
		for mask := 0; mask < 1<<n; mask++ {
			sum, independent := 0, true
			for i := 0; i < n; i++ {
				if mask&(1<<i) != 0 {
					sum += val[i]
					if i > 0 && mask&(1<<parent[i]) != 0 {
						independent = false
					}
				}
			}
			if independent {
				bestSet = max(bestSet, sum)
			}
		}

		// Path sum: the path between every pair of nodes, found by climbing to their meeting node.
		bestPath := EmptyTreePathSum
		for u := 0; u < n; u++ {
			for v := u; v < n; v++ {
				a, b, sum := u, v, 0
				for a != b {
					if depth[a] >= depth[b] {
						sum += val[a]
						a = parent[a]
					} else {
						sum += val[b]
						b = parent[b]
					}
				}
				bestPath = max(bestPath, sum+val[a])
			}
		}

		if got := TreeDPMaxIndependentSet(nodes[0]); got != bestSet {
			t.Fatalf("trial %d: independent set got %d, want %d", trial, got, bestSet)
		}
		if got := TreeDPMaxPathSum(nodes[0]); got != bestPath {
			t.Fatalf("trial %d: path sum got %d, want %d", trial, got, bestPath)
		}
	}
}
