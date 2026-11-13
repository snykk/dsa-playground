/**
 * Tarjan's Algorithm Implementation (C++)
 * 
 * Finds all strongly connected components using single DFS pass
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

// Tarjan's DFS from start, written iteratively: `work` holds (vertex, next-neighbor
// index) pairs and plays the role of the call stack, so a long path or a big cycle
// cannot overflow it. Visit order and output match the recursive formulation.
// onStack is a hash set, so any int is a valid vertex id (negative or huge).
void strongConnect(const std::unordered_map<int, std::vector<int>>& graph,
                   int start,
                   std::unordered_map<int, int>& indices,
                   std::unordered_map<int, int>& lowLink,
                   std::stack<int>& stack,
                   std::unordered_set<int>& onStack,
                   std::vector<std::vector<int>>& sccs,
                   int& index) {
    std::vector<std::pair<int, size_t>> work;
    auto discover = [&](int vertex) {
        indices[vertex] = index;
        lowLink[vertex] = index;
        index++;
        stack.push(vertex);
        onStack.insert(vertex);
        work.push_back({vertex, 0});
    };
    
    discover(start);
    while (!work.empty()) {
        int vertex = work.back().first;
        const std::vector<int>& neighbors = neighborsOf(graph, vertex);
        if (work.back().second < neighbors.size()) {
            int neighbor = neighbors[work.back().second++];
            if (indices.find(neighbor) == indices.end()) {
                discover(neighbor);  // descend ("recurse") into neighbor
            } else if (onStack.count(neighbor)) {
                lowLink[vertex] = std::min(lowLink[vertex], indices[neighbor]);
            }
            continue;
        }
        
        // All neighbors done: vertex is finished
        if (lowLink[vertex] == indices[vertex]) {
            std::vector<int> component;
            while (true) {
                int w = stack.top();
                stack.pop();
                onStack.erase(w);
                component.push_back(w);
                if (w == vertex) {
                    break;
                }
            }
            sccs.push_back(component);
        }
        work.pop_back();
        if (!work.empty()) {
            // Back in the caller: propagate the low-link to the parent
            int parent = work.back().first;
            lowLink[parent] = std::min(lowLink[parent], lowLink[vertex]);
        }
    }
}

std::vector<std::vector<int>> tarjanSCC(
    const std::unordered_map<int, std::vector<int>>& graph) {
    
    if (graph.empty()) {
        return {};
    }
    
    std::unordered_map<int, int> indices;
    std::unordered_map<int, int> lowLink;
    std::stack<int> stack;
    std::unordered_set<int> onStack;
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
    
    std::cout << "Tarjan's Algorithm Example:" << std::endl;
    auto sccs = tarjanSCC(graph);
    
    std::cout << "Number of SCCs: " << sccs.size() << std::endl;
    std::cout << "Is strongly connected: " << (isStronglyConnected(graph) ? "true" : "false") << std::endl;
    
    return 0;
}
#endif
#endif
*/
