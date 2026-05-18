/**
 * Kosaraju's Algorithm Implementation (C++)
 * 
 * Finds all strongly connected components in a directed graph
 */

#include <vector>
#include <unordered_map>
#include <stack>
#include <algorithm>

void dfs1(const std::unordered_map<int, std::vector<int>>& graph,
          int vertex, std::vector<bool>& visited, std::stack<int>& finishOrder) {
    visited[vertex] = true;
    auto it = graph.find(vertex);
    if (it != graph.end()) {
        for (int neighbor : it->second) {
            if (!visited[neighbor]) {
                dfs1(graph, neighbor, visited, finishOrder);
            }
        }
    }
    finishOrder.push(vertex);
}

void dfs2(const std::unordered_map<int, std::vector<int>>& reversedGraph,
          int vertex, std::vector<bool>& visited, std::vector<int>& component) {
    visited[vertex] = true;
    component.push_back(vertex);
    auto it = reversedGraph.find(vertex);
    if (it != reversedGraph.end()) {
        for (int neighbor : it->second) {
            if (!visited[neighbor]) {
                dfs2(reversedGraph, neighbor, visited, component);
            }
        }
    }
}

std::vector<std::vector<int>> kosarajuSCC(
    const std::unordered_map<int, std::vector<int>>& graph) {
    
    if (graph.empty()) {
        return {};
    }
    
    // Find max vertex to size visited array
    int maxVertex = 0;
    for (const auto& pair : graph) {
        maxVertex = std::max(maxVertex, pair.first);
        for (int v : pair.second) {
            maxVertex = std::max(maxVertex, v);
        }
    }
    
    std::vector<bool> visited(maxVertex + 1, false);
    std::stack<int> finishOrder;
    
    // First DFS: get finish order
    for (const auto& pair : graph) {
        if (!visited[pair.first]) {
            dfs1(graph, pair.first, visited, finishOrder);
        }
    }
    
    // Reverse graph
    std::unordered_map<int, std::vector<int>> reversedGraph;
    for (const auto& pair : graph) {
        for (int neighbor : pair.second) {
            reversedGraph[neighbor].push_back(pair.first);
        }
    }
    
    // Second DFS on reversed graph
    std::fill(visited.begin(), visited.end(), false);
    std::vector<std::vector<int>> sccs;
    
    while (!finishOrder.empty()) {
        int vertex = finishOrder.top();
        finishOrder.pop();
        
        if (!visited[vertex]) {
            std::vector<int> component;
            dfs2(reversedGraph, vertex, visited, component);
            sccs.push_back(component);
        }
    }
    
    return sccs;
}

int kosarajuSCCCount(const std::unordered_map<int, std::vector<int>>& graph) {
    auto sccs = kosarajuSCC(graph);
    return sccs.size();
}

bool isStronglyConnected(const std::unordered_map<int, std::vector<int>>& graph) {
    auto sccs = kosarajuSCC(graph);
    return sccs.size() == 1;
}

// Example usage (uncomment to use)
/*
#include <iostream>
#ifndef TESTING
#ifndef IS_TEST_BUILD
int main() {
    std::unordered_map<int, std::vector<int>> graph = {
        {1, {2}},
        {2, {3}},
        {3, {1}},
        {4, {5}},
        {5, {6}},
        {6, {4}}
    };
    
    std::cout << "Kosaraju's Algorithm Example:" << std::endl;
    auto sccs = kosarajuSCC(graph);
    
    std::cout << "Number of SCCs: " << sccs.size() << std::endl;
    std::cout << "Is strongly connected: " << (isStronglyConnected(graph) ? "true" : "false") << std::endl;
    
    return 0;
}
#endif
#endif
*/
