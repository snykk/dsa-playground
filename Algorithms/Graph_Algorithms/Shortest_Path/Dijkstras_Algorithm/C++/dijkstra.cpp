/**
 * Dijkstra's Algorithm Implementation (C++)
 * Time Complexity: O((V + E) log V)
 * Distances are long long (LLONG_MAX = unreachable) so large weights cannot overflow.
 */

#include <vector>
#include <queue>
#include <unordered_map>
#include <unordered_set>
#include <climits>
#include <algorithm>

using namespace std;

// Every vertex starts at LLONG_MAX: the map keys AND vertices that only appear as neighbors.
static unordered_map<int, long long> unreachedDistances(
    const unordered_map<int, vector<pair<int, int>>>& graph) {
    unordered_map<int, long long> distances;
    for (const auto& [vertex, neighbors] : graph) {
        distances[vertex] = LLONG_MAX;
        for (const auto& [neighbor, weight] : neighbors) {
            distances[neighbor] = LLONG_MAX;
        }
    }
    return distances;
}

unordered_map<int, long long> dijkstra(
    const unordered_map<int, vector<pair<int, int>>>& graph, int start) {
    /**
     * Dijkstra's algorithm to find shortest distances from start to all vertices
     * graph: vertex -> [(neighbor, weight), ...]
     */
    if (graph.empty()) {
        return {};
    }

    // Initialize distances
    unordered_map<int, long long> distances = unreachedDistances(graph);
    distances[start] = 0;
    
    // Priority queue: (distance, vertex)
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, 
                   greater<pair<long long, int>>> pq;
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
                
                long long newDist = currentDist + weight;
                if (newDist < distances[neighbor]) {
                    distances[neighbor] = newDist;
                    pq.push({newDist, neighbor});
                }
            }
        }
    }
    
    return distances;
}

pair<long long, vector<int>> dijkstraWithPath(
    const unordered_map<int, vector<pair<int, int>>>& graph,
    int start, int target) {
    /**
     * Dijkstra's algorithm to find shortest path from start to target
     * Returns (distance, path) or (-1, {}) if no path exists
     */
    unordered_map<int, long long> distances = unreachedDistances(graph);
    unordered_map<int, int> previous;  // vertex -> predecessor on the best path so far
    distances[start] = 0;
    
    priority_queue<pair<long long, int>, vector<pair<long long, int>>,
                   greater<pair<long long, int>>> pq;
    pq.push({0, start});
    unordered_set<int> visited;
    
    while (!pq.empty()) {
        auto [currentDist, current] = pq.top();
        pq.pop();
        
        if (current == target) {
            // Reconstruct path: follow predecessors back to the start vertex
            vector<int> path = {target};
            while (path.back() != start) {
                path.push_back(previous.at(path.back()));
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
                
                long long newDist = currentDist + weight;
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


