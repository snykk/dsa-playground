/**
 * Graph Traversal Implementation
 * 
 * Includes:
 * 1. BFS Shortest Path
 * 2. Flood Fill (Number of Islands)
 * 3. Topological Sort
 */

#include <vector>
#include <queue>
#include <map>
#include <set>
#include <iostream>

// Graph represented as adjacency list
using Graph = std::map<int, std::vector<int>>;

class GraphTraversal {
public:
    // 1. BFS Shortest Path (Unweighted)
    // Time: O(V + E)
    static int bfsShortestPath(const Graph& graph, int start, int target) {
        if (graph.find(start) == graph.end()) return -1;
        if (start == target) return 0;

        std::queue<std::pair<int, int>> q;
        q.push({start, 0});
        
        std::set<int> visited;
        visited.insert(start);

        while (!q.empty()) {
            auto [node, dist] = q.front();
            q.pop();

            if (node == target) return dist;

            if (graph.find(node) != graph.end()) {
                for (int neighbor : graph.at(node)) {
                    if (visited.find(neighbor) == visited.end()) {
                        visited.insert(neighbor);
                        q.push({neighbor, dist + 1});
                    }
                }
            }
        }
        return -1;
    }

    // 2. Flood Fill (Number of Islands)
    // Time: O(R * C)
    static int numIslands(std::vector<std::vector<char>>& grid) {
        if (grid.empty() || grid[0].empty()) return 0;

        int rows = grid.size();
        int cols = grid[0].size();
        int count = 0;

        // DFS Helper
        auto dfs = [&](auto&& self, int r, int c) -> void {
            if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] != '1') return;
            grid[r][c] = '0'; // Sink island

            self(self, r + 1, c);
            self(self, r - 1, c);
            self(self, r, c + 1);
            self(self, r, c - 1);
        };

        for (int r = 0; r < rows; ++r) {
            for (int c = 0; c < cols; ++c) {
                if (grid[r][c] == '1') {
                    count++;
                    dfs(dfs, r, c);
                }
            }
        }
        return count;
    }

    // 3. Topological Sort (Kahn's Algorithm)
    // Time: O(V + E)
    static std::vector<int> topologicalSort(int n, const std::vector<std::vector<int>>& edges) {
        std::vector<std::vector<int>> adj(n);
        std::vector<int> inDegree(n, 0);

        for (const auto& edge : edges) {
            adj[edge[0]].push_back(edge[1]);
            inDegree[edge[1]]++;
        }

        std::queue<int> q;
        for (int i = 0; i < n; ++i) {
            if (inDegree[i] == 0) q.push(i);
        }

        std::vector<int> result;
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            result.push_back(u);

            for (int v : adj[u]) {
                inDegree[v]--;
                if (inDegree[v] == 0) q.push(v);
            }
        }

        if (result.size() != static_cast<size_t>(n)) return {}; // Cycle detected
        return result;
    }
};

// Helper for printing
void printVector(const std::vector<int>& vec) {
    std::cout << "[";
    for (size_t i = 0; i < vec.size(); ++i) {
        std::cout << vec[i] << (i < vec.size() - 1 ? ", " : "");
    }
    std::cout << "]" << std::endl;
}

#ifndef TESTING
#ifndef IS_TEST_BUILD
int main() {
    // 1. BFS
    Graph graph = {
        {0, {1, 2}},
        {1, {0, 3}},
        {2, {0, 3}},
        {3, {1, 2, 4}},
        {4, {3}}
    };
    std::cout << "BFS 0->4: " << GraphTraversal::bfsShortestPath(graph, 0, 4) << std::endl;

    // 2. Islands
    std::vector<std::vector<char>> grid = {
        {'1', '1', '0'},
        {'1', '1', '0'},
        {'0', '0', '1'}
    };
    std::cout << "Islands: " << GraphTraversal::numIslands(grid) << std::endl;

    // 3. Topo Sort
    std::vector<std::vector<int>> edges = {{1, 0}, {2, 0}, {3, 1}, {3, 2}};
    std::cout << "Topo Sort: ";
    printVector(GraphTraversal::topologicalSort(4, edges));

    return 0;
}
#endif
#endif  // !IS_TEST_BUILD
