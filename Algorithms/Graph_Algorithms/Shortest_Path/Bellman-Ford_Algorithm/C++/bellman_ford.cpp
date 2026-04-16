/**
 * Bellman-Ford Algorithm Implementation (C++)
 * Time Complexity: O(V * E)
 */

#include <vector>
#include <unordered_map>
#include <climits>
#include <algorithm>

using namespace std;

struct Edge {
    int u, v, weight;
};

unordered_map<int, int> bellmanFord(
    const vector<Edge>& edges, int numVertices, int start) {
    /**
     * Bellman-Ford algorithm to find shortest distances
     * Returns empty map if negative cycle exists
     */
    unordered_map<int, int> distances;

    if (numVertices == 0) {
        return distances;
    }

    // Initialize distances
    for (int i = 0; i < numVertices; ++i) {
        distances[i] = INT_MAX;
    }
    distances[start] = 0;
    
    // Relax edges V-1 times
    for (int i = 0; i < numVertices - 1; ++i) {
        for (const auto& edge : edges) {
            if (distances[edge.u] != INT_MAX && 
                distances[edge.u] + edge.weight < distances[edge.v]) {
                distances[edge.v] = distances[edge.u] + edge.weight;
            }
        }
    }
    
    // Check for negative cycles
    for (const auto& edge : edges) {
        if (distances[edge.u] != INT_MAX && 
            distances[edge.u] + edge.weight < distances[edge.v]) {
            return {};  // Negative cycle detected
        }
    }
    
    return distances;
}


