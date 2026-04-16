/**
 * DFS (Depth-First Search) Implementation (C++)
 * Time Complexity: O(V + E)
 */

#include <vector>
#include <stack>
#include <unordered_map>
#include <unordered_set>
#include <algorithm>
#include <functional>

using namespace std;

vector<int> dfsAdjacencyList(const unordered_map<int, vector<int>>& graph, int start) {
    /**
     * DFS traversal using adjacency list (iterative)
     */
    if (graph.find(start) == graph.end()) {
        return {};
    }
    
    vector<int> result;
    stack<int> st;
    unordered_set<int> visited;
    
    st.push(start);
    
    while (!st.empty()) {
        int vertex = st.top();
        st.pop();
        
        if (visited.find(vertex) == visited.end()) {
            visited.insert(vertex);
            result.push_back(vertex);
            
            // Add neighbors in reverse order to maintain left-to-right traversal
            if (graph.find(vertex) != graph.end()) {
                vector<int> neighbors = graph.at(vertex);
                reverse(neighbors.begin(), neighbors.end());
                for (int neighbor : neighbors) {
                    if (visited.find(neighbor) == visited.end()) {
                        st.push(neighbor);
                    }
                }
            }
        }
    }
    
    return result;
}

vector<int> dfsWithPath(const unordered_map<int, vector<int>>& graph,
                        int start, int target) {
    /**
     * DFS to find path from start to target
     */
    if (start == target) {
        return {start};
    }
    
    if (graph.find(start) == graph.end() || graph.find(target) == graph.end()) {
        return {};
    }
    
    stack<pair<int, vector<int>>> st;
    unordered_set<int> visited;
    
    st.push({start, {start}});
    
    while (!st.empty()) {
        auto [vertex, path] = st.top();
        st.pop();
        
        if (vertex == target) {
            return path;
        }
        
        if (visited.find(vertex) == visited.end()) {
            visited.insert(vertex);
            
            if (graph.find(vertex) != graph.end()) {
                vector<int> neighbors = graph.at(vertex);
                reverse(neighbors.begin(), neighbors.end());
                for (int neighbor : neighbors) {
                    if (visited.find(neighbor) == visited.end()) {
                        vector<int> newPath = path;
                        newPath.push_back(neighbor);
                        st.push({neighbor, newPath});
                    }
                }
            }
        }
    }
    
    return {};  // No path found
}

bool dfsDetectCycle(const unordered_map<int, vector<int>>& graph, bool directed) {
    /**
     * Detect cycle in graph using DFS
     */
    unordered_set<int> visited;
    unordered_set<int> recStack;
    
    function<bool(int, int)> hasCycle = [&](int vertex, int parent) -> bool {
        visited.insert(vertex);
        if (directed) {
            recStack.insert(vertex);
        }
        
        if (graph.find(vertex) != graph.end()) {
            for (int neighbor : graph.at(vertex)) {
                if (visited.find(neighbor) == visited.end()) {
                    if (hasCycle(neighbor, directed ? -1 : vertex)) {
                        return true;
                    }
                } else if (directed) {
                    if (recStack.find(neighbor) != recStack.end()) {
                        return true;
                    }
                } else if (neighbor != parent) {
                    return true;
                }
            }
        }
        
        if (directed) {
            recStack.erase(vertex);
        }
        return false;
    };
    
    for (const auto& [vertex, _] : graph) {
        if (visited.find(vertex) == visited.end()) {
            if (hasCycle(vertex, -1)) {
                return true;
            }
        }
    }
    
    return false;
}

