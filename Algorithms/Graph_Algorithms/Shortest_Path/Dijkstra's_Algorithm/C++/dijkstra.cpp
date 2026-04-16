/**
 * Dijkstra's Algorithm Implementation (C++)
 * Time Complexity: O((V + E) log V)
 */

#include <vector>
#include <queue>
#include <unordered_map>
#include <unordered_set>
#include <climits>
#include <algorithm>

using namespace std;

unordered_map<int, int> dijkstra(
    const unordered_map<int, vector<pair<int, int>>>& graph, int start) {
    /**
     * Dijkstra's algorithm to find shortest distances from start to all vertices
     * graph: vertex -> [(neighbor, weight), ...]
     */
    unordered_map<int, int> distances;

    if (graph.empty()) {
        return distances;
    }

    // Initialize distances
    for (const auto& [vertex, _] : graph) {
        distances[vertex] = INT_MAX;
    }
    distances[start] = 0;
    
    // Priority queue: (distance, vertex)
    priority_queue<pair<int, int>, vector<pair<int, int>>, 
                   greater<pair<int, int>>> pq;
    pq.push({0, start});
    unordered_set<int> visited;
    
    while (!pq.empty()) {
        auto [currentDist, current] = pq.top();
        pq.pop();
        
        if (visited.find(current) != visited.end()) {
            continue;
        }
        
        visited.insert(current);
        
        if (graph.find(current) != graph.end()) {
            for (const auto& [neighbor, weight] : graph.at(current)) {
                if (visited.find(neighbor) != visited.end()) {
                    continue;
                }
                
                int newDist = currentDist + weight;
                if (newDist < distances[neighbor]) {
                    distances[neighbor] = newDist;
                    pq.push({newDist, neighbor});
                }
            }
        }
    }
    
    return distances;
}

pair<int, vector<int>> dijkstraWithPath(
    const unordered_map<int, vector<pair<int, int>>>& graph,
    int start, int target) {
    /**
     * Dijkstra's algorithm to find shortest path from start to target
     * Returns (distance, path) or (-1, {}) if no path exists
     */
    unordered_map<int, int> distances;
    unordered_map<int, int> previous;
    
    for (const auto& [vertex, _] : graph) {
        distances[vertex] = INT_MAX;
        previous[vertex] = -1;
    }
    distances[start] = 0;
    
    priority_queue<pair<int, int>, vector<pair<int, int>>,
                   greater<pair<int, int>>> pq;
    pq.push({0, start});
    unordered_set<int> visited;
    
    while (!pq.empty()) {
        auto [currentDist, current] = pq.top();
        pq.pop();
        
        if (current == target) {
            // Reconstruct path
            vector<int> path;
            int node = target;
            while (node != -1) {
                path.push_back(node);
                node = previous[node];
            }
            reverse(path.begin(), path.end());
            return {currentDist, path};
        }
        
        if (visited.find(current) != visited.end()) {
            continue;
        }
        
        visited.insert(current);
        
        if (graph.find(current) != graph.end()) {
            for (const auto& [neighbor, weight] : graph.at(current)) {
                if (visited.find(neighbor) != visited.end()) {
                    continue;
                }
                
                int newDist = currentDist + weight;
                if (newDist < distances[neighbor]) {
                    distances[neighbor] = newDist;
                    previous[neighbor] = current;
                    pq.push({newDist, neighbor});
                }
            }
        }
    }
    
    return {-1, {}};  // No path found
}


