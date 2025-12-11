/**
 * BFS (Breadth-First Search) Implementation (C++)
 * Time Complexity: O(V + E)
 */

#include <vector>
#include <queue>
#include <unordered_map>
#include <unordered_set>
#include <algorithm>

using namespace std;

vector<int> bfsAdjacencyList(const unordered_map<int, vector<int>>& graph, int start) {
    /**
     * Basic BFS traversal using adjacency list
     * Returns vertices in BFS order
     */
    if (graph.find(start) == graph.end()) {
        return {};
    }
    
    vector<int> result;
    queue<int> q;
    unordered_set<int> visited;
    
    q.push(start);
    visited.insert(start);
    
    while (!q.empty()) {
        int vertex = q.front();
        q.pop();
        result.push_back(vertex);
        
        // Visit all neighbors
        if (graph.find(vertex) != graph.end()) {
            for (int neighbor : graph.at(vertex)) {
                if (visited.find(neighbor) == visited.end()) {
                    visited.insert(neighbor);
                    q.push(neighbor);
                }
            }
        }
    }
    
    return result;
}

vector<int> bfsWithPath(const unordered_map<int, vector<int>>& graph, 
                        int start, int target) {
    /**
     * BFS to find shortest path from start to target (unweighted graph)
     * Returns shortest path as vector of vertices
     */
    if (start == target) {
        return {start};
    }
    
    if (graph.find(start) == graph.end() || graph.find(target) == graph.end()) {
        return {};
    }
    
    queue<pair<int, vector<int>>> q;
    unordered_set<int> visited;
    
    q.push({start, {start}});
    visited.insert(start);
    
    while (!q.empty()) {
        auto [vertex, path] = q.front();
        q.pop();
        
        if (graph.find(vertex) != graph.end()) {
            for (int neighbor : graph.at(vertex)) {
                if (neighbor == target) {
                    path.push_back(neighbor);
                    return path;
                }
                
                if (visited.find(neighbor) == visited.end()) {
                    visited.insert(neighbor);
                    vector<int> newPath = path;
                    newPath.push_back(neighbor);
                    q.push({neighbor, newPath});
                }
            }
        }
    }
    
    return {};  // No path found
}

vector<vector<int>> bfsLevelOrder(const unordered_map<int, vector<int>>& graph, 
                                   int start) {
    /**
     * BFS traversal returning vertices grouped by level
     */
    if (graph.find(start) == graph.end()) {
        return {};
    }
    
    vector<vector<int>> result;
    queue<int> q;
    unordered_set<int> visited;
    
    q.push(start);
    visited.insert(start);
    
    while (!q.empty()) {
        int levelSize = q.size();
        vector<int> level;
        
        for (int i = 0; i < levelSize; ++i) {
            int vertex = q.front();
            q.pop();
            level.push_back(vertex);
            
            if (graph.find(vertex) != graph.end()) {
                for (int neighbor : graph.at(vertex)) {
                    if (visited.find(neighbor) == visited.end()) {
                        visited.insert(neighbor);
                        q.push(neighbor);
                    }
                }
            }
        }
        
        result.push_back(level);
    }
    
    return result;
}

unordered_map<int, int> bfsShortestDistance(const unordered_map<int, vector<int>>& graph, 
                                             int start) {
    /**
     * Find shortest distance from start to all reachable vertices (unweighted)
     * Returns map of vertex to distance
     */
    unordered_map<int, int> distances;
    
    if (graph.find(start) == graph.end()) {
        return distances;
    }
    
    queue<int> q;
    q.push(start);
    distances[start] = 0;
    
    while (!q.empty()) {
        int vertex = q.front();
        q.pop();
        int currentDistance = distances[vertex];
        
        if (graph.find(vertex) != graph.end()) {
            for (int neighbor : graph.at(vertex)) {
                if (distances.find(neighbor) == distances.end()) {
                    distances[neighbor] = currentDistance + 1;
                    q.push(neighbor);
                }
            }
        }
    }
    
    return distances;
}

