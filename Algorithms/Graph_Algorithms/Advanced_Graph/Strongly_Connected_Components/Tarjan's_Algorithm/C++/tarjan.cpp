/**
 * Tarjan's Algorithm Implementation (C++)
 * 
 * Finds all strongly connected components using single DFS pass
 */

#include <vector>
#include <unordered_map>
#include <stack>
#include <algorithm>
#include <climits>

void strongConnect(const std::unordered_map<int, std::vector<int>>& graph,
                   int vertex,
                   std::unordered_map<int, int>& indices,
                   std::unordered_map<int, int>& lowLink,
                   std::stack<int>& stack,
                   std::vector<bool>& onStack,
                   std::vector<std::vector<int>>& sccs,
                   int& index) {
    indices[vertex] = index;
    lowLink[vertex] = index;
    index++;
    stack.push(vertex);
    onStack[vertex] = true;
    
    auto it = graph.find(vertex);
    if (it != graph.end()) {
        for (int neighbor : it->second) {
            if (indices.find(neighbor) == indices.end()) {
                strongConnect(graph, neighbor, indices, lowLink, stack, onStack, sccs, index);
                lowLink[vertex] = std::min(lowLink[vertex], lowLink[neighbor]);
            } else if (onStack[neighbor]) {
                lowLink[vertex] = std::min(lowLink[vertex], indices[neighbor]);
            }
        }
    }
    
    if (lowLink[vertex] == indices[vertex]) {
        std::vector<int> component;
        while (true) {
            int w = stack.top();
            stack.pop();
            onStack[w] = false;
            component.push_back(w);
            if (w == vertex) {
                break;
            }
        }
        sccs.push_back(component);
    }
}

std::vector<std::vector<int>> tarjanSCC(
    const std::unordered_map<int, std::vector<int>>& graph) {
    
    if (graph.empty()) {
        return {};
    }
    
    int maxVertex = 0;
    for (const auto& pair : graph) {
        maxVertex = std::max(maxVertex, pair.first);
        for (int v : pair.second) {
            maxVertex = std::max(maxVertex, v);
        }
    }
    
    std::unordered_map<int, int> indices;
    std::unordered_map<int, int> lowLink;
    std::stack<int> stack;
    std::vector<bool> onStack(maxVertex + 1, false);
    std::vector<std::vector<int>> sccs;
    int index = 0;
    
    for (const auto& pair : graph) {
        if (indices.find(pair.first) == indices.end()) {
            strongConnect(graph, pair.first, indices, lowLink, stack, onStack, sccs, index);
        }
    }
    
    return sccs;
}

int tarjanSCCCount(const std::unordered_map<int, std::vector<int>>& graph) {
    auto sccs = tarjanSCC(graph);
    return sccs.size();
}

bool isStronglyConnected(const std::unordered_map<int, std::vector<int>>& graph) {
    return tarjanSCCCount(graph) == 1;
}

// Example usage (uncomment to use)
/*
#include <iostream>
#ifndef TESTING
int main() {
    std::unordered_map<int, std::vector<int>> graph = {
        {1, {2}},
        {2, {3}},
        {3, {1}},
        {4, {5}},
        {5, {6}},
        {6, {4}}
    };
    
    std::cout << "Tarjan's Algorithm Example:" << std::endl;
    auto sccs = tarjanSCC(graph);
    
    std::cout << "Number of SCCs: " << sccs.size() << std::endl;
    std::cout << "Is strongly connected: " << (isStronglyConnected(graph) ? "true" : "false") << std::endl;
    
    return 0;
}
#endif
*/

