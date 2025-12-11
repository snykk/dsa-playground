/**
 * Floyd-Warshall Algorithm Implementation (C++)
 * Time Complexity: O(V³)
 */

#include <vector>
#include <climits>
#include <algorithm>

using namespace std;

vector<vector<int>> floydWarshall(
    const vector<vector<pair<int, int>>>& graph, int numVertices) {
    /**
     * Floyd-Warshall algorithm to find shortest distances between all pairs
     * graph: adjacency list representation
     */
    vector<vector<int>> dist(numVertices, vector<int>(numVertices, INT_MAX));
    
    // Initialize distance matrix
    for (int i = 0; i < numVertices; ++i) {
        dist[i][i] = 0;
    }
    
    // Initialize with direct edges
    for (int u = 0; u < numVertices; ++u) {
        for (const auto& [v, weight] : graph[u]) {
            dist[u][v] = weight;
        }
    }
    
    // Floyd-Warshall algorithm
    for (int k = 0; k < numVertices; ++k) {
        for (int i = 0; i < numVertices; ++i) {
            for (int j = 0; j < numVertices; ++j) {
                if (dist[i][k] != INT_MAX && dist[k][j] != INT_MAX) {
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
                }
            }
        }
    }
    
    return dist;
}


