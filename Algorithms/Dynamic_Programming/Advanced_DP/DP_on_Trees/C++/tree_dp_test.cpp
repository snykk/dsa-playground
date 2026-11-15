/**
 * Test cases for DP on Trees (C++)
 */

#include <algorithm>
#include <cassert>
#include <iostream>
#include <random>
#include <utility>
#include <vector>
#include "tree_dp.cpp"

TreeNode leaf(long long val) {
    return TreeNode{val, {}};
}

void testMaxIndependentSet() {
    TreeNode root{10, {leaf(20), TreeNode{30, {leaf(40)}}}};
    assert(treeDpMaxIndependentSet(&root) == 60);  // 20 + 40; 30 and 40 are adjacent
    std::cout << "[PASS] Max independent set test passed" << std::endl;
}

void testMaxIndependentSetBinaryTree() {
    TreeNode root{1, {TreeNode{2, {leaf(4), leaf(5)}}, leaf(3)}};
    assert(treeDpMaxIndependentSet(&root) == 12);  // 3 + 4 + 5
    std::cout << "[PASS] Max independent set binary tree test passed" << std::endl;
}

void testMaxIndependentSetEdgeCases() {
    assert(treeDpMaxIndependentSet(nullptr) == 0);
    TreeNode single = leaf(7);
    assert(treeDpMaxIndependentSet(&single) == 7);
    TreeNode negative{-3, {leaf(-1)}};
    assert(treeDpMaxIndependentSet(&negative) == 0);
    std::cout << "[PASS] Max independent set edge cases test passed" << std::endl;
}

void testMaxPathSum() {
    TreeNode root{10, {leaf(20), leaf(30)}};
    assert(treeDpMaxPathSum(&root) == 60);
    std::cout << "[PASS] Max path sum test passed" << std::endl;
}

void testMaxPathSumUsesAtMostTwoChildren() {
    // A star: the best path is 3 - 1 - 4, not all three leaves.
    TreeNode root{1, {leaf(2), leaf(3), leaf(4)}};
    assert(treeDpMaxPathSum(&root) == 8);
    std::cout << "[PASS] Max path sum uses at most two children test passed" << std::endl;
}

void testMaxPathSumSpine() {
    TreeNode root{10, {leaf(20), TreeNode{30, {leaf(40)}}}};
    assert(treeDpMaxPathSum(&root) == 100);  // 20 - 10 - 30 - 40
    std::cout << "[PASS] Max path sum spine test passed" << std::endl;
}

void testMaxPathSumNegativeValues() {
    TreeNode single = leaf(-5);
    assert(treeDpMaxPathSum(&single) == -5);
    TreeNode allNegative{-3, {leaf(-1), leaf(-2)}};
    assert(treeDpMaxPathSum(&allNegative) == -1);
    TreeNode mixed{1, {leaf(-6), leaf(2), leaf(3)}};
    assert(treeDpMaxPathSum(&mixed) == 6);
    std::cout << "[PASS] Max path sum negative values test passed" << std::endl;
}

void testVisitsEachNodeOnce() {
    // A chain of 64 nodes: visiting each child twice would take 2^64 steps,
    // so this only finishes if every node is expanded once.
    TreeNode chain = leaf(1);
    for (int i = 1; i < 64; ++i) {
        TreeNode parent = leaf(1);
        parent.children.push_back(std::move(chain));
        chain = std::move(parent);
    }
    assert(treeDpMaxPathSum(&chain) == 64);
    assert(treeDpMaxIndependentSet(&chain) == 32);
    std::cout << "[PASS] Visits each node once test passed" << std::endl;
}

void testMaxPathSumEmptyTree() {
    assert(treeDpMaxPathSum(nullptr) == kEmptyTreePathSum);
    std::cout << "[PASS] Max path sum empty tree test passed" << std::endl;
}

