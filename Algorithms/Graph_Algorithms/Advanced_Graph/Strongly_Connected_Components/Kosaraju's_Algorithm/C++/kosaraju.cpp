/**
 * Kosaraju's Algorithm Implementation (C++)
 * 
 * Finds all strongly connected components in a directed graph
 */

#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <stack>
#include <utility>
#include <algorithm>

// Neighbors of v, or an empty list for a vertex that only appears as a neighbor.
static const std::vector<int>& neighborsOf(
    const std::unordered_map<int, std::vector<int>>& graph, int v) {
    static const std::vector<int> none;
    auto it = graph.find(v);
    return it == graph.end() ? none : it->second;
}

// Both passes use an explicit stack of (vertex, next-neighbor index) instead of
// recursion, so a long path or a big cycle cannot overflow the call stack.
// `visited` is a hash set, so any int is a valid vertex id (negative or huge).

// First pass: DFS from start; push each vertex on finishOrder when it finishes.
void dfs1(const std::unordered_map<int, std::vector<int>>& graph,
          int start, std::unordered_set<int>& visited, std::stack<int>& finishOrder) {
    std::vector<std::pair<int, size_t>> work{{start, 0}};
    visited.insert(start);
    while (!work.empty()) {
        int vertex = work.back().first;
        const std::vector<int>& neighbors = neighborsOf(graph, vertex);
        if (work.back().second < neighbors.size()) {
            int neighbor = neighbors[work.back().second++];
            if (visited.insert(neighbor).second) {
                work.push_back({neighbor, 0});
            }
        } else {
            finishOrder.push(vertex);
            work.pop_back();
        }
    }
}

// Second pass: DFS on the reversed graph; every vertex reached joins component.
void dfs2(const std::unordered_map<int, std::vector<int>>& reversedGraph,
          int start, std::unordered_set<int>& visited, std::vector<int>& component) {
    std::vector<std::pair<int, size_t>> work{{start, 0}};
    visited.insert(start);
    component.push_back(start);
    while (!work.empty()) {
        int vertex = work.back().first;
        const std::vector<int>& neighbors = neighborsOf(reversedGraph, vertex);
        if (work.back().second < neighbors.size()) {
            int neighbor = neighbors[work.back().second++];
            if (visited.insert(neighbor).second) {
                component.push_back(neighbor);
                work.push_back({neighbor, 0});
            }
        } else {
            work.pop_back();
        }
    }
}

std::vector<std::vector<int>> kosarajuSCC(
    const std::unordered_map<int, std::vector<int>>& graph) {
    
    if (graph.empty()) {
        return {};
    }
    
    std::unordered_set<int> visited;
    std::stack<int> finishOrder;
    
    // First DFS: get finish order
    for (const auto& pair : graph) {
        if (!visited.count(pair.first)) {
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
    visited.clear();
    std::vector<std::vector<int>> sccs;
    
    while (!finishOrder.empty()) {
        int vertex = finishOrder.top();
        finishOrder.pop();
        
        if (!visited.count(vertex)) {
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

#ifndef IS_TEST_BUILD
#include <iostream>
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
#endif  // !IS_TEST_BUILD
