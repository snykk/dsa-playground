/**
 * Bellman-Ford Algorithm Implementation (C++)
 * Time Complexity: O(V * E)
 */

#include <vector>
#include <unordered_map>
#include <climits>
#include <algorithm>
#include <stdexcept>
#include <string>

using namespace std;

struct Edge {
    int u, v, weight;
};

unordered_map<int, int> bellmanFord(
    const vector<Edge>& edges, int numVertices, int start) {
    /**
     * Bellman-Ford algorithm to find shortest distances
     * Returns empty map if negative cycle exists
     * Throws std::out_of_range if an edge endpoint is outside 0..numVertices-1
     */
    for (const auto& edge : edges) {
        if (edge.u < 0 || edge.u >= numVertices || edge.v < 0 || edge.v >= numVertices) {
            throw out_of_range("bellmanFord: edge (" + to_string(edge.u) + ", " + to_string(edge.v) +
                               ") has an endpoint outside 0.." + to_string(numVertices - 1));
        }
    }

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


