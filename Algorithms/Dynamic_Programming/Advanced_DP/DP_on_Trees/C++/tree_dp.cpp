/**
 * Dynamic Programming on Trees (C++)
 *
 * DP problems where the state is defined on tree nodes: maximum-weight
 * independent set and maximum path sum, each in one post-order pass.
 */

#include <algorithm>
#include <limits>
#include <utility>
#include <vector>

// A rooted tree node with any number of children, which it owns by value.
struct TreeNode {
    long long val = 0;
    std::vector<TreeNode> children;
};

// What treeDpMaxPathSum returns for an empty tree (Python returns float('-inf')).
constexpr long long kEmptyTreePathSum = std::numeric_limits<long long>::min();

// (include, exclude): the best sum in node's subtree with node taken or not.
static std::pair<long long, long long> independentSetDfs(const TreeNode& node) {
    long long include = node.val;
    long long exclude = 0;

    for (const TreeNode& child : node.children) {
        auto [childInclude, childExclude] = independentSetDfs(child);
        include += childExclude;
        exclude += std::max(childInclude, childExclude);
    }

    return {include, exclude};
}

/**
 * Maximum sum of node values such that no two chosen nodes are adjacent.
 * The empty selection is allowed, so an empty or all-negative tree gives 0.
 * root may be nullptr (an empty tree).
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
long long treeDpMaxIndependentSet(const TreeNode* root) {
    if (!root) {
        return 0;
    }
    auto [include, exclude] = independentSetDfs(*root);
    return std::max(include, exclude);
}

// Best sum of a downward chain that starts at node; raises maxSum to the best
// path through node.
static long long maxPathDfs(const TreeNode& node, long long& maxSum) {
    // A path through node can use at most two child chains: keep the two
    // largest positive ones (negative chains are never worth taking).
    long long best1 = 0;
    long long best2 = 0;
    for (const TreeNode& child : node.children) {
        long long gain = maxPathDfs(child, maxSum);
        if (gain > best1) {
            best2 = best1;
            best1 = gain;
        } else if (gain > best2) {
            best2 = gain;
        }
    }

    maxSum = std::max(maxSum, node.val + best1 + best2);
    return node.val + best1;
}

/**
 * Maximum path sum (a path has at least one node, may start and end anywhere
 * and uses each node at most once). Returns kEmptyTreePathSum for nullptr.
 *
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
long long treeDpMaxPathSum(const TreeNode* root) {
    long long maxSum = kEmptyTreePathSum;
    if (root) {
        maxPathDfs(*root, maxSum);
    }
    return maxSum;
}