void testAgreesWithPython() {
    // Expected (independent set, path sum) printed by the Python tree_dp on the same trees.
    struct Case {
        TreeNode root;
        long long independentSet;
        long long pathSum;
    };
    std::vector<Case> cases = {
        {TreeNode{10, {leaf(20), TreeNode{30, {leaf(40)}}}}, 60, 100},
        {TreeNode{1, {TreeNode{2, {leaf(4), leaf(5)}}, leaf(3)}}, 12, 11},
        {leaf(7), 7, 7},
        {TreeNode{-3, {leaf(-1), leaf(-2)}}, 0, -1},
        {TreeNode{1, {leaf(-6), leaf(2), leaf(3)}}, 5, 6},
        {TreeNode{1, {leaf(2), leaf(3), leaf(4)}}, 9, 8},
        {TreeNode{5, {TreeNode{-2, {leaf(8), TreeNode{-1, {leaf(6), leaf(-9)}}}},
                      TreeNode{3, {leaf(-4), TreeNode{7, {leaf(2), TreeNode{1, {leaf(-3), leaf(4)}}}}}},
                      leaf(-5)}},
         30, 26},
        {TreeNode{-10, {TreeNode{4, {leaf(3), leaf(5)}}, TreeNode{6, {leaf(-1), TreeNode{2, {leaf(9)}}}}}}, 23, 17},
    };
    for (const Case& c : cases) {
        assert(treeDpMaxIndependentSet(&c.root) == c.independentSet);
        assert(treeDpMaxPathSum(&c.root) == c.pathSum);
    }
    std::cout << "[PASS] Agrees with Python test passed" << std::endl;
}

// Builds the subtree of node from a parent array (parent[i] < i for i > 0).
TreeNode buildFromParents(const std::vector<int>& parent, const std::vector<long long>& val, int node) {
    TreeNode result = leaf(val[node]);
    for (int i = node + 1; i < static_cast<int>(parent.size()); ++i) {
        if (parent[i] == node) {
            result.children.push_back(buildFromParents(parent, val, i));
        }
    }
    return result;
}

void testMatchesBruteForce() {
    std::mt19937 rng(20261115);
    for (int trial = 0; trial < 300; ++trial) {
        const int n = 1 + static_cast<int>(rng() % 10);
        std::vector<int> parent(n, -1);
        std::vector<int> depth(n, 0);
        std::vector<long long> val(n);
        for (int i = 0; i < n; ++i) {
            val[i] = static_cast<long long>(rng() % 21) - 10;
            if (i > 0) {
                parent[i] = static_cast<int>(rng() % i);
                depth[i] = depth[parent[i]] + 1;
            }
        }

        // Independent set: every subset with no node chosen beside its parent.
        long long bestSet = 0;
        for (int mask = 0; mask < (1 << n); ++mask) {
            long long sum = 0;
            bool independent = true;
            for (int i = 0; i < n; ++i) {
                if (mask & (1 << i)) {
                    sum += val[i];
                    independent = independent && !(i > 0 && (mask & (1 << parent[i])));
                }
            }
            if (independent) {
                bestSet = std::max(bestSet, sum);
            }
        }

        // Path sum: the path between every pair of nodes, found by climbing to their meeting node.
        long long bestPath = kEmptyTreePathSum;
        for (int u = 0; u < n; ++u) {
            for (int v = u; v < n; ++v) {
                int a = u;
                int b = v;
                long long sum = 0;
                while (a != b) {
                    if (depth[a] >= depth[b]) {
                        sum += val[a];
                        a = parent[a];
                    } else {
                        sum += val[b];
                        b = parent[b];
                    }
                }
                bestPath = std::max(bestPath, sum + val[a]);
            }
        }

        TreeNode root = buildFromParents(parent, val, 0);
        assert(treeDpMaxIndependentSet(&root) == bestSet);
        assert(treeDpMaxPathSum(&root) == bestPath);
    }
    std::cout << "[PASS] Matches brute force test passed" << std::endl;
}

int main() {
    std::cout << "Running DP on Trees tests..." << std::endl;
    testMaxIndependentSet();
    testMaxIndependentSetBinaryTree();
    testMaxIndependentSetEdgeCases();
    testMaxPathSum();
    testMaxPathSumUsesAtMostTwoChildren();
    testMaxPathSumSpine();
    testMaxPathSumNegativeValues();
    testVisitsEachNodeOnce();
    testMaxPathSumEmptyTree();
    testAgreesWithPython();
    testMatchesBruteForce();
    std::cout << "\nAll tests passed!" << std::endl;
    return 0;
}
