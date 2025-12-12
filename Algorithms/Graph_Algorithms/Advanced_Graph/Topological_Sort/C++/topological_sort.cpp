/**
 * Topological Sort Implementation (C++)
 * 
 * Topological sort is a linear ordering of vertices in a DAG
 * such that for every edge (u, v), u comes before v.
 */

#include <vector>
#include <queue>
#include <unordered_map>
#include <algorithm>

std::vector<int> topologicalSortKahn(
    const std::unordered_map<int, std::vector<int>>& graph) {
    
    if (graph.empty()) {
        return {};
    }
    
    // Calculate in-degrees
    std::unordered_map<int, int> inDegree;
    for (const auto& pair : graph) {
        inDegree[pair.first] = 0;
    }
    
    for (const auto& pair : graph) {
        for (int neighbor : pair.second) {
            inDegree[neighbor]++;
        }
    }
    
    // Find vertices with in-degree 0
    std::queue<int> q;
    for (const auto& pair : inDegree) {
        if (pair.second == 0) {
            q.push(pair.first);
        }
    }
    
    std::vector<int> result;
    
    while (!q.empty()) {
        int vertex = q.front();
        q.pop();
        result.push_back(vertex);
        
        // Reduce in-degree of neighbors
        auto it = graph.find(vertex);
        if (it != graph.end()) {
            for (int neighbor : it->second) {
                inDegree[neighbor]--;
                if (inDegree[neighbor] == 0) {
                    q.push(neighbor);
                }
            }
        }
    }
    
    // Check for cycle
    if (result.size() != inDegree.size()) {
        return {};  // Cycle detected
    }
    
    return result;
}

bool isDAG(const std::unordered_map<int, std::vector<int>>& graph) {
    auto result = topologicalSortKahn(graph);
    return !result.empty() && result.size() == graph.size();
}

// Example usage (uncomment to use)
/*
#include <iostream>
int main() {
    std::unordered_map<int, std::vector<int>> graph = {
        {1, {2, 4}},
        {2, {3}},
        {3, {}},
        {4, {}}
    };
    
    std::cout << "Topological Sort Example:" << std::endl;
    auto order = topologicalSortKahn(graph);
    
    std::cout << "Topological order: ";
    for (int v : order) {
        std::cout << v << " ";
    }
    std::cout << std::endl;
    
    std::cout << "Is DAG: " << (isDAG(graph) ? "true" : "false") << std::endl;
    
    return 0;
}
*/

