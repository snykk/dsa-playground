/**
 * Ford-Fulkerson Algorithm Implementation (C++)
 */

#include <vector>
#include <unordered_map>
#include <climits>
#include <algorithm>

bool dfsFindPath(const std::unordered_map<int, std::unordered_map<int, int>>& residual,
                 int u, int sink, std::vector<bool>& visited, std::vector<int>& path) {
    if (u == sink) {
        return true;
    }
    
    visited[u] = true;
    auto it = residual.find(u);
    if (it != residual.end()) {
        for (const auto& edge : it->second) {
            int v = edge.first;
            int capacity = edge.second;
            if (!visited[v] && capacity > 0) {
                path.push_back(v);
                if (dfsFindPath(residual, v, sink, visited, path)) {
                    return true;
                }
                path.pop_back();
            }
        }
    }
    return false;
}

int fordFulkerson(const std::unordered_map<int, std::unordered_map<int, int>>& graph,
                  int source, int sink) {
    if (source == sink) {
        return 0;
    }
    
    // Create residual graph
    std::unordered_map<int, std::unordered_map<int, int>> residual = graph;
    
    // Add reverse edges
    for (const auto& u_pair : graph) {
        for (const auto& v_pair : u_pair.second) {
            if (residual.find(v_pair.first) == residual.end() ||
                residual[v_pair.first].find(u_pair.first) == residual[v_pair.first].end()) {
                residual[v_pair.first][u_pair.first] = 0;
            }
        }
    }
    
    int maxFlow = 0;
    
    while (true) {
        std::vector<bool> visited(1000, false);  // Assuming max vertices
        std::vector<int> path = {source};
        
        if (!dfsFindPath(residual, source, sink, visited, path)) {
            break;
        }
        
        // Find minimum capacity
        int minCapacity = INT_MAX;
        for (size_t i = 0; i < path.size() - 1; i++) {
            int u = path[i];
            int v = path[i + 1];
            minCapacity = std::min(minCapacity, residual[u][v]);
        }
        
        // Update residual graph
        for (size_t i = 0; i < path.size() - 1; i++) {
            int u = path[i];
            int v = path[i + 1];
            residual[u][v] -= minCapacity;
            residual[v][u] += minCapacity;
        }
        
        maxFlow += minCapacity;
    }
    
    return maxFlow;
}

// Example usage (uncomment to use)
/*
#include <iostream>
#ifndef TESTING
int main() {
    std::unordered_map<int, std::unordered_map<int, int>> graph = {
        {0, {{1, 16}, {2, 13}}},
        {1, {{2, 10}, {3, 12}}},
        {2, {{1, 4}, {4, 14}}},
        {3, {{2, 9}, {5, 20}}},
        {4, {{3, 7}, {5, 4}}}
    };
    
    std::cout << "Ford-Fulkerson Algorithm Example:" << std::endl;
    int maxFlow = fordFulkerson(graph, 0, 5);
    std::cout << "Maximum flow: " << maxFlow << std::endl;  // 23
    
    return 0;
}
#endif
*/

