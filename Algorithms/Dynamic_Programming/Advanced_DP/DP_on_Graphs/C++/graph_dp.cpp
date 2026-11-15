/**
 * Dynamic Programming on Graphs (C++)
 *
 * Longest path in a directed acyclic graph with a memoized DFS, with cycle
 * detection.
 */

#include <algorithm>
#include <stdexcept>
#include <unordered_map>
#include <unordered_set>
#include <vector>

// Adjacency list: node -> successor nodes. A node without an entry has none.
using Graph = std::unordered_map<int, std::vector<int>>;

// Number of nodes on the longest path starting at node. memo holds finished
// nodes; onStack holds the nodes whose call is still running.
static int longestPathNodes(const Graph& graph, int node, std::unordered_map<int, int>& memo,
                            std::unordered_set<int>& onStack) {
    auto done = memo.find(node);
    if (done != memo.end()) {
        return done->second;
    }
    if (onStack.count(node)) {
        throw std::invalid_argument("graph has a cycle: longest path is undefined");
    }

    onStack.insert(node);
    int maxPath = 0;

    auto successors = graph.find(node);
    if (successors != graph.end()) {
        for (int neighbor : successors->second) {
            maxPath = std::max(maxPath, longestPathNodes(graph, neighbor, memo, onStack));
        }
    }

    onStack.erase(node);
    memo[node] = maxPath + 1;
    return maxPath + 1;
}

/**
 * Length (in edges) of the longest path starting at start.
 *
 * Throws std::invalid_argument if a cycle (including a self-loop) is reachable
 * from start.
 *
 * Time Complexity: O(V + E)
 * Space Complexity: O(V)
 */
int dagLongestPath(const Graph& graph, int start) {
    std::unordered_map<int, int> memo;
    std::unordered_set<int> onStack;
    return longestPathNodes(graph, start, memo, onStack) - 1;
}
